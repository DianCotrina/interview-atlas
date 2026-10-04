package httpapi

import (
	"strings"
	"testing"

	"github.com/DianCotrina/interview-atlas/api/internal/postgres"
)

func validInput() postgres.AttemptInput {
	return postgres.AttemptInput{AttemptID: "11111111-1111-4111-8111-111111111111", ConceptID: "big-o", QuestionID: "time-and-space", Grade: "hesitated"}
}

func TestValidateAttempt(t *testing.T) {
	if err := validateAttempt(validInput()); err != nil {
		t.Fatal(err)
	}
	cases := []struct {
		name   string
		change func(*postgres.AttemptInput)
	}{
		{"invalid UUID", func(in *postgres.AttemptInput) { in.AttemptID = "not-a-uuid" }},
		{"UUID nonhex", func(in *postgres.AttemptInput) { in.AttemptID = "zzzzzzzz-1111-4111-8111-111111111111" }},
		{"unsupported grade", func(in *postgres.AttemptInput) { in.Grade = "perfect" }},
		{"empty concept", func(in *postgres.AttemptInput) { in.ConceptID = "" }},
		{"large concept", func(in *postgres.AttemptInput) { in.ConceptID = strings.Repeat("a", 129) }},
		{"large question", func(in *postgres.AttemptInput) { in.QuestionID = strings.Repeat("a", 129) }},
		{"bad slug", func(in *postgres.AttemptInput) { in.QuestionID = "Time and space" }},
		{"double hyphen", func(in *postgres.AttemptInput) { in.ConceptID = "big--o" }},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			input := validInput()
			tc.change(&input)
			if validateAttempt(input) == nil {
				t.Fatal("invalid attempt accepted")
			}
		})
	}
}
