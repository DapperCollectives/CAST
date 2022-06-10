package server

import (
	// "errors"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/middleware"
	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/DapperCollectives/CAST/backend/main/strategies"
	"github.com/axiomzen/envconfig"
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
type List models.List
type ListRequest models.ListPayload
type ListUpdatePayload models.ListUpdatePayload
type CommunityUser models.CommunityUser
type CommunityUserPayload models.CommunityUserPayload
type UserCommunity models.UserCommunity

type TxOptionsAddresses []string

type App struct {
	Router      *mux.Router
	DB          *shared.Database
	IpfsClient  *shared.IpfsClient
	FlowAdapter *shared.FlowAdapter

	SnapshotClient     *shared.SnapshotClient
	TxOptionsAddresses []string
	Env                string
	AdminAllowlist     shared.Allowlist
	CommunityBlocklist shared.Allowlist
	Config             shared.Config
}

var allowedFileTypes = []string{"image/jpg", "image/jpeg", "image/png", "image/gif"}

type Strategy interface {
	FetchBalance(db *shared.Database, b *models.Balance, sc *shared.SnapshotClient) (*models.Balance, error)
	TallyVotes(votes []*models.VoteWithBalance, proposalId int) (models.ProposalResults, error)
	GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error)
	GetVotes(votes []*models.VoteWithBalance, proposal *models.Proposal) ([]*models.VoteWithBalance, error)
}

