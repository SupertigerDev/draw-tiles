package utils

import (
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

func FormatFirstError(err error) string {
	if err == nil {
		return ""
	}

	var ve validator.ValidationErrors
	if errors.As(err, &ve) && len(ve) > 0 {
		fe := ve[0]
		return fmt.Sprintf("%s %s", fe.Field(), msgForTag(fe.Tag(), fe.Param()))
	}

	return "Invalid request"
}

func msgForTag(tag string, param string) string {
	switch tag {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email address"
	case "min":
		return fmt.Sprintf("must be at least %s characters", param)
	case "max":
		return fmt.Sprintf("must be at most %s characters", param)
	}
	return "contains an invalid value"
}
