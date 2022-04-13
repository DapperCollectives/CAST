package middleware

import (
	"net/http"
	"os"
)

func Cors(next http.Handler) http.Handler {
	env := os.Getenv("APP_ENV")
	enableCors := (env == "DEV")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if enableCors {
			w.Header().Add("Access-Control-Allow-Origin", "*")
			w.Header().Add("Access-Control-Allow-Headers", "*")

			// handle preflight
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
		}
		// Call the next handler, which can be another middleware in the chain, or the final handler.
		next.ServeHTTP(w, r)
	})
}
