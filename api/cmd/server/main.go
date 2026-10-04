package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/DianCotrina/interview-atlas/api/internal/httpapi"
	"github.com/DianCotrina/interview-atlas/api/internal/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
)

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	addr := envOr("API_ADDR", "127.0.0.1:8088")
	host, _, err := net.SplitHostPort(addr)
	if err != nil || !net.ParseIP(host).IsLoopback() {
		log.Fatal("API_ADDR must bind to a loopback IP; public hosting requires an authentication decision")
	}
	origins := strings.Split(envOr("ALLOWED_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000"), ",")
	for i, origin := range origins {
		origin = strings.TrimSpace(origin)
		origins[i] = origin
		parsed, err := url.Parse(origin)
		if err != nil || parsed.Scheme != "http" || parsed.User != nil || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" || (parsed.Hostname() != "localhost" && !net.ParseIP(parsed.Hostname()).IsLoopback()) {
			log.Fatal("ALLOWED_ORIGINS must contain exact local HTTP origins")
		}
	}
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatal("Invalid database configuration")
	}
	config.ConnConfig.ConnectTimeout = 3 * time.Second
	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatal("Could not initialize database pool")
	}
	defer pool.Close()
	server := &http.Server{Addr: addr, Handler: httpapi.NewHandler(postgres.NewStore(pool), origins), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 5 * time.Second, WriteTimeout: 8 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 16 * 1024}
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("Could not bind local API at %s: %v", addr, err)
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	result := make(chan error, 1)
	go func() { result <- server.Serve(listener) }()
	log.Printf("Local study progress API listening on http://%s", addr)
	select {
	case err := <-result:
		if !errors.Is(err, http.ErrServerClosed) {
			log.Printf("API stopped: %v", err)
		}
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			_ = server.Close()
		}
	}
}
