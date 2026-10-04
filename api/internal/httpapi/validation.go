package httpapi

import (
	"errors"
	"regexp"

	"github.com/DianCotrina/interview-atlas/api/internal/postgres"
)

var uuidPattern = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func validateAttempt(input postgres.AttemptInput) error {
	if !uuidPattern.MatchString(input.AttemptID) {
		return errors.New("attemptId must be a canonical lowercase UUID")
	}
	if len(input.ConceptID) > 128 || !slugPattern.MatchString(input.ConceptID) {
		return errors.New("conceptId must be a slug of 1–128 characters")
	}
	if len(input.QuestionID) > 128 || !slugPattern.MatchString(input.QuestionID) {
		return errors.New("questionId must be a slug of 1–128 characters")
	}
	switch input.Grade {
	case "knew-it", "hesitated", "did-not-know":
		return nil
	default:
		return errors.New("grade must be knew-it, hesitated, or did-not-know")
	}
}
