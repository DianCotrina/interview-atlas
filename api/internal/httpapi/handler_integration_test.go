//go:build integration

package httpapi

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DianCotrina/interview-atlas/api/internal/postgres"
	"github.com/DianCotrina/interview-atlas/api/internal/testdb"
	"github.com/jackc/pgx/v5/pgxpool"
)

func testServer(t *testing.T) (*httptest.Server, *pgxpool.Pool) {
	t.Helper()
	pool, err := pgxpool.NewWithConfig(context.Background(), testdb.Config(t))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	if err := postgres.ApplySchema(context.Background(), pool); err != nil {
		t.Fatal(err)
	}
	server := httptest.NewServer(NewHandler(postgres.NewStore(pool), []string{"http://127.0.0.1:3000"}))
	t.Cleanup(server.Close)
	return server, pool
}

func request(t *testing.T, server *httptest.Server, method, path, body, origin string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(method, server.URL+path, strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	if origin != "" {
		req.Header.Set("Origin", origin)
	}
	if method == http.MethodOptions {
		req.Header.Set("Access-Control-Request-Method", "POST")
		req.Header.Set("Access-Control-Request-Headers", "content-type")
	}
	res, err := server.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { res.Body.Close() })
	return res
}

func TestAttemptHTTPContract(t *testing.T) {
	server, _ := testServer(t)
	body := `{"attemptId":"11111111-1111-4111-8111-111111111111","conceptId":"big-o","questionId":"nested-loops","grade":"hesitated"}`
	var first postgres.Attempt
	for i, want := range []int{201, 200} {
		res := request(t, server, "POST", "/api/attempts", body, "http://127.0.0.1:3000")
		if res.StatusCode != want {
			t.Fatalf("want %d got %d", want, res.StatusCode)
		}
		var attempt postgres.Attempt
		if err := json.NewDecoder(res.Body).Decode(&attempt); err != nil {
			t.Fatal(err)
		}
		if attempt.AttemptID == "" || attempt.CreatedAt.IsZero() {
			t.Fatal("incomplete attempt response")
		}
		if i == 0 {
			first = attempt
		} else if !first.CreatedAt.Equal(attempt.CreatedAt) {
			t.Fatal("retry timestamp changed")
		}
	}
	res := request(t, server, "POST", "/api/attempts", strings.Replace(body, "hesitated", "knew-it", 1), "")
	if res.StatusCode != 409 {
		t.Fatalf("want conflict got %d", res.StatusCode)
	}
	res = request(t, server, "GET", "/api/progress", "", "")
	var progress []postgres.QuestionProgress
	if res.StatusCode != 200 {
		t.Fatal(res.StatusCode)
	}
	if err := json.NewDecoder(res.Body).Decode(&progress); err != nil {
		t.Fatal(err)
	}
	if len(progress) != 1 || progress[0].AttemptCount != 1 || progress[0].LatestGrade != "hesitated" {
		t.Fatalf("wrong progress: %v", progress)
	}
}

func TestInvalidRequestsDoNotInsert(t *testing.T) {
	server, _ := testServer(t)
	cases := []struct {
		body   string
		status int
	}{
		{`{"attemptId":"11111111-1111-4111-8111-111111111111","conceptId":"big-o","questionId":"nested-loops","grade":"hesitated","extra":true}`, 400},
		{`{"attemptId":"11111111-1111-4111-8111-111111111111","conceptId":"big-o","questionId":"nested-loops","grade":"hesitated"} {}`, 400},
		{`null`, 400}, {`[]`, 400}, {`{`, 400},
		{`{"extra":"` + strings.Repeat("a", 17*1024) + `"}`, 413},
	}
	for _, tc := range cases {
		res := request(t, server, "POST", "/api/attempts", tc.body, "")
		if res.StatusCode != tc.status {
			t.Fatalf("want %d got %d", tc.status, res.StatusCode)
		}
	}
	res := request(t, server, "GET", "/api/progress", "", "")
	body, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatal(err)
	}
	if strings.TrimSpace(string(body)) != "[]" {
		t.Fatalf("invalid writes created progress: %s", body)
	}
}

func TestCORSAndUnavailableDatabase(t *testing.T) {
	server, pool := testServer(t)
	allowed := request(t, server, "OPTIONS", "/api/attempts", "", "http://127.0.0.1:3000")
	if allowed.StatusCode != 204 || allowed.Header.Get("Access-Control-Allow-Origin") != "http://127.0.0.1:3000" {
		t.Fatalf("allowed preflight: %d %v", allowed.StatusCode, allowed.Header)
	}
	denied := request(t, server, "OPTIONS", "/api/attempts", "", "https://untrusted.example")
	if denied.StatusCode != 403 || denied.Header.Get("Access-Control-Allow-Origin") != "" {
		t.Fatal("disallowed origin accepted")
	}
	pool.Close()
	failedWrite := request(t, server, "POST", "/api/attempts", `{"attemptId":"11111111-1111-4111-8111-111111111111","conceptId":"big-o","questionId":"nested-loops","grade":"hesitated"}`, "")
	if failedWrite.StatusCode != 503 {
		t.Fatalf("unavailable database accepted write: %d", failedWrite.StatusCode)
	}
	for _, path := range []string{"/api/progress", "/healthz"} {
		res := request(t, server, "GET", path, "", "")
		data, err := io.ReadAll(res.Body)
		if err != nil {
			t.Fatal(err)
		}
		if res.StatusCode != 503 || strings.Contains(string(data), "pool") || strings.Contains(string(data), "postgres") {
			t.Fatalf("unsanitized outage: %d %s", res.StatusCode, data)
		}
	}
}
