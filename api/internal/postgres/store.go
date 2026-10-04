package postgres

import (
	"context"
	_ "embed"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var schema string

var ErrAttemptConflict = errors.New("attempt ID already has a different payload")

type AttemptInput struct {
	AttemptID  string `json:"attemptId"`
	ConceptID  string `json:"conceptId"`
	QuestionID string `json:"questionId"`
	Grade      string `json:"grade"`
}

type Attempt struct {
	AttemptInput
	CreatedAt time.Time `json:"createdAt"`
}

type QuestionProgress struct {
	ConceptID      string    `json:"conceptId"`
	QuestionID     string    `json:"questionId"`
	AttemptCount   int64     `json:"attemptCount"`
	LatestGrade    string    `json:"latestGrade"`
	LastReviewedAt time.Time `json:"lastReviewedAt"`
}

type Store struct{ pool *pgxpool.Pool }

func NewStore(pool *pgxpool.Pool) *Store { return &Store{pool: pool} }

// ApplySchema is the explicit, repeatable initial migration. Future schema
// changes require numbered migrations instead of altering this bootstrap SQL.
func ApplySchema(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, schema)
	return err
}

func scanAttempt(row pgx.Row) (Attempt, error) {
	var attempt Attempt
	err := row.Scan(&attempt.AttemptID, &attempt.ConceptID, &attempt.QuestionID, &attempt.Grade, &attempt.CreatedAt)
	attempt.CreatedAt = attempt.CreatedAt.UTC()
	return attempt, err
}

func (s *Store) Append(ctx context.Context, input AttemptInput) (Attempt, bool, error) {
	attempt, err := scanAttempt(s.pool.QueryRow(ctx, `
		INSERT INTO review_attempts (attempt_id, concept_id, question_id, grade)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (attempt_id) DO NOTHING
		RETURNING attempt_id, concept_id, question_id, grade, created_at`,
		input.AttemptID, input.ConceptID, input.QuestionID, input.Grade))
	if err == nil {
		return attempt, true, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return Attempt{}, false, err
	}
	// A subsequent READ COMMITTED statement sees the competing committed insert.
	// The primary key, not a preceding existence check, serializes retries.
	attempt, err = scanAttempt(s.pool.QueryRow(ctx, `
		SELECT attempt_id, concept_id, question_id, grade, created_at
		FROM review_attempts WHERE attempt_id=$1`, input.AttemptID))
	if err != nil {
		return Attempt{}, false, err
	}
	if attempt.AttemptInput != input {
		return Attempt{}, false, ErrAttemptConflict
	}
	return attempt, false, nil
}

func (s *Store) Progress(ctx context.Context) ([]QuestionProgress, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT DISTINCT ON (concept_id, question_id)
			concept_id, question_id,
			COUNT(*) OVER (PARTITION BY concept_id, question_id), grade, created_at
		FROM review_attempts
		ORDER BY concept_id, question_id, created_at DESC, attempt_id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	progress := make([]QuestionProgress, 0)
	for rows.Next() {
		var item QuestionProgress
		if err := rows.Scan(&item.ConceptID, &item.QuestionID, &item.AttemptCount, &item.LatestGrade, &item.LastReviewedAt); err != nil {
			return nil, err
		}
		item.LastReviewedAt = item.LastReviewedAt.UTC()
		progress = append(progress, item)
	}
	return progress, rows.Err()
}

func (s *Store) Ping(ctx context.Context) error { return s.pool.Ping(ctx) }
