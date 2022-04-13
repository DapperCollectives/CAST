package middleware

import (
	"flag"
	"net/http"

	"github.com/rs/zerolog/log"
)

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if flag.Lookup("test.v") == nil {
			log.Info().Msgf("%s %s", r.Method, r.RequestURI)
		}
		next.ServeHTTP(w, r)
	})
}
