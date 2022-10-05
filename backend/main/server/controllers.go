package server

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
)

type errorResponse struct {
	statusCode int
	errorCode  string
	message    string
	details    string
}

var (
	errIncompleteRequest = errorResponse{
		statusCode: http.StatusBadRequest,
		errorCode:  "ERR_1001",
		message:    "Error",
		details:    "There was an error trying to complete your request",
	}

	errCreateCommunity = errorResponse{
		statusCode: http.StatusBadRequest,
		errorCode:  "ERR_1002",
		message:    "Error",
		details:    "There was an error trying to create your community",
	}

	errFetchingBalance = errorResponse{
		statusCode: http.StatusBadRequest,
		errorCode:  "ERR_1003",
		message:    "Error Fetching Balance",
		details: `While confirming your balance, we've encountered an error
							connecting to the Flow Blockchain.`,
	}

	errInsufficientBalance = errorResponse{
		statusCode: http.StatusUnauthorized,
		errorCode:  "ERR_1004",
		message:    "Insufficient Balance",
		details: `In order to vote on this proposal you must have a minimum 
							balance of %d %s tokens in your wallet.`,
	}

	errForbidden = errorResponse{
		statusCode: http.StatusForbidden,
		errorCode:  "ERR_1005",
		message:    "Forbidden",
		details:    "You are not authorized to perform this action.",
	}

	errCreateProposal = errorResponse{
		statusCode: http.StatusForbidden,
		errorCode:  "ERR_1006",
		message:    "Error",
		details:    "There was an error trying to create your proposal",
	}

	errUpdateCommunity = errorResponse{
		statusCode: http.StatusForbidden,
		errorCode:  "ERR_1007",
		message:    "Error",
		details:    "There was an error trying to update your community",
	}
)

// Payload Structs

type GetBalanceAtBlockheightPayload struct {
	Address     string           `json:"address"`
	Blockheight uint64           `json:"blockheight"`
	Contract    *shared.Contract `json:"contract,omitempty"`
}

// Route controller functions

func (a *App) health(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, "OK!!")
}

