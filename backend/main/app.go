package main

import (
	// "errors"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/brudfyi/flow-voting-tool/main/middleware"
	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/thoas/go-funk"
)

type Database shared.Database
type IpfsClient shared.IpfsClient
type SnapshotClient shared.SnapshotClient
type Allowlist shared.Allowlist
type Vote models.Vote
type Proposal models.Proposal
type Community models.Community
type Balance models.Balance

type App struct {
	Router      *mux.Router
	DB          *shared.Database
	IpfsClient  *shared.IpfsClient
	FlowAdapter *shared.FlowAdapter

	SnapshotClient     *shared.SnapshotClient
	Env                string
	AdminAllowlist     shared.Allowlist
	CommunityBlocklist shared.Allowlist
}

var (
	allowListMap = map[string]string{
		"TEST":    "./main/constants/admin-allowlist-test.json",
		"DEV":     "./main/constants/admin-allowlist-dev.json",
		"STAGING": "./main/constants/admin-allowlist-staging.json",
		"PROD":    "./main/constants/admin-allowlist.json",
	}
	blockListMap = map[string]string{
		"TEST":    "./main/constants/community-blocklist-test.json",
		"DEV":     "./main/constants/community-blocklist-dev.json",
		"STAGING": "./main/constants/community-blocklist-staging.json",
		"PROD":    "./main/constants/community-blocklist.json",
	}
	allowedFileTypes = []string{"image/jpg", "image/jpeg", "image/png"}
)

const (
	maxFileSize = 5 * 1024 * 1024 // 5MB
)

//////////////////////
// INSTANCE METHODS //
//////////////////////

func (a *App) Initialize(user, password, dbname, dbhost, dbport, ipfsKey, ipfsSecret string) {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})
	log.Logger = log.Logger.Level(zerolog.InfoLevel)

	// Env
	env := os.Getenv("APP_ENV")
	if flag.Lookup("test.v") != nil {
		env = "TEST"
		os.Setenv("APP_ENV", "TEST")
	} else if len(env) == 0 {
		env = "PROD"
	}
	a.Env = strings.TrimSpace(env)
	log.Info().Msgf("APP_ENV=%s", a.Env)

	////////////
	// Clients
	////////////

	// Postgres
	connectionString :=
		fmt.Sprintf("postgres://%s:%s@%s:%s/%s", user, password, dbhost, dbport, dbname)
	a.ConnectDB(connectionString)
	// IPFS
	a.IpfsClient = shared.NewIpfsClient(ipfsKey, ipfsSecret)
	// Flow
	a.FlowAdapter = shared.NewFlowClient()
	// Snapshot
	a.SnapshotClient = shared.NewSnapshotClient(os.Getenv("SNAPSHOT_BASE_URL"))

	// Router
	a.Router = mux.NewRouter()
	a.initializeRoutes()

	// Middlewares
	a.Router.Use(mux.CORSMethodMiddleware(a.Router))
	a.Router.Use(middleware.Logger)
	a.Router.Use(middleware.Cors)

	// init allowlist
	a.initializeAllowAndBlocklists()
}

func (a *App) initializeAllowAndBlocklists() {
	if a.Env == "" {
		a.AdminAllowlist = shared.Allowlist{}
		a.CommunityBlocklist = shared.Allowlist{}
		return
	}
	allowlistPath := allowListMap[a.Env]
	blocklistPath := blockListMap[a.Env]

	// allowlist
	jsonFile, err := os.Open(allowlistPath)
	if err != nil {
		log.Error().Err(err).Msg("Error opening allowlist")
	}
	defer jsonFile.Close()

	bytes, _ := ioutil.ReadAll(jsonFile)
	var allowlist shared.Allowlist

	json.Unmarshal(bytes, &allowlist)
	a.AdminAllowlist = allowlist

	//blocklist
	blocklistFile, err := os.Open(blocklistPath)
	if err != nil {
		fmt.Println(err)
	}
	defer jsonFile.Close()

	blocklistBytes, _ := ioutil.ReadAll(blocklistFile)
	var blocklist shared.Allowlist

	json.Unmarshal(blocklistBytes, &blocklist)
	a.CommunityBlocklist = blocklist
}

