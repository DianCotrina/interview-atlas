CREATE TABLE IF NOT EXISTS review_attempts (
    attempt_id uuid PRIMARY KEY,
    concept_id text NOT NULL,
    question_id text NOT NULL,
    grade text NOT NULL CHECK (grade IN ('knew-it', 'hesitated', 'did-not-know')),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS review_attempts_question_time
    ON review_attempts (concept_id, question_id, created_at DESC, attempt_id DESC);
