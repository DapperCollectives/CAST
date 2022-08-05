package server

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
	"github.com/thoas/go-funk"
)

func (a *App) health(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, "OK!!")
}

func (a *App) upload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxFileSize)
	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		log.Error().Err(err).Msgf("File cannot be larger than max file size of %v.\n", maxFileSize)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	resp, err := a.uploadFile(r)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, resp)
}

// Votes
func (a *App) getResultsForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposal, err := a.fetchProposal(vars, "proposalId")

	votes, err := models.GetAllVotesForProposal(a.DB, proposal.ID, *proposal.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Error getting votes for proposal.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	results, err := a.useStrategyTally(proposal, votes)
	if *proposal.Computed_status == "closed" {
		models.AddWinningVoteAchievement(a.DB, votes, results, proposal.Community_id)
	}

	respondWithJSON(w, http.StatusOK, results)
}

func (a *App) getVotesForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposal, err := a.fetchProposal(vars, "proposalId")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	votes, orders, err := a.getPaginatedVotes(r, proposal)
	votesWithWeights, err := a.useStrategyGetVotes(proposal, votes)

	response := shared.GetPaginatedResponseWithPayload(votesWithWeights, orders)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getVoteForAddress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]

	proposal, err := a.fetchProposal(vars, "proposalId")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	vote, err := a.processVote(addr, proposal)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, vote)
}