func (a *App) Run(addr string) {
	log.Info().Msgf("Starting server on %s ...", addr)
	log.Fatal().Err(http.ListenAndServe(":5001", a.Router)).Msgf("Server at %s crashed!", addr)
}

func (a *App) ConnectDB(database_url string) {
	var database shared.Database
	var err error

	log.Info().Msg("Connecting to PostgreSQL at " + database_url)

	database.Context = context.Background()
	database.Name = "flow_snapshot"
	database.Conn, err = pgxpool.Connect(database.Context, database_url)
	database.Env = &a.Env
	if err != nil {
		log.Fatal().Err(err).Msg("Error creating Postsgres conn pool")
	} else {
		a.DB = &database
		log.Info().Msgf("Successfully created Postgres conn pool")
	}
}

func (a *App) initializeRoutes() {
	// Health
	a.Router.HandleFunc("/", a.health).Methods("GET")
	a.Router.HandleFunc("/api", a.health).Methods("GET")
	// File upload
	a.Router.HandleFunc("/upload", a.upload).Methods("POST")
	// Communities
	a.Router.HandleFunc("/communities", a.getCommunities).Methods("GET")
	a.Router.HandleFunc("/communities/{id:[0-9]+}", a.getCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{id:[0-9]+}", a.updateCommunity).Methods("PUT", "OPTIONS")
	a.Router.HandleFunc("/communities", a.createCommunity).Methods("POST", "OPTIONS")
	// Proposals
	a.Router.HandleFunc("/proposals/{id:[0-9]+}", a.getProposal).Methods("GET")
	a.Router.HandleFunc("/proposals/{id:[0-9]+}", a.updateProposal).Methods("PUT", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals", a.getProposalsForCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals/{id:[0-9]+}", a.getProposal).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals", a.createProposal).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals/{id:[0-9]+}", a.updateProposal).Methods("PUT", "OPTIONS")
	// Votes
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes", a.getVotesForProposal).Methods("GET")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes/{addr:0x[a-zA-Z0-9]{16}}", a.getVoteForAddress).Methods("GET")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes", a.createVoteForProposal).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/votes/{addr:0x[a-zA-Z0-9]{16}}", a.getVotesForAddress).Methods("GET")
	// a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes/{addr:0x[a-zA-Z0-9]{16}}", a.updateVoteForProposal).Methods("PUT", "OPTIONS")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/results", a.getResultsForProposal)
	// Strategies
	a.Router.HandleFunc("/voting-strategies", a.getVotingStrategies).Methods("GET")
	// Utilities
	a.Router.HandleFunc("/accounts/admin", a.getAdminList).Methods("GET")
	a.Router.HandleFunc("/accounts/blocklist", a.getCommunityBlocklist).Methods("GET")
	a.Router.HandleFunc("/accounts/{addr:0x[a-zA-Z0-9]{16}}/{blockHeight:[0-9]+}", a.getAccountAtBlockHeight).Methods("GET")
	a.Router.HandleFunc("/latest-snapshot", a.getLatestSnapshot).Methods("GET")
}

////////////
// ROUTES //
////////////

func (a *App) health(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, "OK")
}

// Upload
func (a *App) upload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxFileSize)
	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		log.Error().Err(err).Msgf("file larger than max file size of %v\n", maxFileSize)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		log.Error().Err(err).Msg("FormFile retrieval error")
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer file.Close()

	// pin file to ipfs
	pin, err := a.IpfsClient.PinFile(file, handler.Filename)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning file to IPFS")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// ensure mime type is allowed
	mime := handler.Header.Get("Content-Type")
	if !funk.Contains(allowedFileTypes, mime) {
		msg := fmt.Sprintf("uploaded file type %s not allowed", mime)
		log.Error().Msg(msg)
		respondWithError(w, http.StatusBadRequest, msg)
		return
	}

	// anonymous struct for response
	resp := struct {
		Cid string `json:"cid"`
	}{
		Cid: pin.IpfsHash,
	}

	respondWithJSON(w, http.StatusOK, resp)
}

// Votes

func (a *App) getResultsForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposalId, err := strconv.Atoi(vars["proposalId"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID")
		return
	}
	// First, get the proposal by proposalId
	p := models.Proposal{ID: proposalId}
	if err := p.GetProposalById(a.DB); err != nil {
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Proposal not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	proposalResults := models.ProposalResults{Proposal_id: p.ID}
	tallyErr := proposalResults.Tally(a.DB, &p)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, tallyErr.Error())
		return
	}

	// Send Proposal Results
	respondWithJSON(w, http.StatusOK, proposalResults)
}