func (a *App) upload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxFileSize)
	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		log.Error().Err(err).Msgf("File cannot be larger than max file size of %v.\n", maxFileSize)
		respondWithError(w, errIncompleteRequest)
		return
	}

	resp, err := helpers.uploadFile(r)
	if err != nil {
		log.Error().Err(err).Msg("Error uploading file.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, resp)
}

// Votes
func (a *App) getResultsForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposal, _ := helpers.fetchProposal(vars, "proposalId")

	votes, err := models.GetAllVotesForProposal(a.DB, proposal.ID, *proposal.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Error getting votes for proposal.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	results, err := helpers.useStrategyTally(proposal, votes)
	if err != nil {
		log.Error().Err(err).Msg("Error tallying votes.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	if *proposal.Computed_status == "closed" && !proposal.Achievements_done {
		if err := models.AddWinningVoteAchievement(a.DB, votes, results); err != nil {
			log.Error().Err(err).Msg("Error calculating winning votes")
			respondWithError(w, errIncompleteRequest)
		}
	}

	respondWithJSON(w, http.StatusOK, results)
}

func (a *App) getVotesForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposal, err := helpers.fetchProposal(vars, "proposalId")
	if err != nil {
		log.Error().Err(err).Msg("Invalid Proposal ID.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	votes, order, err := helpers.getPaginatedVotes(r, proposal)
	if err != nil {
		log.Error().Err(err).Msg("error getting paginated votes")
		respondWithError(w, errIncompleteRequest)
		return
	}

	votesWithWeights, err := helpers.useStrategyGetVotes(proposal, votes)
	if err != nil {
		log.Error().Err(err).Msg("error calling useStrategyGetVotes")
		respondWithError(w, errIncompleteRequest)
		return
	}

	response := shared.GetPaginatedResponseWithPayload(votesWithWeights, order)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getVoteForAddress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]

	proposal, err := helpers.fetchProposal(vars, "proposalId")
	if err != nil {
		log.Error().Err(err).Msg("Invalid Proposal ID.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	vote, err := helpers.processVote(addr, proposal)
	if err != nil {
		log.Error().Err(err).Msg("Error processing vote.")
		respondWithError(w, errIncompleteRequest)
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
		log.Error().Err(err).Msg("Error unmarshalling proposalIds")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams := getPageParams(*r, 25)

	votes, pageParams, err := helpers.processVotes(addr, proposalIds, pageParams)
	if err != nil {
		log.Error().Err(err).Msg("Error processing votes.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	response := shared.GetPaginatedResponseWithPayload(votes, pageParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) createVoteForProposal(w http.ResponseWriter, r *http.Request) {
	var vote models.Vote
	if err := validatePayload(r.Body, &vote); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	vars := mux.Vars(r)
	proposal, err := helpers.fetchProposal(vars, "proposalId")
	if err != nil {
		log.Error().Err(err).Msg("Invalid Proposal ID.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	voteWithBalance, err := helpers.createVote(vote, proposal)
	if err != nil {
		log.Error().Err(err).Msg("Error creating vote.")
		respondWithError(w, errInsufficientBalance)
		return
	}

	respondWithJSON(w, http.StatusCreated, voteWithBalance)
}

// Proposals
func (a *App) getProposalsForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams := getPageParams(*r, 25)
	statusParam := r.FormValue("status")

	var statuses = []string{}
	if len(statusParam) > 0 {
		statuses = strings.Split(statusParam, ",")
	}

	proposals, totalRecords, err := models.GetProposalsForCommunity(
		a.DB,
		communityId,
		statuses,
		pageParams,
	)
	if err != nil {
		log.Error().Err(err).Msg("Error getting proposals for community.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams.TotalRecords = totalRecords

	response := shared.GetPaginatedResponseWithPayload(proposals, pageParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	p, err := helpers.fetchProposal(vars, "id")
	if err != nil {
		log.Error().Err(err).Msg("Invalid Proposal ID.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

func (a *App) createProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	var p models.Proposal
	p.Community_id = communityId

	if err := validatePayload(r.Body, &p); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	proposal, err := helpers.createProposal(p)
	if err != nil {
		log.Error().Err(err).Msg("Error creating proposal")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusCreated, proposal)
}

func (a *App) updateProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	p, err := helpers.fetchProposal(vars, "id")
	if err != nil {
		log.Error().Err(err).Msg("Invalid Proposal ID.")
		respondWithError(w, errIncompleteRequest)
		return
	}

	var payload models.UpdateProposalRequestPayload
	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	// Check that status update is valid
	// For now we are assuming proposals are creating with status 'published' and may be cancelled.
	if payload.Status != "cancelled" {
		log.Error().Err(err).Msg("Invalid status update")
		respondWithError(w, errIncompleteRequest)
		return
	}

	if payload.Voucher != nil {
		if err := helpers.validateUserWithRoleViaVoucher(
			payload.Signing_addr,
			payload.Voucher,
			p.Community_id,
			"author"); err != nil {
			log.Error().Err(err).Msg("Error validating user with role via voucher")
			respondWithError(w, errForbidden)
			return
		}
	} else {
		if err := helpers.validateUserWithRole(
			payload.Signing_addr,
			payload.Timestamp,
			payload.Composite_signatures,
			p.Community_id,
			"author"); err != nil {
			log.Error().Err(err).Msg("Error validating user with role")
			respondWithError(w, errForbidden)
			return
		}
	}

	p.Status = &payload.Status
	p.Cid, err = helpers.pinJSONToIpfs(p)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning proposal to IPFS")
		respondWithError(w, errIncompleteRequest)
		return
	}

	if err := p.UpdateProposal(a.DB); err != nil {
		log.Error().Err(err).Msg("Error updating proposal")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

// Communities
func (a *App) getCommunities(w http.ResponseWriter, r *http.Request) {
	pageParams := getPageParams(*r, 25)

	communities, totalRecords, err := models.GetCommunities(a.DB, pageParams)
	if err != nil {
		log.Error().Err(err).Msg("Error fetching communities")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams.TotalRecords = totalRecords
	response := shared.GetPaginatedResponseWithPayload(communities, pageParams)

	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) searchCommunities(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	results, err := helpers.searchCommunities(vars["query"])
	if err != nil {
		log.Error().Err(err).Msg("Error searching communities")
		respondWithError(w, errIncompleteRequest)
	}
	pageParams := getPageParams(*r, 25)
	pageParams.TotalRecords = len(results)

	response := shared.GetPaginatedResponseWithPayload(results, pageParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	c, err := helpers.fetchCommunity(id)
	if err != nil {
		log.Error().Err(err).Msg("Error fetching community")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, c)
}

func (a *App) getCommunitiesForHomePage(w http.ResponseWriter, r *http.Request) {
	pageParams := getPageParams(*r, 25)

	communities, totalRecords, err := models.GetCommunitiesForHomePage(a.DB, pageParams)
	if err != nil {
		log.Error().Err(err).Msg("Error fetching communities for home page")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams.TotalRecords = totalRecords

	response := shared.GetPaginatedResponseWithPayload(communities, pageParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) createCommunity(w http.ResponseWriter, r *http.Request) {
	var err error
	var c models.Community
	var payload models.CreateCommunityRequestPayload

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	//Validate Strategies & Proposal Thresholds
	if payload.Strategies != nil {
		err = validateContractThreshold(*payload.Strategies)
		if err != nil {
			log.Error().Err(err).Msg("Error validating contract threshold")
			respondWithError(w, errIncompleteRequest)
			return
		}
	}
	if payload.Proposal_threshold != nil && payload.Only_authors_to_submit != nil {
		err = validateProposalThreshold(*payload.Proposal_threshold, *payload.Only_authors_to_submit)
		if err != nil {
			log.Error().Err(err).Msg("Error validating proposal threshold")
			respondWithError(w, errIncompleteRequest)
		}
	}

	c, err = helpers.createCommunity(payload)
	if err != nil {
		log.Error().Err(err).Msg("Error creating community")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusCreated, c)
}

func (a *App) updateCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}
	var payload models.UpdateCommunityRequestPayload

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	//Validate Contract Thresholds
	if payload.Strategies != nil {
		err = validateContractThreshold(*payload.Strategies)
		if err != nil {
			log.Error().Err(err).Msg("Error validating contract threshold")
			respondWithError(w, errIncompleteRequest)
			return
		}
	}

	if payload.Proposal_threshold != nil && payload.Only_authors_to_submit != nil {
		err = validateProposalThreshold(*payload.Proposal_threshold, *payload.Only_authors_to_submit)
		if err != nil {
			log.Error().Err(err).Msg("Error validating proposal threshold")
			respondWithError(w, errIncompleteRequest)
		}
	}

	c, err := helpers.updateCommunity(id, payload)
	if err != nil {
		log.Error().Err(err).Msg("Error updating community")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, c)
}

func validateConractThreshold(s []models.Strategy) error {
	for _, s := range s {
		if s.Threshold != nil {
			if *s.Threshold < 1 {
				return errors.New("Contract Threshold Cannot Be < 1.")
			}
		}
	}
	return nil
}

// Voting Strategies
func (a *App) getVotingStrategies(w http.ResponseWriter, r *http.Request) {
	vs, err := models.GetVotingStrategies(a.DB)

	// Add custom scripts for the custom-script strategy
	for _, strategy := range vs {
		if strategy.Key == "custom-script" {
			strategy.Scripts = customScripts
		}
	}

	if err != nil {
		log.Error().Err(err).Msg("Error fetching voting strategies")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, vs)
}

func (a *App) getCommunityCategories(w http.ResponseWriter, r *http.Request) {
	vs, err := models.GetCommunityTypes(a.DB)
	if err != nil {
		log.Error().Err(err).Msg("Error fetching community categories")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, vs)
}

func (a *App) getActiveStrategiesForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	strategies, err := models.GetActiveStrategiesForCommunity(a.DB, communityId)
	if err != nil {
		log.Error().Err(err).Msg("Error fetching active strategies for community")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, strategies)
}

////////////
// Lists //
///////////

func (a *App) getListsForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	lists, err := models.GetListsForCommunity(a.DB, communityId)
	if err != nil {
		log.Error().Err(err).Msg("Error getting lists for community")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, lists)
}

func (a *App) getList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		log.Error().Err(err).Msg("Invalid List ID")
		respondWithError(w, errIncompleteRequest)
		return
	}
	list := models.List{ID: id}

	if err = list.GetListById(a.DB); err != nil {
		log.Error().Err(err).Msg("Error getting list")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, list)
}

func (a *App) createListForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	payload := models.ListPayload{}
	payload.Community_id = communityId

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	l, httpStatus, err := helpers.createListForCommunity(payload)
	if err != nil {
		log.Error().Err(err).Msg("Error creating list for community")
		errIncompleteRequest.statusCode = httpStatus
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusCreated, l)
}

func (a *App) addAddressesToList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid List ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	payload := models.ListUpdatePayload{}
	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	httpStatus, err := helpers.updateAddressesInList(id, payload, "add")
	if err != nil {
		log.Error().Err(err).Msg("Error adding addresses to list")
		errIncompleteRequest.statusCode = httpStatus
		respondWithError(w, errCreateCommunity)
		return
	}

	respondWithJSON(w, http.StatusCreated, "OK")
}

func (a *App) removeAddressesFromList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid List ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	payload := models.ListUpdatePayload{}
	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	httpStatus, err := helpers.updateAddressesInList(id, payload, "remove")
	if err != nil {
		log.Error().Err(err).Msg("Error removing addresses from list")
		errIncompleteRequest.statusCode = httpStatus
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, "OK")
}

//////////////
// Accounts //
//////////////

func (a *App) getAdminList(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, a.AdminAllowlist.Addresses)
}

func (a *App) getCommunityBlocklist(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, a.CommunityBlocklist.Addresses)
}

///////////
// Users //
///////////

func (a *App) createCommunityUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	httpStatus, err := helpers.createCommunityUser(payload)
	if err != nil {
		log.Error().Err(err).Msg("Error creating community user")
		errCreateCommunity.statusCode = httpStatus
		respondWithError(w, errCreateCommunity)
		return
	}

	respondWithJSON(w, http.StatusCreated, "OK")
}

func (a *App) getCommunityUsers(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams := getPageParams(*r, 100)

	users, totalRecords, err := models.GetUsersForCommunity(a.DB, communityId, pageParams)
	if err != nil {
		log.Error().Err(err).Msg("Error getting community users")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams.TotalRecords = totalRecords

	response := shared.GetPaginatedResponseWithPayload(users, pageParams)
	respondWithJSON(w, http.StatusOK, response)

}

func (a *App) getCommunityUsersByType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	userType := vars["userType"]
	if !models.EnsureValidRole(userType) {
		log.Error().Err(err).Msg("Invalid User Type")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams := getPageParams(*r, 100)
	users, totalRecords, err := models.GetUsersForCommunityByType(
		a.DB,
		communityId,
		userType,
		pageParams,
	)
	if err != nil {
		log.Error().Err(err).Msg("Error getting community users")
		respondWithError(w, errIncompleteRequest)
		return
	}
	pageParams.TotalRecords = totalRecords

	response := shared.GetPaginatedResponseWithPayload(users, pageParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getCommunityLeaderboard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	addr := r.FormValue("addr")
	pageParams := getPageParams(*r, 100)

	leaderboard, totalRecords, err := models.GetCommunityLeaderboard(a.DB, communityId, addr, pageParams)
	if err != nil {
		log.Error().Err(err).Msg("Error getting community leaderboard")
		respondWithError(w, errIncompleteRequest)
		return
	}
	pageParams.TotalRecords = totalRecords

	response := shared.GetPaginatedResponseWithPayload(leaderboard.Users, pageParams)
	response.Data = leaderboard

	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getUserCommunities(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]

	pageParams := getPageParams(*r, 100)

	communities, totalRecords, err := models.GetCommunitiesForUser(a.DB, addr, pageParams)
	if err != nil {
		log.Error().Err(err).Msg("Error getting user communities")
		respondWithError(w, errIncompleteRequest)
		return
	}

	pageParams.TotalRecords = totalRecords
	response := shared.GetPaginatedResponseWithPayload(communities, pageParams)

	respondWithJSON(w, http.StatusOK, response)

}

func (a *App) removeUserRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]
	userType := vars["userType"]
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		log.Error().Err(err).Msg("Invalid Community ID")
		respondWithError(w, errIncompleteRequest)
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId
	payload.Addr = addr
	payload.User_type = userType

	if err := validatePayload(r.Body, &payload); err != nil {
		log.Error().Err(err).Msg("Error validating payload")
		respondWithError(w, errIncompleteRequest)
		return
	}

	_, err = helpers.removeUserRole(payload)
	if err != nil {
		log.Error().Err(err).Msg("Error removing user role")
		respondWithError(w, errIncompleteRequest)
		return
	}

	respondWithJSON(w, http.StatusOK, "OK")
}

func (a *App) getBalanceAtBlockheight(w http.ResponseWriter, r *http.Request) {
	var payload GetBalanceAtBlockheightPayload
	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, errIncompleteRequest)
	}

	result, err := a.DpsAdapter.GetBalanceAtBlockheight(payload.Address, payload.Blockheight, payload.Contract)
	if err != nil {
		log.Error().Err(err).Msg("error fetching balance at blockheight")
		respondWithError(w, errFetchingBalance)
	}

	respondWithJSON(w, http.StatusOK, result)
}

/////////////
// HELPERS //
/////////////

func respondWithError(w http.ResponseWriter, err errorResponse) {
	respondWithJSON(w, err.statusCode, map[string]string{
		"errorCode": err.errorCode,
		"message":   err.message,
		"details":   err.details,
	})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func validatePayload(body io.ReadCloser, data interface{}) error {
	decoder := json.NewDecoder(body)
	if err := decoder.Decode(&data); err != nil {
		errMsg := "Invalid request payload."
		log.Error().Err(err).Msg(errMsg)
		return errors.New(errMsg)
	}

	defer body.Close()

	return nil
}

func getPageParams(r http.Request, defaultCount int) shared.PageParams {
	s, _ := strconv.Atoi(r.FormValue("start"))
	c, _ := strconv.Atoi(r.FormValue("count"))
	o := r.FormValue("order")

	if o == "" {
		o = "desc"
	}

	if c > defaultCount || c < 1 {
		c = defaultCount
	}
	if s < 0 {
		s = 0
	}

	return shared.PageParams{
		Start: s,
		Count: c,
		Order: o,
	}
}
