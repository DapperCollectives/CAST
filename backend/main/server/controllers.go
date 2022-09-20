package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
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

	resp, err := helpers.uploadFile(r)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, resp)
}

// Votes
func (a *App) getResultsForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposal, err := helpers.fetchProposal(vars, "proposalId")

	votes, err := models.GetAllVotesForProposal(a.DB, proposal.ID, *proposal.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Error getting votes for proposal.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	results, err := helpers.useStrategyTally(proposal, votes)
	if err != nil {
		log.Error().Err(err).Msg("Error tallying votes.")
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if *proposal.Computed_status == "closed" && !proposal.Achievements_done {
		if err := models.AddWinningVoteAchievement(a.DB, votes, results); err != nil {
			errMsg := "Error calculating winning votes"
			log.Error().Err(err).Msg(errMsg)
			respondWithError(w, http.StatusInternalServerError, errors.New(errMsg).Error())
		}

	}

	respondWithJSON(w, http.StatusOK, results)
}

func (a *App) getVotesForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	proposal, err := helpers.fetchProposal(vars, "proposalId")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	votes, order, _ := helpers.getPaginatedVotes(r, proposal)
	votesWithWeights, _ := helpers.useStrategyGetVotes(proposal, votes)

	response := shared.GetPaginatedResponseWithPayload(votesWithWeights, order)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) getVoteForAddress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	addr := vars["addr"]

	proposal, err := helpers.fetchProposal(vars, "proposalId")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	vote, err := helpers.processVote(addr, proposal)
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

	pageParams := getPageParams(*r, 25)

	votes, pageParams, err := helpers.processVotes(addr, proposalIds, pageParams)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := shared.GetPaginatedResponseWithPayload(votes, pageParams)
	respondWithJSON(w, http.StatusOK, response)
}

func (a *App) createVoteForProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	proposal, err := helpers.fetchProposal(vars, "proposalId")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	vote, e := helpers.createVote(r, proposal)
	if err != nil {
		respondWithError(w, e.status, e.err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, vote)
}

// Proposals
func (a *App) getProposalsForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	pageParams := getPageParams(*r, 25)
	status := r.FormValue("status")

	proposals, totalRecords, err := models.GetProposalsForCommunity(
		a.DB,
		communityId,
		status,
		pageParams,
	)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	c, e := helpers.fetchCommunity(p.Community_id)
	if e.err != nil {
		respondWithError(w, e.status, e.err.Error())
		return
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := helpers.processSnapshotStatus(&strategy, &p); err != nil {
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
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	proposal, e := helpers.createProposal(p)
	if e.err != nil {
		respondWithError(w, e.status, e.err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, proposal)
}

func (a *App) updateProposal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	p, err := helpers.fetchProposal(vars, "id")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Proposal ID.")
		return
	}

	var payload models.UpdateProposalRequestPayload
	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Check that status update is valid
	// For now we are assuming proposals are creating with status 'published' and may be cancelled.
	if payload.Status != "cancelled" {
		respondWithError(w, http.StatusBadRequest, "You may only change a proposal's status to 'cancelled'.")
		return
	}

	if payload.Voucher != nil {
		if err := helpers.validateUserWithRoleViaVoucher(
			payload.Signing_addr,
			payload.Voucher,
			p.Community_id,
			"author"); err != nil {
			respondWithError(w, http.StatusForbidden, err.Error())
			return
		}
	} else {
		if err := helpers.validateUserWithRole(
			payload.Signing_addr,
			payload.Timestamp,
			payload.Composite_signatures,
			p.Community_id,
			"author"); err != nil {
			respondWithError(w, http.StatusForbidden, err.Error())
			return
		}
	}

	p.Status = &payload.Status
	p.Cid, err = helpers.pinJSONToIpfs(p)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
	pageParams := getPageParams(*r, 25)

	communities, totalRecords, err := models.GetCommunities(a.DB, pageParams)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	respondWithJSON(w, http.StatusOK, results)
}