func (a *App) getVotesForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposalId, err := strconv.Atoi(vars["proposalId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID")
		return
	}

	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))

	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	votes, totalRecords, err := models.GetVotesForProposal(a.DB, start, count, proposalId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	response := shared.GetPaginatedResponseWithPayload(votes, start, count, totalRecords)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getVoteForAddress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposalId, err := strconv.Atoi(vars["proposalId"])
	addr := vars["addr"]

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID")
		return
	}

	v := models.Vote{Proposal_id: proposalId, Addr: addr}
	if err := v.GetVote(a.DB); err != nil {
		// TODO: for some reason switch err doesn't match pgx.ErrNoRows.
		// So I've added .Error() to convert to a string comparison
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Vote not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}
	respondWithJSON(w, http.StatusOK, v)
}

func (a *App) createVoteForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposalId, err := strconv.Atoi(vars["proposalId"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID")
		return
	}

	var v models.Vote
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&v); err != nil {
		log.Error().Err(err).Msg("Invalid request payload")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	defer r.Body.Close()

	v.Proposal_id = proposalId

	// validate blocklist
	if err := a.validateBlocklist(v.Addr); err != nil {
		fmt.Println(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// validate user hasn't already voted
	existingVote := models.Vote{Proposal_id: v.Proposal_id, Addr: v.Addr}
	if err := existingVote.GetVote(a.DB); err == nil {
		log.Error().Msgf("address %s has already voted for proposal %d", v.Addr, v.Proposal_id)
		respondWithError(w, http.StatusInternalServerError, errors.New("address has already voted").Error())
		return
	}

	// get the proposal for extra validations
	p := models.Proposal{ID: proposalId}
	if err := p.GetProposalById(a.DB); err != nil {
		log.Error().Err(err).Msgf("error fetching proposal by id: %v", proposalId)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// check that proposal is live
	if !p.IsLive() {
		err = errors.New("user cannot vote on inactive proposal")
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// validate proper message format
	// <proposalId>:<choice>:<timestamp>
	if err := v.ValidateMessage(p); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// validate choice exists on proposal
	if err := v.ValidateChoice(p); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// validate user signature
	if err := a.FlowAdapter.UserSignatureValidate(v.Addr, v.Message, v.Composite_signatures, v.TransactionId); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	v.Proposal_id = proposalId

	// get proposal blockheight + account balance at that blockheight
	proposal := models.Proposal{ID: proposalId}
	if err := proposal.GetProposalById(a.DB); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID")
		return
	}

	// Fetch account balance at blockheight
	balance := &models.Balance{
		Addr:        v.Addr,
		BlockHeight: proposal.Block_height,
	}

	// First, check if we already have a balance for this blockheight's address
	if err = balance.GetBalanceByAddressAndBlockHeight(a.DB); err != nil && err.Error() != pgx.ErrNoRows.Error() {
		log.Error().Err(err).Msg("error querying address balance at blockheight")
		respondWithError(w, http.StatusInternalServerError, "error querying address balance at blockheight")
		return
	}

	// If balance doesnt exist, fetch it and save it
	if balance.ID == "" {
		// TODO: dont throw error, retroactively fix data
		err = balance.FetchAddressBalanceAtBlockHeight(a.SnapshotClient, v.Addr, proposal.Block_height)
		if err != nil {
			log.Error().Err(err).Msg("error fetching address balance at blockheight.")
			respondWithError(w, http.StatusInternalServerError, "Error fetching address balance at blockheight")
			return
		}

		if err = balance.CreateBalance(a.DB); err != nil {
			log.Error().Err(err).Msg("error saving balance to DB")
			respondWithError(w, http.StatusInternalServerError, "error saving balance to DB")
			return
		}
	}

	// Validate balance is sufficient to cast vote
	if err = p.ValidateBalance(balance); err != nil {
		log.Error().Err(err).Msg("Account may not vote on proposal: insufficient balance")
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// pin to ipfs
	pin, err := a.IpfsClient.PinJson(v)
	// If request fails, it may be because of an issue with Pinata.
	// Continue on, and worker will retroactively populate
	if err != nil {
		log.Error().Err(err).Msg("error pinning vote to IPFS")
	} else {
		v.Cid = &pin.IpfsHash
	}

	if err := v.CreateVote(a.DB); err != nil {
		log.Error().Err(err).Msg("Couldnt create vote")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, v)
}

func (a *App) getVotesForAddress(w http.ResponseWriter, r *http.Request) {
	var proposalIds []int

	vars := mux.Vars(r)
	address := vars["addr"]
	// Parse proposalIds array
	json.Unmarshal([]byte(r.FormValue("proposalIds")), &proposalIds)

	// Params for pagination
	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))

	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	// Get votes
	votes, totalRecords, err := models.GetVotesForAddress(a.DB, start, count, address, &proposalIds)
	if err != nil {
		log.Error().Err(err).Msg("error querying votes for address")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Transpose into PaginatedResponse struct
	response := shared.GetPaginatedResponseWithPayload(votes, start, count, totalRecords)

	respondWithJSON(w, http.StatusOK, response)
}

// Proposals

func (a *App) getProposalsForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))
	status := r.FormValue("status")
	order := r.FormValue("order")

	// Default order is reverse-chronological order
	// chronological order, use order=asc
	if order == "" {
		order = "desc"
	}
	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	proposals, totalRecords, err := models.GetProposalsForCommunity(a.DB, start, count, communityId, status, order)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := shared.GetPaginatedResponseWithPayload(proposals, start, count, totalRecords)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID")
		return
	}

	p := models.Proposal{ID: id}
	if err := p.GetProposalById(a.DB); err != nil {
		// TODO: for some reason switch err doesn't match pgx.ErrNoRows.
		// So I've added .Error() to convert to a string comparison
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Proposal not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

func (a *App) createProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	var p models.Proposal
	p.Community_id = communityId

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&p); err != nil {
		msg := "Invalid request payload"
		log.Error().Err(err).Msg(msg)
		respondWithError(w, http.StatusBadRequest, msg)
		return
	}
	defer r.Body.Close()

	// validate timestamp of request/message
	if err := validateTimestamp(p.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// check allowlist and sig
	if err := a.validateAllowlistWithSig(p.Creator_addr, p.Timestamp, p.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// get latest snapshotted blockheight
	snapshot, err := a.SnapshotClient.GetLatestSnapshot()
	if err != nil {
		log.Error().Err(err).Msg("error fetching latest snapshot")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	p.Block_height = snapshot.Block_height

	// pin to ipfs
	pin, err := a.IpfsClient.PinJson(p)
	if err != nil {
		log.Error().Err(err).Msg("error pinning proposal to IPFS")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	p.Cid = &pin.IpfsHash

	// validate proposal fields
	validate := validator.New()
	vErr := validate.Struct(p)
	if vErr != nil {
		log.Error().Err(vErr).Msg("invalid proposal")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	// create proposal
	if err := p.CreateProposal(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, p)
}

func (a *App) updateProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid proposal ID")
		respondWithError(w, http.StatusBadRequest, "Invalid proposal ID")
		return
	}

	p := models.Proposal{ID: id}

	// get current proposal from DB
	if err := p.GetProposalById(a.DB); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	var payload models.UpdateProposalRequestPayload
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Check that status update is valid
	// For now we are assuming proposals are creating with status 'published' and may be cancelled.
	if payload.Status != "cancelled" {
		respondWithError(w, http.StatusBadRequest, "You may only change a proposal's status to 'cancelled'")
		return
	}

	// validate timestamp of request/message
	if err := validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}
	// check allowlist and sig
	if err := a.validateAllowlistWithSig(p.Creator_addr, payload.Timestamp, payload.Composite_signature); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// Set new status
	p.Status = &payload.Status

	// Pin to ipfs
	pin, err := a.IpfsClient.PinJson(p)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}
	p.Cid = &pin.IpfsHash

	// ensure the proposal is not currently active
	// now := time.Now().UTC()
	// if now.After(p.Start_time) && now.Before(p.End_time) {
	// 	respondWithError(w, http.StatusInternalServerError, "Proposal is currently active")
	// 	return
	// }

	// Finally, update DB
	if err := p.UpdateProposal(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

// Communities

func (a *App) getCommunities(w http.ResponseWriter, r *http.Request) {
	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))

	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	communities, totalRecords, err := models.GetCommunities(a.DB, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	response := shared.GetPaginatedResponseWithPayload(communities, start, count, totalRecords)

	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	c := models.Community{ID: id}
	if err := c.GetCommunity(a.DB); err != nil {
		// TODO: for some reason switch err doesn't match pgx.ErrNoRows.
		// So I've added .Error() to convert to a string comparison
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Community not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	respondWithJSON(w, http.StatusOK, c)
}

func (a *App) createCommunity(w http.ResponseWriter, r *http.Request) {
	var c models.Community
	decoder := json.NewDecoder(r.Body)

	// Add parameter validation here

	if err := decoder.Decode(&c); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// validate timestamp of request/message
	if err := validateTimestamp(c.Timestamp, 60); err != nil {
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// check allowlist and sig
	if err := a.validateAllowlistWithSig(c.Creator_addr, c.Timestamp, c.Composite_signatures); err != nil {
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// pin to ipfs
	pin, err := a.IpfsClient.PinJson(c)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}
	c.Cid = &pin.IpfsHash

	validate := validator.New()
	vErr := validate.Struct(c)
	if vErr != nil {
		log.Error().Err(vErr).Msg("invalid community")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	if err := c.CreateCommunity(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, c)
}

func (a *App) updateCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid community ID")
		return
	}

	var c models.Community
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&c); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()
	c.ID = id

	if err := c.UpdateCommunity(a.DB); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, c)
}