func (a *App) getVotesForAddress(w http.ResponseWriter, r *http.Request) {
	var proposalIds []int

	vars := mux.Vars(r)
	addr := vars["addr"]

	err := json.Unmarshal([]byte(r.FormValue("proposalIds")), &proposalIds)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	start, count := getPageParams(r.FormValue("start"), r.FormValue("count"), 25)
	orderParams := shared.OrderedPageParams{
		Start: start,
		Count: count,
		Order: "desc",
	}

	votes, orderParams, err := a.processVotes(addr, proposalIds, orderParams)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := shared.GetPaginatedResponseWithPayload(votes, orderParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) createVoteForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	proposal, err := a.fetchProposal(vars, "proposalId")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	var v models.Vote
	if err := validatePayload(r.Body, &v); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	v.Proposal_id = proposal.ID

	// validate user hasn't already voted
	existingVote := models.Vote{Proposal_id: v.Proposal_id, Addr: v.Addr}
	if err := existingVote.GetVote(a.DB); err == nil {
		log.Error().Msgf("Address %s has already voted for proposal %d.", v.Addr, v.Proposal_id)
		respondWithError(w, http.StatusInternalServerError, errors.New("address has already voted").Error())
		return
	}

	// get the proposal for extra validations
	p := models.Proposal{ID: proposal.ID}
	if err := p.GetProposalById(a.DB); err != nil {
		log.Error().Err(err).Msgf("Error fetching proposal by id: %v.", proposal.ID)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// check that proposal is live
	if os.Getenv("APP_ENV") != "DEV" {
		if !p.IsLive() {
			err = errors.New("User cannot vote on inactive proposal.")
			log.Error().Err(err)
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// validate the user is not on community's blocklist
	if err = a.validateBlocklist(v.Addr, p.Community_id); err != nil {
		log.Error().Err(err).Msgf(fmt.Sprintf("Address %v is on blocklist for community id %v.\n", v.Addr, p.Community_id))
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// validate proper message format
	//<proposalId>:<choice>:<timestamp>
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
	// if err := a.FlowAdapter.UserTransactionValidate(v.Addr, v.Message, v.Composite_signatures, v.TransactionId, a.TxOptionsAddresses, p.Choices); err != nil {
	// 	respondWithError(w, http.StatusBadRequest, err.Error())
	// 	return
	// }

	v.Proposal_id = proposal.ID

	s := a.initStrategy(*p.Strategy)
	if s == nil {
		respondWithError(w, http.StatusInternalServerError, "Proposal strategy not found.")
		return
	}

	emptyBalance := &models.Balance{
		Addr:        v.Addr,
		Proposal_id: p.ID,
	}
	if p.Block_height != nil {
		emptyBalance.BlockHeight = *p.Block_height
	}

	balance, err := s.FetchBalance(emptyBalance, &p)
	if err != nil {
		log.Error().Err(err).Msgf("Error fetching balance for address %v.", v.Addr)
		respondWithError(w, http.StatusInternalServerError, "Error fetching balance.")
		return
	}

	vb := models.VoteWithBalance{
		Vote:                    v,
		PrimaryAccountBalance:   &balance.PrimaryAccountBalance,
		SecondaryAccountBalance: &balance.SecondaryAccountBalance,
		StakingBalance:          &balance.StakingBalance,
	}

	weight, err := s.GetVoteWeightForBalance(&vb, &p)
	if err != nil {
		log.Error().Err(err).Msg("Error getting vote weight.")
		respondWithError(w, http.StatusInternalServerError, "Error getting vote weight.")
		return
	}

	if err = p.ValidateBalance(weight); err != nil {
		log.Error().Err(err).Msg("Account may not vote on proposal: insufficient balance.")
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	v.Cid, err = a.pinJSONToIpfs(p)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}

	if err := v.CreateVote(a.DB); err != nil {
		log.Error().Err(err).Msg("Couldnt create vote.")
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	start, count, order := getOrderedPageParams(r.FormValue("start"), r.FormValue("count"), r.FormValue("order"), 25)
	status := r.FormValue("status")

	orderParams := shared.OrderedPageParams{
		Start: start,
		Count: count,
		Order: order,
	}

	proposals, totalRecords, err := models.GetProposalsForCommunity(a.DB, start, count, communityId, status, order)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	orderParams.TotalRecords = totalRecords

	response := shared.GetPaginatedResponseWithPayload(proposals, orderParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	p := models.Proposal{ID: id}
	if err := p.GetProposalById(a.DB); err != nil {
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Proposal not found.")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	c := models.Community{ID: p.Community_id}
	if err := c.GetCommunity(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := a.processSnapshotStatus(&strategy, &p); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

func (a *App) createProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	var p models.Proposal
	p.Community_id = communityId

	if err := validatePayload(r.Body, &p); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	if err := a.validateUser(p.Creator_addr, p.Timestamp, p.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	var community models.Community
	community.ID = communityId

	if err := community.GetCommunity(a.DB); err != nil {
		log.Error().Err(err).Msg("Error fetching community.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	strategy, err := models.MatchStrategyByProposal(*community.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Community does not have this strategy available.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return

	}
	s := a.initStrategy(*p.Strategy)

	p.Min_balance = strategy.Contract.Threshold
	p.Max_weight = strategy.Contract.MaxWeight

	var snapshotResponse *shared.SnapshotResponse
	if s.RequiresSnapshot() {
		snapshotResponse, err = a.SnapshotClient.TakeSnapshot(strategy.Contract)
		if err != nil {
			log.Error().Err(err).Msg("Error taking snapshot.")
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		p.Block_height = &snapshotResponse.Data.BlockHeight
		p.Snapshot_status = &snapshotResponse.Data.Status
	}

	if *community.Only_authors_to_submit {
		if err := models.EnsureRoleForCommunity(a.DB, p.Creator_addr, communityId, "author"); err != nil {
			errMsg := fmt.Sprintf("Account %s is not an author for community %d.", p.Creator_addr, p.Community_id)
			log.Error().Err(err).Msg(errMsg)
			respondWithError(w, http.StatusForbidden, errMsg)
			return
		}
	} else {
		hasBalance, err := a.processTokenThreshold(p.Creator_addr, strategy)
		if err != nil {
			log.Error().Err(err).Msg("Error processing Token Threshold.")
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if !hasBalance {
			errMsg := "Insufficient token balance to create proposal."
			log.Error().Err(err).Msg(errMsg)
			respondWithError(w, http.StatusForbidden, errMsg)
			return
		}
	}

	if err := a.processSnapshotStatus(&strategy, &p); err != nil {
		log.Error().Err(err).Msg("Error processing snapshot status.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	p.Cid, err = a.pinJSONToIpfs(p)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}

	// validate proposal fields
	validate := validator.New()
	vErr := validate.Struct(p)
	if vErr != nil {
		log.Error().Err(vErr).Msg("Invalid proposal.")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	if os.Getenv("APP_ENV") == "PRODUCTION" {
		if strategy.Contract.Name != nil && p.Start_time.Before(time.Now().UTC().Add(time.Hour)) {
			p.Start_time = time.Now().UTC().Add(time.Hour)
		}
	}

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
		log.Error().Err(err).Msg("Invalid proposal ID.")
		respondWithError(w, http.StatusBadRequest, "Invalid proposal ID.")
		return
	}

	p := models.Proposal{ID: id}

	if err := p.GetProposalById(a.DB); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	var payload models.UpdateProposalRequestPayload
	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	// Check that status update is valid
	// For now we are assuming proposals are creating with status 'published' and may be cancelled.
	if payload.Status != "cancelled" {
		respondWithError(w, http.StatusBadRequest, "You may only change a proposal's status to 'cancelled'.")
		return
	}

	if err := a.validateUserWithRole(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures, p.Community_id, "author"); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	p.Status = &payload.Status
	p.Cid, err = a.pinJSONToIpfs(p)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}

	if err := p.UpdateProposal(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

// Communities

func (a *App) getCommunities(w http.ResponseWriter, r *http.Request) {
	start, count := getPageParams(r.FormValue("start"), r.FormValue("count"), 25)

	communities, totalRecords, err := models.GetCommunities(a.DB, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	orderParams := shared.OrderedPageParams{
		Start:        start,
		Count:        count,
		TotalRecords: totalRecords,
	}
	response := shared.GetPaginatedResponseWithPayload(communities, orderParams)

	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	c := models.Community{ID: id}
	if err := c.GetCommunity(a.DB); err != nil {
		// TODO: for some reason switch err doesn't match pgx.ErrNoRows.
		// So I've added .Error() to convert to a string comparison
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			respondWithError(w, http.StatusNotFound, "Community not found.")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	respondWithJSON(w, http.StatusOK, c)
}

func (a *App) getCommunitiesForHomePage(w http.ResponseWriter, r *http.Request) {
	start, count := getPageParams(r.FormValue("start"), r.FormValue("count"), 25)

	communities, totalRecords, err := models.GetCommunitiesForHomePage(a.DB, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	orderParams := shared.OrderedPageParams{
		Start:        start,
		Count:        count,
		TotalRecords: totalRecords,
	}

	response := shared.GetPaginatedResponseWithPayload(communities, orderParams)

	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) createCommunity(w http.ResponseWriter, r *http.Request) {
	var err error
	var c models.Community
	var payload models.CreateCommunityRequestPayload

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	c = payload.Community

	if err := a.validateUser(c.Creator_addr, c.Timestamp, c.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	c.Cid, err = a.pinJSONToIpfs(c)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}

	validate := validator.New()
	vErr := validate.Struct(c)
	if vErr != nil {
		log.Error().Err(vErr).Msg("Invalid community.")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	if err := c.CreateCommunity(a.DB); err != nil {
		log.Error().Err(err).Msg("Database error creating community.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := models.GrantRolesToCommunityCreator(a.DB, c.Creator_addr, c.ID); err != nil {
		log.Error().Err(err).Msg("Database error adding community creator roles.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

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
		respondWithError(w, http.StatusBadRequest, "Invalid community ID.")
		return
	}
	var payload models.UpdateCommunityRequestPayload

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	defer r.Body.Close()

	var c = models.Community{ID: id}
	if err := c.GetCommunity(a.DB); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid request: no community with ID %d.", id))
		return
	}

	// validate is commuity creator
	// TODO: update to validating address is admin
	if err := c.CanUpdateCommunity(a.DB, payload.Signing_addr); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	if err := a.validateUser(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
	}

	payload := models.ListPayload{}

	payload.Community_id = communityId

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	// Ensure list doesnt already exist

	if existingList, _ := models.GetListForCommunityByType(a.DB, communityId, *payload.List_type); existingList.ID > 0 {
		respondWithError(
			w,
			http.StatusBadRequest,
			fmt.Sprintf("List of type %s already exists for community %d.", *payload.List_type, communityId),
		)
		return
	}

	// validate payload fields
	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		log.Error().Err(vErr).Msg("Validation error in list payload.")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	if err := a.validateUserWithRole(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures, payload.Community_id, "admin"); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	l := payload.List

	l.Cid, err = a.pinJSONToIpfs(l)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}

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
		respondWithError(w, http.StatusBadRequest, "Invalid list ID.")
		return
	}

	l := models.List{ID: id}

	// get current proposal from DB
	if err := l.GetListById(a.DB); err != nil {
		log.Error().Err(err).Msgf("Error querying list with id %v.", id)
		respondWithError(w, http.StatusInternalServerError, err.Error()+".")
		return
	}

	payload := models.ListUpdatePayload{}
	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	// Validations

	// payload fields
	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		log.Error().Err(vErr).Msg("Add to list validation error.")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	if err := a.validateUserWithRole(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures, l.Community_id, "admin"); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	l.AddAddresses(payload.Addresses)

	l.Cid, err = a.pinJSONToIpfs(l)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}

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
		respondWithError(w, http.StatusBadRequest, "Invalid list ID.")
		return
	}

	l := models.List{ID: id}

	// get current proposal from DB
	if err := l.GetListById(a.DB); err != nil {
		log.Error().Err(err).Msgf("Error querying list with id %v.", id)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	payload := models.ListUpdatePayload{}
	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	// Validations

	// payload fields
	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		log.Error().Err(vErr).Msg("Remove from list validation error.")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}

	if err := a.validateUserWithRole(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures, l.Community_id, "admin"); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	l.RemoveAddresses(payload.Addresses)

	l.Cid, err = a.pinJSONToIpfs(l)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		respondWithError(w, http.StatusInternalServerError, "IPFS error: "+err.Error())
		return
	}

	if err := l.UpdateList(a.DB); err != nil {
		log.Error().Err(err).Msg("Database error updating list.")
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
		log.Error().Err(err).Msg("Error parsing blockHeight param.")
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	flowToken := "FlowToken"
	defaultFlowContract := shared.Contract{
		Name: &flowToken,
	}

	b := shared.FTBalanceResponse{}
	if err = a.SnapshotClient.GetAddressBalanceAtBlockHeight(addr, blockHeight, &b, &defaultFlowContract); err != nil {
		log.Error().Err(err).Msgf("Error getting account %s at blockheight %d.", addr, blockHeight)
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
	snapshot, err := a.SnapshotClient.GetLatestFlowSnapshot()
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	// validate community_user payload fields
	validate := validator.New()
	vErr := validate.Struct(payload)
	if vErr != nil {
		log.Error().Err(vErr).Msg("Invalid community user.")
		respondWithError(w, http.StatusBadRequest, vErr.Error())
		return
	}
	// validate user is allowed to create this user
	if payload.User_type != "member" {
		if payload.Signing_addr == payload.Addr {
			CANNOT_GRANT_SELF_ERR := errors.New("Users cannot grant themselves a priviledged user_type.")
			log.Error().Err(CANNOT_GRANT_SELF_ERR)
			respondWithError(w, http.StatusForbidden, CANNOT_GRANT_SELF_ERR.Error())
			return
		}
		// If signing address is not user address, verify they have admin status in this community
		var communityAdmin = models.CommunityUser{Community_id: payload.Community_id, Addr: payload.Signing_addr, User_type: "admin"}
		if err := communityAdmin.GetCommunityUser(a.DB); err != nil {
			USER_MUST_BE_ADMIN_ERR := errors.New("User must be community admin to grant priviledges.")
			log.Error().Err(err).Msg("Database error.")
			log.Error().Err(USER_MUST_BE_ADMIN_ERR)
			respondWithError(w, http.StatusForbidden, USER_MUST_BE_ADMIN_ERR.Error())
			return
		}
	}
	// only an account can add itself as a "member", unless an admin is granting
	// an address a privileged role
	if payload.User_type == "member" && payload.Addr != payload.Signing_addr {
		CANNOT_ADD_MEMBER_ERR := errors.New(
			"An account can only add itself as a community member, unless an admin is granting privileged role.",
		)
		log.Error().Err(CANNOT_ADD_MEMBER_ERR)
		respondWithError(w, http.StatusForbidden, CANNOT_ADD_MEMBER_ERR.Error())
		return
	}

	if err := a.validateUser(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		log.Error().Err(err)
		respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// check that community user doesnt already exist
	// should throw a "ErrNoRows" error
	u := payload.CommunityUser
	if err := u.GetCommunityUser(a.DB); err == nil {
		respondWithError(
			w,
			http.StatusBadRequest,
			fmt.Sprintf("Error: Address %s is already a %s of community %d.\n", u.Addr, u.User_type, u.Community_id),
		)
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	start, count := getPageParams(r.FormValue("start"), r.FormValue("count"), 100)

	users, totalRecords, err := models.GetUsersForCommunity(a.DB, communityId, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	orderParams := shared.OrderedPageParams{
		Start:        start,
		Count:        count,
		TotalRecords: totalRecords,
	}

	response := shared.GetPaginatedResponseWithPayload(users, orderParams)
	respondWithJSON(w, http.StatusOK, response)

}

func (a *App) handleGetCommunityUsersByType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	userType := vars["userType"]
	if !models.EnsureValidRole(userType) {
		respondWithError(w, http.StatusBadRequest, "Invalid userType.")
		return
	}

	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))
	if count > 100 || count < 1 {
		count = 100
	}
	if start < 0 {
		start = 0
	}

	users, totalRecords, err := models.GetUsersForCommunityByType(a.DB, communityId, start, count, userType)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	orderParams := shared.OrderedPageParams{
		Start:        start,
		Count:        count,
		TotalRecords: totalRecords,
	}
	response := shared.GetPaginatedResponseWithPayload(users, orderParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) handleGetCommunityLeaderboard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	addr := r.FormValue("addr")
	start, count := getPageParams(r.FormValue("start"), r.FormValue("count"), 100)

	leaderboard, totalRecords, err := models.GetCommunityLeaderboard(a.DB, communityId, addr, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	orderParams := shared.OrderedPageParams{
		Start:        start,
		Count:        count,
		TotalRecords: totalRecords,
	}

	response := shared.GetPaginatedResponseWithPayload(leaderboard.Users, orderParams)
	response.Data = leaderboard
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) handleGetUserCommunities(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]

	start, count := getPageParams(r.FormValue("start"), r.FormValue("count"), 100)

	communities, totalRecords, err := models.GetCommunitiesForUser(a.DB, addr, start, count)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	orderParams := shared.OrderedPageParams{
		Start:        start,
		Count:        count,
		TotalRecords: totalRecords,
	}

	response := shared.GetPaginatedResponseWithPayload(communities, orderParams)
	respondWithJSON(w, http.StatusOK, response)

}

func (a *App) handleRemoveUserRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]
	userType := vars["userType"]
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId
	payload.Addr = addr
	payload.User_type = userType

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		respondWithError(w, http.StatusBadRequest, "Invalid request payload.")
		return
	}

	if err := a.validateUser(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
		log.Error().Err(err)
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
			CANNOT_REMOVE_MEMBER_ERR := errors.New("Cannot remove another member from a community.")
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
			USER_MUST_BE_ADMIN_ERR := errors.New("User must be community admin.")
			log.Error().Err(err).Msg("Database error.")
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
		// Otherwise, just remove the specified user role
	} else if err := u.Remove(a.DB); err != nil {
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

func (a *App) validateBlocklist(addr string, communityId int) error {
	if !a.Config.Features["validateBlocklist"] {
		return nil
	}

	blockList, _ := models.GetListForCommunityByType(a.DB, communityId, "block")
	isBlocked := funk.Contains(blockList.Addresses, addr)

	isTest := flag.Lookup("test.v") != nil

	if isBlocked && !isTest {
		return errors.New("User does not have permission.")
	}
	return nil
}

// Need to move this to conditional middleware
func (a *App) validateTimestamp(timestamp string, expiry int) error {
	if !a.Config.Features["validateTimestamps"] {
		return nil
	}
	// check timestamp and ensure no longer than expiry seconds has passed
	stamp, _ := strconv.ParseInt(timestamp, 10, 64)
	uxTime := time.Unix(stamp/1000, (stamp%1000)*1000*1000)
	diff := time.Now().UTC().Sub(uxTime).Seconds()
	if diff > float64(expiry) {
		err := errors.New("Timestamp on request has expired.")
		log.Error().Err(err).Msgf("expiry error: %v", diff)
		return err
	}
	return nil
}

func (a *App) processSnapshotStatus(s *models.Strategy, p *models.Proposal) error {
	var processing = "processing"

	if s.Contract.Name != nil && p.Snapshot_status == &processing {
		snapshotResponse, err := a.SnapshotClient.
			GetSnapshotStatusAtBlockHeight(
				s.Contract,
				*p.Block_height,
			)
		if err != nil {
			return err
		}

		p.Snapshot_status = &snapshotResponse.Data.Status

		if err := p.UpdateSnapshotStatus(a.DB); err != nil {
			return err
		}
	}
	return nil

}

func (a *App) processTokenThreshold(address string, s models.Strategy) (bool, error) {
	var scriptPath string
	stratName := *s.Name

	if stratName == "balance-of-nfts" {
		scriptPath = "./main/cadence/scripts/get_nfts_ids.cdc"
	} else {
		scriptPath = "./main/cadence/scripts/get_balance.cdc"

	}

	hasBalance, err := a.FlowAdapter.EnforceTokenThreshold(scriptPath, address, &s.Contract)
	if err != nil {
		return false, err
	}

	return hasBalance, nil
}

func validatePayload(body io.ReadCloser, data interface{}) error {
	decoder := json.NewDecoder(body)
	if err := decoder.Decode(&data); err != nil {
		return err
	}

	defer body.Close()

	return nil
}

func getOrderedPageParams(start, count, order string, defaultCount int) (int, int, string) {
	s, _ := strconv.Atoi(start)
	c, _ := strconv.Atoi(count)
	if order == "" {
		order = "desc"
	}
	if c > defaultCount || c < 1 {
		c = defaultCount
	}
	if s < 0 {
		s = 0
	}
	return s, c, order
}

func getPageParams(start, count string, defaultCount int) (int, int) {
	s, _ := strconv.Atoi(start)
	c, _ := strconv.Atoi(count)

	if c > defaultCount || c < 1 {
		c = defaultCount
	}
	if s < 0 {
		s = 0
	}
	return s, c
}

func (a *App) pinJSONToIpfs(data interface{}) (*string, error) {
	pin, err := a.IpfsClient.PinJson(data)
	if err != nil {
		return nil, err
	}
	return &pin.IpfsHash, nil
}

func (a *App) initStrategy(name string) Strategy {
	s := strategyMap[name]
	if s == nil {
		return nil
	}

	s.InitStrategy(a.FlowAdapter, a.DB, a.SnapshotClient)

	return s
}

func (a *App) validateUser(addr, timestamp string, compositeSignatures *[]shared.CompositeSignature) error {
	if err := a.validateTimestamp(timestamp, 60); err != nil {
		return err
	}
	if err := a.validateSignature(addr, timestamp, compositeSignatures); err != nil {
		return err
	}

	return nil
}

func (a *App) validateUserWithRole(addr, timestamp string, compositeSignatures *[]shared.CompositeSignature, communityId int, role string) error {
	if err := a.validateTimestamp(timestamp, 60); err != nil {
		return err
	}
	if err := a.validateSignature(addr, timestamp, compositeSignatures); err != nil {
		return err
	}
	if err := models.EnsureRoleForCommunity(a.DB, addr, communityId, role); err != nil {
		errMsg := fmt.Sprintf("Account %s is not an author for community %d.", addr, communityId)
		log.Error().Err(err).Msg(errMsg)
		return err
	}

	return nil
}

///////////////////////
// CONTROLLER HELPERS //
//////////////////////

func (a *App) uploadFile(r *http.Request) (interface{}, error) {
	file, handler, err := r.FormFile("file")
	if err != nil {
		log.Error().Err(err).Msg("FormFile Retrieval Error.")
		return nil, err
	}
	defer file.Close()

	// ensure mime type is allowed
	mime := handler.Header.Get("Content-Type")
	if !funk.Contains(allowedFileTypes, mime) {
		msg := fmt.Sprintf("Uploaded file type of '%s' is not allowed.", mime)
		log.Error().Msg(msg)
		return nil, errors.New(msg)
	}

	pin, err := a.IpfsClient.PinFile(file, handler.Filename)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning file to IPFS.")
		return nil, err
	}

	resp := struct {
		Cid string `json:"cid"`
	}{
		Cid: pin.IpfsHash,
	}

	return resp, nil
}

func (a *App) fetchProposal(vars map[string]string, query string) (models.Proposal, error) {
	proposalId, err := strconv.Atoi(vars[query])
	if err != nil {
		msg := fmt.Sprintf("Invalid proposalId: %s", vars["proposalId"])
		log.Error().Err(err).Msg(msg)
		return models.Proposal{}, errors.New(msg)
	}

	p := models.Proposal{ID: proposalId}

	if err := p.GetProposalById(a.DB); err != nil {
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			msg := fmt.Sprintf("Proposal with ID %d not found.", proposalId)
			return models.Proposal{}, errors.New(msg)
		default:
			return models.Proposal{}, err
		}
	}

	return p, nil
}

func (a *App) useStrategyTally(
	p models.Proposal,
	v []*models.VoteWithBalance,
) (models.ProposalResults, error) {

	s := a.initStrategy(*p.Strategy)
	if s == nil {
		return models.ProposalResults{}, errors.New("Strategy not found.")
	}

	proposalInitialized := models.NewProposalResults(p.ID, p.Choices)
	results, err := s.TallyVotes(v, proposalInitialized, &p)
	if err != nil {
		return models.ProposalResults{}, err
	}

	return results, nil
}

func (a *App) useStrategyGetVotes(
	p models.Proposal,
	v []*models.VoteWithBalance,
) ([]*models.VoteWithBalance, error) {

	s := a.initStrategy(*p.Strategy)
	if s == nil {
		return nil, errors.New("Strategy not found.")
	}

	votesWithWeights, err := s.GetVotes(v, &p)
	if err != nil {
		return nil, err
	}

	return votesWithWeights, nil
}

func (a *App) useStrategyGetVoteWeight(
	p models.Proposal,
	v *models.VoteWithBalance,
) (float64, error) {
	s := strategyMap[*p.Strategy]
	if s == nil {
		return 0, errors.New("Strategy not found.")
	}

	weight, err := s.GetVoteWeightForBalance(v, &p)
	if err != nil {
		return 0, err
	}
	return weight, nil
}

func (a *App) getPaginatedVotes(
	r *http.Request,
	p models.Proposal,
) (
	[]*models.VoteWithBalance,
	shared.OrderedPageParams,
	error,
) {

	start, count, order := getOrderedPageParams(
		r.FormValue("start"),
		r.FormValue("count"),
		r.FormValue("order"),
		25,
	)

	votes, totalRecords, err := models.GetVotesForProposal(
		a.DB,
		start,
		count,
		order,
		p.ID,
		*p.Strategy,
	)
	if err != nil {
		return nil, shared.OrderedPageParams{}, err
	}

	ordered := shared.OrderedPageParams{
		Start:        start,
		Count:        count,
		Order:        order,
		TotalRecords: totalRecords,
	}

	return votes, ordered, nil
}

func (a *App) processVote(addr string, p models.Proposal) (*models.VoteWithBalance, error) {
	vote, err := a.fetchVote(addr, p.ID)
	if err != nil {
		return nil, err
	}

	weight, err := a.useStrategyGetVoteWeight(p, vote)
	if err != nil {
		return nil, err
	}

	vote.Weight = &weight
	return vote, err
}

func (a *App) fetchVote(addr string, id int) (*models.VoteWithBalance, error) {
	voteWithBalance := &models.VoteWithBalance{
		Vote: models.Vote{
			Addr:        addr,
			Proposal_id: id,
		}}

	if err := voteWithBalance.GetVote(a.DB); err != nil {
		switch err.Error() {
		case pgx.ErrNoRows.Error():
			msg := fmt.Sprintf("Vote not found.")
			return nil, errors.New(msg)
		default:
			return nil, err
		}
	}
	return voteWithBalance, nil
}

func (a *App) processVotes(
	addr string,
	ids []int,
	order shared.OrderedPageParams,
) (
	[]*models.VoteWithBalance,
	shared.OrderedPageParams,
	error,
) {
	votes, totalRecords, err := models.GetVotesForAddress(
		a.DB,
		order.Start,
		order.Count,
		addr,
		&ids,
	)
	if err != nil {
		log.Error().Err(err).Msg("Error getting votes for address.")
		return nil, order, err
	}

	var votesWithBalances []*models.VoteWithBalance

	for _, vote := range votes {

		proposal := models.Proposal{ID: vote.Proposal_id}
		if err := proposal.GetProposalById(a.DB); err != nil {
			switch err.Error() {
			case pgx.ErrNoRows.Error():
				msg := fmt.Sprintf("Proposal with ID %d not found.", vote.Proposal_id)
				return nil, order, errors.New(msg)
			default:
				return nil, order, err
			}
		}

		s := strategyMap[*proposal.Strategy]
		if s == nil {
			return nil, order, errors.New("Strategy not found.")
		}

		weight, err := s.GetVoteWeightForBalance(vote, &proposal)
		if err != nil {
			return nil, order, err
		}

		vote.Weight = &weight
		votesWithBalances = append(votesWithBalances, vote)
	}

	order.TotalRecords = totalRecords

	return votesWithBalances, order, nil
}
