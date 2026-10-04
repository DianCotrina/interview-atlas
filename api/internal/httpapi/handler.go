package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"
	"strings"
	"time"

	"github.com/DianCotrina/interview-atlas/api/internal/postgres"
)

const maxBodyBytes = 16 * 1024
const databaseTimeout = 3 * time.Second

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, struct {
		Error apiError `json:"error"`
	}{apiError{Code: code, Message: message}})
}

func NewHandler(store *postgres.Store, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/attempts", func(w http.ResponseWriter, r *http.Request) {
		mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if err != nil || mediaType != "application/json" {
			writeError(w, 400, "invalid_request", "Content-Type must be application/json")
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
		// Read the bounded body completely before decoding so oversized invalid
		// JSON consistently gets 413, even if an unknown field appears first.
		body, err := io.ReadAll(r.Body)
		if err != nil {
			var tooLarge *http.MaxBytesError
			if errors.As(err, &tooLarge) {
				writeError(w, 413, "body_too_large", "Request body exceeds 16 KiB")
			} else {
				writeError(w, 400, "invalid_request", "Could not read request body")
			}
			return
		}
		decoder := json.NewDecoder(strings.NewReader(string(body)))
		decoder.DisallowUnknownFields()
		var input *postgres.AttemptInput
		if err := decoder.Decode(&input); err != nil || input == nil {
			writeError(w, 400, "invalid_request", "Expected one review-attempt JSON object")
			return
		}
		var extra interface{}
		if err := decoder.Decode(&extra); err != io.EOF {
			writeError(w, 400, "invalid_request", "Expected exactly one JSON object")
			return
		}
		if err := validateAttempt(*input); err != nil {
			writeError(w, 400, "invalid_request", err.Error())
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), databaseTimeout)
		defer cancel()
		attempt, created, err := store.Append(ctx, *input)
		if errors.Is(err, postgres.ErrAttemptConflict) {
			writeError(w, 409, "attempt_conflict", "This attempt ID belongs to a different review")
			return
		}
		if err != nil {
			writeError(w, 503, "progress_unavailable", "Study progress is temporarily unavailable")
			return
		}
		status := http.StatusOK
		if created {
			status = http.StatusCreated
		}
		writeJSON(w, status, attempt)
	})
	mux.HandleFunc("GET /api/progress", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), databaseTimeout)
		defer cancel()
		progress, err := store.Progress(ctx)
		if err != nil {
			writeError(w, 503, "progress_unavailable", "Study progress is temporarily unavailable")
			return
		}
		writeJSON(w, 200, progress)
	})
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), databaseTimeout)
		defer cancel()
		if err := store.Ping(ctx); err != nil {
			writeError(w, 503, "progress_unavailable", "Study progress is temporarily unavailable")
			return
		}
		writeJSON(w, 200, struct {
			Status string `json:"status"`
		}{"ok"})
	})
	allowed := make(map[string]bool, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		allowed[origin] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Vary", "Origin")
		origin := r.Header.Get("Origin")
		if origin != "" {
			if !allowed[origin] {
				writeError(w, 403, "origin_denied", "This origin is not allowed")
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		if r.Method == http.MethodOptions {
			method := r.Header.Get("Access-Control-Request-Method")
			if origin == "" || !allowed[origin] || (method != "GET" && method != "POST") {
				writeError(w, 403, "origin_denied", "This preflight is not allowed")
				return
			}
			for _, header := range strings.Split(r.Header.Get("Access-Control-Request-Headers"), ",") {
				if header = strings.TrimSpace(strings.ToLower(header)); header != "" && header != "content-type" {
					writeError(w, 403, "origin_denied", "This request header is not allowed")
					return
				}
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		mux.ServeHTTP(w, r)
	})
}
