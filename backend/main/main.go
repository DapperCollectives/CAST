package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	app "github.com/DapperCollectives/CAST/backend/main/server"
	"github.com/joho/godotenv"
)

func main() {
	var err error
	var CWD string

	if CWD = os.Getenv("CWD"); len(CWD) == 0 {
		CWD = "./"
	}

	// Set working directory so relative file paths work
	os.Chdir(CWD)

	// Load .env file if ENV_NAME is not set (i.e. locally)
	if UseDotEnv := os.Getenv("ENV_NAME"); len(UseDotEnv) == 0 {
		err = godotenv.Load(CWD + ".env")
	}
	if err != nil {
		log.Fatalf("Error loading .env file!!!\n")
	}

	a := app.App{}
	a.Initialize(
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("IPFS_KEY"),
		os.Getenv("IPFS_SECRET"),
	)

	a.Run(":5001")

}

////////////
// Routes //
////////////
func Health_get(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode("OK")
}