var strategyMap = map[string]Strategy{
	"token-weighted-default":        &strategies.TokenWeightedDefault{},
	"staked-token-weighted-default": &strategies.StakedTokenWeightedDefault{},
	"one-address-one-vote":          &strategies.OneAddressOneVote{},
	"balance-of-nfts":               &strategies.BalanceOfNfts{},
}

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

	// Set App-wide Config
	err := envconfig.Process("FVT", &a.Config)
	if err != nil {
		log.Error().Err(err).Msg("error reading configuration ")
		os.Exit(1)
	}

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
	if os.Getenv("FLOW_ENV") == "" {
		os.Setenv("FLOW_ENV", "emulator")
	}
	a.FlowAdapter = shared.NewFlowClient(os.Getenv("FLOW_ENV"))
	// Snapshot
	a.SnapshotClient = shared.NewSnapshotClient(os.Getenv("SNAPSHOT_BASE_URL"))
	// address to vote options mapping
	a.TxOptionsAddresses = strings.Fields(os.Getenv("TX_OPTIONS_ADDRS"))

	// Router
	a.Router = mux.NewRouter()
	a.initializeRoutes()

	// Middlewares
	a.Router.Use(mux.CORSMethodMiddleware(a.Router))
	a.Router.Use(middleware.Logger)
	a.Router.Use(middleware.UseCors(a.Config))
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
	a.Router.HandleFunc("/upload", a.upload).Methods("POST", "OPTIONS")
	// Communities
	a.Router.HandleFunc("/communities", a.getCommunities).Methods("GET")
	a.Router.HandleFunc("/communities-for-homepage", a.getCommunitiesForHomePage).Methods("GET")
	a.Router.HandleFunc("/communities/{id:[0-9]+}", a.getCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{id:[0-9]+}", a.updateCommunity).Methods("PATCH", "OPTIONS")
	a.Router.HandleFunc("/communities", a.createCommunity).Methods("POST", "OPTIONS")
	// Proposals
	a.Router.HandleFunc("/proposals/{id:[0-9]+}", a.getProposal).Methods("GET")
	a.Router.HandleFunc("/proposals/{id:[0-9]+}", a.updateProposal).Methods("PUT", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals", a.getProposalsForCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals/{id:[0-9]+}", a.getProposal).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals", a.createProposal).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals/{id:[0-9]+}", a.updateProposal).Methods("PUT", "OPTIONS")
	// Lists
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/lists", a.getListsForCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/lists", a.createListForCommunity).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/lists/{id:[0-9]+}", a.getList).Methods("GET")
	a.Router.HandleFunc("/lists/{id:[0-9]+}/add", a.addAddressesToList).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/lists/{id:[0-9]+}/remove", a.removeAddressesFromList).Methods("POST", "OPTIONS")
	// Votes
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes", a.getVotesForProposal).Methods("GET")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes/{addr:0x[a-zA-Z0-9]+}", a.getVoteForAddress).Methods("GET")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes", a.createVoteForProposal).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/votes/{addr:0x[a-zA-Z0-9]+}", a.getVotesForAddress).Methods("GET")
	//Strategies
	// a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes/{addr:0x[a-zA-Z0-9]{16}}", a.updateVoteForProposal).Methods("PUT", "OPTIONS")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/results", a.getResultsForProposal)
	// Types
	a.Router.HandleFunc("/voting-strategies", a.getVotingStrategies).Methods("GET")
	a.Router.HandleFunc("/community-categories", a.getCommunityCategories).Methods("GET")
	// Users
	a.Router.HandleFunc("/users/{addr:0x[a-zA-Z0-9]{16}}/communities", a.handleGetUserCommunities).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/users", a.handleCreateCommunityUser).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/users", a.handleGetCommunityUsers).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/users/{addr:0x[a-zA-Z0-9]{16}}/{userType:[a-zA-Z]+}", a.handleRemoveUserRole).Methods("DELETE", "OPTIONS")
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
	respondWithJSON(w, http.StatusOK, "OK!!")
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

	// get the votes for proposal
	votes, err := models.GetAllVotesForProposal(a.DB, proposalId, *p.Strategy)
	if err != nil {
		// print the error to the console
		log.Error().Err(err).Msg("Error getting votes for proposal")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// look up the strategy for proposal
	s := strategyMap[*p.Strategy]
	if s == nil {
		respondWithError(w, http.StatusInternalServerError, "Strategy not found")
		return
	}

	proposalResults, err := s.TallyVotes(votes, proposalId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
	order := r.FormValue("order")

	if order == "" {
		order = "desc"
	}
	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	votes, totalRecords, err := models.GetVotesForProposal(a.DB, start, count, order, proposalId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	//get the proposal by Id
	proposal := models.Proposal{ID: proposalId}
	if err := proposal.GetProposalById(a.DB); err != nil {
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Proposal not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	s := strategyMap[*proposal.Strategy]
	if s == nil {
		respondWithError(w, http.StatusInternalServerError, "Invalid Strategy")
		return
	}

	votesWithWeights, err := s.GetVotes(votes, &proposal)
	if err != nil {
		respondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	response := shared.GetPaginatedResponseWithPayload(votesWithWeights, start, count, totalRecords)
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

	voteWithBalance := &models.VoteWithBalance{
		Vote: models.Vote{
			Addr:        addr,
			Proposal_id: proposalId,
		}}

	if err := voteWithBalance.GetVote(a.DB); err != nil {
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Vote not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	//get proposal
	proposal := models.Proposal{ID: proposalId}
	if err := proposal.GetProposalById(a.DB); err != nil {
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Proposal not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	//lookup the strategy for proposal
	s := strategyMap[*proposal.Strategy]
	if s == nil {
		respondWithError(w, http.StatusInternalServerError, "Strategy not found")
		return
	}

	// get the vote weight
	weight, err := s.GetVoteWeightForBalance(voteWithBalance, &proposal)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	voteWithBalance.Weight = &weight
	respondWithJSON(w, http.StatusOK, voteWithBalance)
}

func (a *App) getVotesForAddress(w http.ResponseWriter, r *http.Request) {
	var proposalIds []int

	vars := mux.Vars(r)
	addr := vars["addr"]
	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))

	err := json.Unmarshal([]byte(r.FormValue("proposalIds")), &proposalIds)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID")
		return
	}

	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	votes, totalRecords, err := models.GetVotesForAddress(a.DB, start, count, addr, &proposalIds)
	if err != nil {
		log.Error().Err(err).Msg("error getting votes for address")
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	var votesWithBalances []*models.VoteWithBalance

	for _, vote := range votes {

		//get proposal
		proposal := models.Proposal{ID: vote.Proposal_id}
		if err := proposal.GetProposalById(a.DB); err != nil {
			switch err.Error() {
			case pgx.ErrNoRows.Error():
				respondWithError(w, http.StatusNotFound, "Proposal not found")
			default:
				respondWithError(w, http.StatusInternalServerError, err.Error())
			}
			return
		}

		//lookup the stratefy for this proposal
		s := strategyMap[*proposal.Strategy]
		if s == nil {
			respondWithError(w, http.StatusInternalServerError, "Strategy not found")
			return
		}

		//get the vote weight
		weight, err := s.GetVoteWeightForBalance(vote, &proposal)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		vote.Weight = &weight
		votesWithBalances = append(votesWithBalances, vote)
	}

	// Transpose into PaginatedResponse struct
	response := shared.GetPaginatedResponseWithPayload(votesWithBalances, start, count, totalRecords)
	respondWithJSON(w, http.StatusOK, response)
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

	// validate the user is not on community's blocklist
	if err = a.validateBlocklist(v.Addr, p.Community_id); err != nil {
		log.Error().Err(err).Msgf(fmt.Sprintf("Address %v is on blocklist for community id %v\n", v.Addr, p.Community_id))
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// validate proper message format
	// <proposalId>:<choice>:<timestamp>
	if err := v.ValidateMessage(p); err != nil && v.TransactionId == "" {
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
	// validate user signature
	if err := a.FlowAdapter.UserTransactionValidate(v.Addr, v.Message, v.Composite_signatures, v.TransactionId, a.TxOptionsAddresses, p.Choices); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	v.Proposal_id = proposalId

	s := strategyMap[*p.Strategy]
	if s == nil {
		respondWithError(w, http.StatusInternalServerError, "Strategy not found")
		return
	}

	emptyBalance := &models.Balance{
		Addr:        v.Addr,
		BlockHeight: p.Block_height,
	}

	balance, err := s.FetchBalance(a.DB, emptyBalance, a.SnapshotClient)
	if err != nil {
		log.Error().Err(err).Msgf("error fetching balance for address %v", v.Addr)
	}

	// create the voteWithBalance struct
	vb := models.VoteWithBalance{
		Vote:                    v,
		PrimaryAccountBalance:   &balance.PrimaryAccountBalance,
		SecondaryAccountBalance: &balance.SecondaryAccountBalance,
		StakingBalance:          &balance.StakingBalance,
	}

	//get the vote weight
	weight, err := s.GetVoteWeightForBalance(&vb, &p)
	if err != nil {
		log.Error().Err(err).Msg("error getting vote weight")
		respondWithError(w, http.StatusInternalServerError, "error getting vote weight")
		return
	}

	// Validate balance is sufficient to cast vote
	if err = p.ValidateBalance(weight); err != nil {
		log.Error().Err(err).Msg("Account may not vote on proposal: insufficient balance")
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	//pin to ipfs
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
	if err := a.validateTimestamp(p.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	if err := models.EnsureRoleForCommunity(a.DB, p.Creator_addr, communityId, "author"); err != nil {
		errMsg := fmt.Sprintf("account %s is not an author for community %d", p.Creator_addr, p.Community_id)
		log.Error().Err(err).Msg(errMsg)
		respondWithError(w, http.StatusForbidden, errMsg)
		return
	}
	if err := a.validateSignature(p.Creator_addr, p.Timestamp, p.Composite_signatures); err != nil {
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

	var community models.Community
	community.ID = communityId
	if err := community.GetCommunity(a.DB); err != nil {
		log.Error().Err(err).Msg("error fetching community")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if *community.Only_authors_to_submit {
		if err := models.EnsureRoleForCommunity(a.DB, p.Creator_addr, communityId, "author"); err != nil {
			errMsg := fmt.Sprintf("account %s is not an author for community %d", p.Creator_addr, p.Community_id)
			log.Error().Err(err).Msg(errMsg)
			respondWithError(w, http.StatusForbidden, errMsg)
			return
		}
	} else {
		var contract = &shared.Contract{
			Name:        community.Contract_name,
			Addr:        community.Contract_addr,
			Public_path: community.Public_path,
			Threshold:   community.Threshold,
		}

		hasBalance, err := a.FlowAdapter.EnforceTokenThreshold(p.Creator_addr, contract)
		if err != nil {
			log.Error().Err(err).Msg("error enforcing token threshold")
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if !hasBalance {
			errMsg := "insufficient token balance to create proposal"
			log.Error().Err(err).Msg(errMsg)
			respondWithError(w, http.StatusForbidden, errMsg)
			return
		}
	}

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

	log.Debug().Msgf("payload: %s", payload.Signing_addr)

	// Check that status update is valid
	// For now we are assuming proposals are creating with status 'published' and may be cancelled.
	if payload.Status != "cancelled" {
		respondWithError(w, http.StatusBadRequest, "You may only change a proposal's status to 'cancelled'")
		return
	}
	// validate that the signing address is an author for the community
	if err := models.EnsureRoleForCommunity(a.DB, payload.Signing_addr, p.Community_id, "author"); err != nil {
		errMsg := fmt.Sprintf("account %s is not an author for community %d", p.Creator_addr, p.Community_id)
		log.Error().Err(err).Msg(errMsg)
		respondWithError(w, http.StatusForbidden, errMsg)
		return
	}

	// validate timestamp of request/message
	if err := a.validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}
	// validate signature
	if err := a.validateSignature(p.Creator_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
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

func (a *App) getCommunitiesForHomePage(w http.ResponseWriter, r *http.Request) {
	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))

	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	communities, totalRecords, err := models.GetCommunitiesForHomePage(a.DB, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	response := shared.GetPaginatedResponseWithPayload(communities, start, count, totalRecords)

	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) createCommunity(w http.ResponseWriter, r *http.Request) {
	var c models.Community
	var payload models.CreateCommunityRequestPayload
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&payload); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	c = payload.Community

	// validate timestamp of request/message
	if err := a.validateTimestamp(c.Timestamp, 60); err != nil {
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// TODO: since we removed the allowlist, some sort of rate limiting will probably be necessary

	if err := a.validateSignature(c.Creator_addr, c.Timestamp, c.Composite_signatures); err != nil {
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

	// Create Community
	if err := c.CreateCommunity(a.DB); err != nil {
		log.Error().Err(err).Msg("db error creating community")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	// Grant roles to community creator
	if err := models.GrantRolesToCommunityCreator(a.DB, c.Creator_addr, c.ID); err != nil {
		log.Error().Err(err).Msg("db error adding community creator roles")
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	// Grant any additional roles
	if payload.Additional_admins != nil {
		for _, addr := range *payload.Additional_admins {
			if err := models.GrantAdminRolesToAddress(a.DB, c.ID, addr); err != nil {
				respondWithError(w, http.StatusInternalServerError, err.Error())
				return
			}
		}
	}

	if payload.Additional_authors != nil {
		for _, addr := range *payload.Additional_authors {
			if err := models.GrantAuthorRolesToAddress(a.DB, c.ID, addr); err != nil {
				respondWithError(w, http.StatusInternalServerError, err.Error())
				return
			}
		}
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

	var payload models.UpdateCommunityRequestPayload

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&payload); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Fetch community
	var c = models.Community{ID: id}
	if err := c.GetCommunity(a.DB); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid request: no community with ID %d", id))
		return
	}

	// validate is commuity creator
	// TODO: update to validating address is admin
	if err := c.CanUpdateCommunity(a.DB, payload.Signing_addr); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// validate timestamp of request/message
	if err := a.validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// validate user signature
	if err := a.validateSignature(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// Update community
	if err := c.UpdateCommunity(a.DB, &payload); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	c = models.Community{ID: c.ID}
	if err := c.GetCommunity(a.DB); err != nil {
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

func (a *App) getCommunityCategories(w http.ResponseWriter, r *http.Request) {
	vs, err := models.GetCommunityTypes(a.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, vs)
}

////////////
// Lists //
///////////

func (a *App) getListsForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	lists, err := models.GetListsForCommunity(a.DB, communityId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, lists)
}

func (a *App) getList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}
	list := models.List{ID: id}

	if err = list.GetListById(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, list)
}

func (a *App) createListForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
	}

	payload := models.ListPayload{}

	payload.Community_id = communityId

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&payload); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Ensure list doesnt already exist

	if existingList, _ := models.GetListForCommunityByType(a.DB, communityId, *payload.List_type); existingList.ID > 0 {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("list of type %s already exists for community %d", *payload.List_type, communityId))
		return
	}

	// validate payload fields
	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		log.Error().Err(vErr).Msg("validation error in list payload")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	// validate timestamp of request/message
	if err := a.validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}
	if err := models.EnsureRoleForCommunity(a.DB, payload.Signing_addr, payload.Community_id, "admin"); err != nil {
		errMsg := fmt.Sprintf("account %s is not an admin for community %d", payload.Signing_addr, payload.Community_id)
		log.Error().Err(err).Msg(errMsg)
		respondWithError(w, http.StatusForbidden, errMsg)
		return
	}

	if err := a.validateSignature(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	l := payload.List

	// pin to ipfs
	pin, err := a.IpfsClient.PinJson(l)
	if err != nil {
		log.Error().Err(err).Msg("error pinning list to IPFS")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}
	l.Cid = &pin.IpfsHash

	// create proposal
	if err := l.CreateList(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, l)
}

func (a *App) addAddressesToList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid list ID")
		return
	}

	l := models.List{ID: id}

	// get current proposal from DB
	if err := l.GetListById(a.DB); err != nil {
		log.Error().Err(err).Msgf("error querying list with id %v", id)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	payload := models.ListUpdatePayload{}
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&payload); err != nil {
		log.Error().Err(err).Msg("error decoding ListUpdate payload")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Validations

	// payload fields
	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		log.Error().Err(vErr).Msg("add to list validation error")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	// Ensure user is a community Admin
	if err := models.EnsureRoleForCommunity(a.DB, payload.Signing_addr, l.Community_id, "admin"); err != nil {
		errMsg := fmt.Sprintf("account %s is not an admin for community %d", payload.Signing_addr, l.Community_id)
		log.Error().Err(err).Msg(errMsg)
		respondWithError(w, http.StatusForbidden, errMsg)
		return
	}
	// timestamp
	if err := a.validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}
	// signature
	if err := a.validateSignature(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// Add specified addresses to list
	l.AddAddresses(payload.Addresses)

	// Pin to ipfs
	pin, err := a.IpfsClient.PinJson(l)
	if err != nil {
		log.Error().Err(err).Msg("error pinning to ipfs")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}
	l.Cid = &pin.IpfsHash

	// Finally, update DB
	if err := l.UpdateList(a.DB); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, nil)
}

func (a *App) removeAddressesFromList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid list ID")
		return
	}

	l := models.List{ID: id}

	// get current proposal from DB
	if err := l.GetListById(a.DB); err != nil {
		log.Error().Err(err).Msgf("error querying list with id %v", id)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	payload := models.ListUpdatePayload{}
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&payload); err != nil {
		log.Error().Err(err).Msg("error decoding ListUpdate payload")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	// Validations

	// payload fields
	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		log.Error().Err(vErr).Msg("remove from list validation error")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}
	if err := models.EnsureRoleForCommunity(a.DB, payload.Signing_addr, l.Community_id, "admin"); err != nil {
		errMsg := fmt.Sprintf("account %s is not an admin for community %d", payload.Signing_addr, l.Community_id)
		log.Error().Err(err).Msg(errMsg)
		respondWithError(w, http.StatusForbidden, errMsg)
		return
	}
	// timestamp
	if err := a.validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}
	// signature
	if err := a.validateSignature(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// Remove specified addresses
	l.RemoveAddresses(payload.Addresses)

	// Pin to ipfs
	pin, err := a.IpfsClient.PinJson(l)
	if err != nil {
		log.Error().Err(err).Msg("ipfs error")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}
	l.Cid = &pin.IpfsHash

	// Finally, update DB
	if err := l.UpdateList(a.DB); err != nil {
		log.Error().Err(err).Msg("db error updating list")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, nil)
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

///////////
// Users //
///////////

func (a *App) handleCreateCommunityUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&payload); err != nil {
		msg := "Invalid request payload"
		log.Error().Err(err).Msg(msg)
		respondWithError(w, http.StatusBadRequest, msg)
		return
	}
	defer r.Body.Close()

	// validate community_user payload fields
	validate := validator.New()
	vErr := validate.Struct(payload)
	if vErr != nil {
		log.Error().Err(vErr).Msg("invalid community user")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}
	// validate user is allowed to create this user
	if payload.User_type != "member" {
		if payload.Signing_addr == payload.Addr {
			CANNOT_GRANT_SELF_ERR := errors.New("users cannot grant themselves a priviledged user_type")
			log.Error().Err(CANNOT_GRANT_SELF_ERR)
			respondWithError(w, http.StatusForbidden, CANNOT_GRANT_SELF_ERR.Error())
			return
		}
		// If signing address is not user address, verify they have admin status in this community
		var communityAdmin = models.CommunityUser{Community_id: payload.Community_id, Addr: payload.Signing_addr, User_type: "admin"}
		if err := communityAdmin.GetCommunityUser(a.DB); err != nil {
			USER_MUST_BE_ADMIN_ERR := errors.New("user must be community admin to grant priviledges")
			log.Error().Err(err).Msg("db error")
			log.Error().Err(USER_MUST_BE_ADMIN_ERR)
			respondWithError(w, http.StatusForbidden, USER_MUST_BE_ADMIN_ERR.Error())
			return
		}
	}
	// only an account can add itself as a "member", unless an admin is granting
	// an address a priviledged role
	if payload.User_type == "member" && payload.Addr != payload.Signing_addr {
		CANNOT_ADD_MEMBER_ERR := errors.New("an account can only add itself as a community member, unless an admin is granting priviledged role")
		log.Error().Err(CANNOT_ADD_MEMBER_ERR)
		respondWithError(w, http.StatusForbidden, CANNOT_ADD_MEMBER_ERR.Error())
		return
	}
	// validate timestamp of request/message
	if err := a.validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}
	// validate timestamp of request/message
	if err := a.validateSignature(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// check that community user doesnt already exist
	// should throw a "ErrNoRows" error
	u := payload.CommunityUser
	if err := u.GetCommunityUser(a.DB); err == nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Error: Address %s is already a %s of community %d\n", u.Addr, u.User_type, u.Community_id))
		return
	}

	// Grant appropriate roles
	if u.User_type == "admin" {
		if err := models.GrantAdminRolesToAddress(a.DB, u.Community_id, u.Addr); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	} else if u.User_type == "author" {
		if err := models.GrantAuthorRolesToAddress(a.DB, u.Community_id, u.Addr); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	} else {
		// grant member role
		if err := u.CreateCommunityUser(a.DB); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	respondWithJSON(w, http.StatusCreated, "OK")
}

func (a *App) handleGetCommunityUsers(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))
	userType := r.FormValue("userType")
	if count > 100 || count < 1 {
		count = 100
	}
	if start < 0 {
		start = 0
	}

	// if userType param is not passed, fetch all, if it is passed fetch by type
	if userType == "" {
		users, totalRecords, err := models.GetUsersForCommunity(a.DB, communityId, start, count)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		response := shared.GetPaginatedResponseWithPayload(users, start, count, totalRecords)
		respondWithJSON(w, http.StatusOK, response)
	} else {
		users, totalRecords, err := models.GetUsersForCommunityByType(a.DB, communityId, start, count, userType)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		response := shared.GetPaginatedResponseWithPayload(users, start, count, totalRecords)
		respondWithJSON(w, http.StatusOK, response)
	}
}

func (a *App) handleGetUserCommunities(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]

	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))
	if count > 25 || count < 1 {
		count = 25
	}
	if start < 0 {
		start = 0
	}

	communities, totalRecords, err := models.GetCommunitiesForUser(a.DB, addr, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := shared.GetPaginatedResponseWithPayload(communities, start, count, totalRecords)
	respondWithJSON(w, http.StatusOK, response)

}

