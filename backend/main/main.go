package main

import (
	"log"
	"os"

	app "github.com/DapperCollectives/CAST/backend/main/server"
	"github.com/joho/godotenv"
)

func main() {
	var err error
	var CWD string

	if CWD = os.Getenv("CWD"); len(CWD) == 0 {
		CWD = "./"
		os.Setenv("CWD", CWD)
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
	a.Initialize()
	a.Run()
}
