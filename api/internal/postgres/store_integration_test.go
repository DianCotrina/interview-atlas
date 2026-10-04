//go:build integration

package postgres

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/DianCotrina/interview-atlas/api/internal/testdb"
	"github.com/jackc/pgx/v5/pgxpool"
)

func openStore(t *testing.T) (*Store, *pgxpool.Pool) {
	t.Helper()
	pool, err := pgxpool.NewWithConfig(context.Background(), testdb.Config(t))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	if err := ApplySchema(context.Background(), pool); err != nil {
		t.Fatal(err)
	}
	return NewStore(pool), pool
}

func TestAppendDeduplicates(t *testing.T) {
	store, pool := openStore(t)
	ctx := context.Background()
	input := AttemptInput{AttemptID: "11111111-1111-4111-8111-111111111111", ConceptID: "big-o", QuestionID: "time-and-space", Grade: "hesitated"}
	first, created, err := store.Append(ctx, input)
	if err != nil || !created {
		t.Fatalf("first append: created=%v err=%v", created, err)
	}
	again, created, err := store.Append(ctx, input)
	if err != nil || created || !again.CreatedAt.Equal(first.CreatedAt) {
		t.Fatalf("replay changed history: created=%v err=%v", created, err)
	}
	input.Grade = "knew-it"
	if _, _, err := store.Append(ctx, input); !errors.Is(err, ErrAttemptConflict) {
		t.Fatalf("want conflict, got %v", err)
	}
	input.Grade = "hesitated"
	input.QuestionID = "nested-loops"
	if _, _, err := store.Append(ctx, input); !errors.Is(err, ErrAttemptConflict) {
		t.Fatalf("question change should conflict: %v", err)
	}
	if err := ApplySchema(ctx, pool); err != nil {
		t.Fatal(err)
	}
	progress, err := store.Progress(ctx)
	if err != nil || len(progress) != 1 || progress[0].AttemptCount != 1 {
		t.Fatalf("reapplying schema changed history: %v %v", progress, err)
	}
}

func TestConcurrentRetriesCreateOneAttempt(t *testing.T) {
	store, _ := openStore(t)
	ctx := context.Background()
	input := AttemptInput{AttemptID: "22222222-2222-4222-8222-222222222222", ConceptID: "big-o", QuestionID: "nested-loops", Grade: "did-not-know"}
	var createdCount atomic.Int32
	var wg sync.WaitGroup
	start := make(chan struct{})
	for range 12 {
		wg.Go(func() {
			<-start
			_, created, err := store.Append(ctx, input)
			if err != nil {
				t.Error(err)
			}
			if created {
				createdCount.Add(1)
			}
		})
	}
	close(start)
	wg.Wait()
	progress, err := store.Progress(ctx)
	if err != nil || createdCount.Load() != 1 || len(progress) != 1 || progress[0].AttemptCount != 1 {
		t.Fatalf("duplicates: created=%d progress=%v err=%v", createdCount.Load(), progress, err)
	}
}

func TestProgressSurvivesNewConnection(t *testing.T) {
	ctx := context.Background()
	config := testdb.Config(t)
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		t.Fatal(err)
	}
	if err := ApplySchema(ctx, pool); err != nil {
		pool.Close()
		t.Fatal(err)
	}
	store := NewStore(pool)
	input := AttemptInput{AttemptID: "33333333-3333-4333-8333-333333333333", ConceptID: "big-o", QuestionID: "nested-loops", Grade: "hesitated"}
	if _, _, err := store.Append(ctx, input); err != nil {
		t.Fatal(err)
	}
	input.AttemptID = "44444444-4444-4444-8444-444444444444"
	input.Grade = "knew-it"
	latest, _, err := store.Append(ctx, input)
	if err != nil {
		t.Fatal(err)
	}
	pool.Close()
	reopened, err := pgxpool.NewWithConfig(ctx, config.Copy())
	if err != nil {
		t.Fatal(err)
	}
	defer reopened.Close()
	progress, err := NewStore(reopened).Progress(ctx)
	if err != nil || len(progress) != 1 || progress[0].AttemptCount != 2 || progress[0].LatestGrade != "knew-it" || !progress[0].LastReviewedAt.Equal(latest.CreatedAt) {
		t.Fatalf("history was not preserved: %v %v", progress, err)
	}
}

func TestEmptyProgressIsAnArray(t *testing.T) {
	store, _ := openStore(t)
	progress, err := store.Progress(context.Background())
	if err != nil || progress == nil || len(progress) != 0 {
		t.Fatalf("want empty nonnil progress: %v %v", progress, err)
	}
}