func (a *App) getCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	c, e := helpers.fetchCommunity(id)
	if e.err != nil {
		fmt.Printf("err: %v", err)
		respondWithError(w, e.status, e.err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, c)
}

func (a *App) getCommunitiesForHomePage(w http.ResponseWriter, r *http.Request) {
	pageParams := getPageParams(*r, 25)

	communities, totalRecords, err := models.GetCommunitiesForHomePage(a.DB, pageParams)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	//Validate Strategies & Proposal Thresholds
	if payload.Strategies != nil {
		err = validateContractThreshold(*payload.Strategies)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
	}
	if payload.Proposal_threshold != nil && payload.Only_authors_to_submit != nil {
		err = validateProposalThreshold(*payload.Proposal_threshold, *payload.Only_authors_to_submit)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, err.Error())
		}
	}

	c, httpStatus, err := helpers.createCommunity(payload)
	if err != nil {
		respondWithError(w, httpStatus, err.Error())
		return
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
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	//Validate Contract Thresholds
	if payload.Strategies != nil {
		err = validateContractThreshold(*payload.Strategies)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
	}
	if payload.Proposal_threshold != nil && payload.Only_authors_to_submit != nil {
		err = validateProposalThreshold(*payload.Proposal_threshold, *payload.Only_authors_to_submit)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, err.Error())
		}
	}

	c, e := helpers.updateCommunity(id, payload)
	if e.err != nil {
		respondWithError(w, e.status, e.err.Error())
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

func (a *App) getActiveStrategiesForCommunity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	strategies, err := models.GetActiveStrategiesForCommunity(a.DB, communityId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		return
	}

	payload := models.ListPayload{}
	payload.Community_id = communityId

	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	l, httpStatus, err := helpers.createListForCommunity(payload)
	if err != nil {
		respondWithError(w, httpStatus, err.Error())
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

	payload := models.ListUpdatePayload{}
	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	httpStatus, err := helpers.updateAddressesInList(id, payload, "add")
	if err != nil {
		respondWithError(w, httpStatus, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, "OK")
}

func (a *App) removeAddressesFromList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid list ID.")
		return
	}

	payload := models.ListUpdatePayload{}
	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	httpStatus, err := helpers.updateAddressesInList(id, payload, "remove")
	if err != nil {
		respondWithError(w, httpStatus, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, "OK")
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
		return
	}

	respondWithJSON(w, http.StatusOK, snapshot)
}

func (a *App) addFungibleToken(w http.ResponseWriter, r *http.Request) {
	payload := struct {
		Addr string `json:"addr" validate:"required"`
		Name string `json:"name" validate:"required"`
		Path string `json:"path" validate:"required"`
	}{}

	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	err := a.SnapshotClient.AddFungibleToken(payload.Addr, payload.Name, payload.Path)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, "OK")
}

///////////
// Users //
///////////

func (a *App) createCommunityUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId

	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	httpStatus, err := helpers.createCommunityUser(payload)
	if err != nil {
		respondWithError(w, httpStatus, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, "OK")
}

func (a *App) getCommunityUsers(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	communityId, err := strconv.Atoi(vars["communityId"])

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	pageParams := getPageParams(*r, 100)

	users, totalRecords, err := models.GetUsersForCommunity(a.DB, communityId, pageParams)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	userType := vars["userType"]
	if !models.EnsureValidRole(userType) {
		respondWithError(w, http.StatusBadRequest, "Invalid userType.")
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
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID")
		return
	}

	addr := r.FormValue("addr")
	pageParams := getPageParams(*r, 100)

	leaderboard, totalRecords, err := models.GetCommunityLeaderboard(a.DB, communityId, addr, pageParams)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusBadRequest, "Invalid Community ID.")
		return
	}

	payload := models.CommunityUserPayload{}
	payload.Community_id = communityId
	payload.Addr = addr
	payload.User_type = userType

	if err := validatePayload(r.Body, &payload); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	httpStatus, err := helpers.removeUserRole(payload)
	if err != nil {
		respondWithError(w, httpStatus, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, "OK")
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