func (a *App) handleRemoveUserRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]
	userType := vars["userType"]
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId
	payload.Addr = addr
	payload.User_type = userType

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&payload); err != nil {
		msg := "Invalid request payload"
		log.Error().Err(err).Msg(msg)
		respondWithError(w, http.StatusBadRequest, msg)
		return
	}
	defer r.Body.Close()

	// validate timestamp of request/message
	if err := a.validateTimestamp(payload.Timestamp, 60); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}
	// validate signature
	if err := a.validateSignature(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	if payload.User_type == "member" {
		if payload.Addr == payload.Signing_addr {
			// If a member is removing themselves, remove all their other roles as well
			userRoles, err := models.GetAllRolesForUserInCommunity(a.DB, payload.Addr, payload.Community_id)
			if err != nil {
				log.Error().Err(err)
				respondWithError(w, http.StatusInternalServerError, err.Error())
			}
			for _, userRole := range userRoles {
				if err := userRole.Remove(a.DB); err != nil {
					log.Error().Err(err)
					respondWithError(w, http.StatusInternalServerError, err.Error())
					return
				}
			}
		} else {
			// validate someone else is not removing a "member" role
			CANNOT_REMOVE_MEMBER_ERR := errors.New("cannot remove another member from a community")
			log.Error().Err(CANNOT_REMOVE_MEMBER_ERR)
			respondWithError(w, http.StatusForbidden, CANNOT_REMOVE_MEMBER_ERR.Error())
			return
		}
	}

	u := payload.CommunityUser

	if payload.User_type == "admin" {
		// validate signer is admin
		var adminUser = models.CommunityUser{Addr: payload.Signing_addr, Community_id: payload.Community_id, User_type: "admin"}
		if err := adminUser.GetCommunityUser(a.DB); err != nil {
			USER_MUST_BE_ADMIN_ERR := errors.New("user must be community admin") // this
			log.Error().Err(err).Msg("db error")
			log.Error().Err(USER_MUST_BE_ADMIN_ERR)
			respondWithError(w, http.StatusForbidden, USER_MUST_BE_ADMIN_ERR.Error())
			return
		}
		// If the admin role is being removed, remove author role as well
		author := models.CommunityUser{Addr: u.Addr, Community_id: u.Community_id, User_type: "author"}
		if err := author.Remove(a.DB); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		// remove admin role
		if err := u.Remove(a.DB); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	} else if err := u.Remove(a.DB); err != nil {
		// Otherwise, just remove the specified user role
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	resp := struct {
		Status string `json:"status"`
	}{
		Status: "ok",
	}

	respondWithJSON(w, http.StatusOK, resp)
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

func (a *App) validateSignature(addr string, message string, sigs *[]shared.CompositeSignature) error {
	shouldValidateSignature := a.Config.Features["validateSigs"]

	if !shouldValidateSignature {
		return nil
	}

	if err := a.FlowAdapter.UserSignatureValidate(addr, message, sigs, ""); err != nil {
		return err
	}
	return nil
}

// blocklist check
func (a *App) validateBlocklist(addr string, communityId int) error {
	if !a.Config.Features["validateBlocklist"] {
		return nil
	}

	blockList, _ := models.GetListForCommunityByType(a.DB, communityId, "block")
	isBlocked := funk.Contains(blockList.Addresses, addr)

	isTest := flag.Lookup("test.v") != nil

	if isBlocked && !isTest {
		return errors.New("user does not have permission")
	}
	return nil
}

// same comment as above. need to move this to conditional middleware
func (a *App) validateTimestamp(timestamp string, expiry int) error {
	if !a.Config.Features["validateTimestamps"] {
		return nil
	}
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