// Voting Strategies
func (a *App) getVotingStrategies(w http.ResponseWriter, r *http.Request) {
	vs, err := models.GetVotingStrategies(a.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, vs)
}

//////////////
// Accounts //
//////////////

func (a *App) getAccountAtBlockHeight(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]
	var blockHeight uint64
	blockHeight, err := strconv.ParseUint(vars["blockHeight"], 10, 64)
	if err != nil {
		log.Error().Err(err).Msg("error parsing blockHeight param")
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	b := Balance{}
	if err = a.SnapshotClient.GetAddressBalanceAtBlockHeight(addr, blockHeight, &b); err != nil {
		log.Error().Err(err).Msgf("error getting account %s at blockheight %d", addr, blockHeight)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, b)
}

func (a *App) getAdminList(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, a.AdminAllowlist.Addresses)
}

func (a *App) getCommunityBlocklist(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, a.CommunityBlocklist.Addresses)
}

func (a *App) getLatestSnapshot(w http.ResponseWriter, r *http.Request) {
	snapshot, err := a.SnapshotClient.GetLatestSnapshot()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	respondWithJSON(w, http.StatusOK, snapshot)
}

/////////////
// HELPERS //
/////////////

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

// bruting this for now, but will ticket to convert the next two funcs to use a middleware pattern
func (a *App) validateAllowlistWithSig(addr string, message string, sigs *[]shared.CompositeSignature) error {
	isAdmin := funk.Contains(a.AdminAllowlist.Addresses, addr)

	if !isAdmin {
		return errors.New("user does not have permission")
	}

	if err := a.FlowAdapter.UserSignatureValidate(addr, message, sigs, ""); err != nil {
		return err
	}
	return nil
}

// blocklist check
func (a *App) validateBlocklist(addr string) error {
	isBlocked := funk.Contains(a.CommunityBlocklist.Addresses, addr)
	isTest := flag.Lookup("test.v") != nil

	if isBlocked && !isTest {
		return errors.New("user does not have permission")
	}
	return nil
}

// same comment as above. need to move this to conditional middleware
func validateTimestamp(timestamp string, expiry int) error {
	// check timestamp and ensure no longer than expiry seconds has passed
	stamp, _ := strconv.ParseInt(timestamp, 10, 64)
	uxTime := time.Unix(stamp/1000, (stamp%1000)*1000*1000)
	diff := time.Now().UTC().Sub(uxTime).Seconds()
	if diff > float64(expiry) {
		err := errors.New("timestamp on request has expired")
		log.Error().Err(err).Msgf("expiry error: %v", diff)
		return err
	}
	return nil
}
