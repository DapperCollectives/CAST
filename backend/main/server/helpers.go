package server

import (
	"encoding/hex"
	"errors"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
	"github.com/thoas/go-funk"
)

var allowedFileTypes = []string{"image/jpg", "image/jpeg", "image/png", "image/gif"}

const (
	maxFileSize = 5 * 1024 * 1024 // 5MB
)

type Helpers struct {
	A *App
}

func (h *Helpers) Initialize(app *App) {
	h.A = app
}

func (h *Helpers) useStrategyTally(
	p models.Proposal,
	v []*models.VoteWithBalance,
) (models.ProposalResults, error) {

	s := h.initStrategy(*p.Strategy)
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

func (h *Helpers) useStrategyGetVotes(
	p models.Proposal,
	v []*models.VoteWithBalance,
) ([]*models.VoteWithBalance, error) {

	s := h.initStrategy(*p.Strategy)
	if s == nil {
		return nil, errors.New("Strategy not found.")
	}

	votesWithWeights, err := s.GetVotes(v, &p)
	if err != nil {
		return nil, err
	}

	return votesWithWeights, nil
}

func (h *Helpers) useStrategyGetVoteWeight(
	p models.Proposal,
	v *models.VoteWithBalance,
) (float64, error) {
	s := h.initStrategy(*p.Strategy)
	if s == nil {
		return 0, errors.New("Strategy not found.")
	}

	weight, err := s.GetVoteWeightForBalance(v, &p)
	if err != nil {
		return 0, err
	}

	return weight, nil
}

func (h *Helpers) useStrategyFetchBalance(
	v models.Vote,
	p models.Proposal,
	s Strategy,
) (models.VoteWithBalance, errorResponse) {

	emptyBalance := &models.Balance{
		Addr:        v.Addr,
		Proposal_id: p.ID,
	}

	if p.Block_height != nil {
		emptyBalance.BlockHeight = *p.Block_height
	}

	c := models.Community{ID: p.Community_id}
	if err := c.GetCommunityByProposalId(h.A.DB, p.ID); err != nil {
		return models.VoteWithBalance{}, errGetCommunity
	}

	strategy, err := c.GetStrategy(*p.Strategy)
	if err != nil {
		return models.VoteWithBalance{}, errStrategyNotFound
	}

	balance, err := s.FetchBalance(emptyBalance, &p)
	if err != nil {
		log.Error().Err(err).Msgf("User does not have the required balance %v.", v.Addr)
		errResponse := errInsufficientBalance
		errResponse.Details = fmt.Sprintf(errResponse.Details, strategy.Threshold, strategy.Name)
		return models.VoteWithBalance{}, errResponse
	}

	vb := models.VoteWithBalance{
		Vote:                    v,
		PrimaryAccountBalance:   &balance.PrimaryAccountBalance,
		SecondaryAccountBalance: &balance.SecondaryAccountBalance,
		StakingBalance:          &balance.StakingBalance,
	}

	return vb, nilErr
}

func (h *Helpers) fetchProposal(vars map[string]string, query string) (models.Proposal, error) {
	proposalId, err := strconv.Atoi(vars[query])
	if err != nil {
		msg := fmt.Sprintf("Invalid proposalId: %s", vars["proposalId"])
		log.Error().Err(err).Msg(msg)
		return models.Proposal{}, errors.New(msg)
	}

	p := models.Proposal{ID: proposalId}

	if err := p.GetProposalById(h.A.DB); err != nil {
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

func (h *Helpers) uploadFile(r *http.Request) (interface{}, error) {
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

	pin, err := h.A.IpfsClient.PinFile(file, handler.Filename)
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

func (h *Helpers) getPaginatedVotes(
	r *http.Request,
	p models.Proposal,
) (
	[]*models.VoteWithBalance,
	shared.PageParams,
	error,
) {

	pageParams := getPageParams(*r, 25)

	votes, totalRecords, err := models.GetVotesForProposal(
		h.A.DB,
		p.ID,
		*p.Strategy,
		pageParams,
	)
	if err != nil {
		return nil, shared.PageParams{}, err
	}

	pageParams.TotalRecords = totalRecords

	return votes, pageParams, nil
}

func (h *Helpers) processVote(addr string, p models.Proposal) (*models.VoteWithBalance, error) {
	vote, err := h.fetchVote(addr, p.ID)
	if err != nil {
		return nil, err
	}

	weight, err := h.useStrategyGetVoteWeight(p, vote)
	if err != nil {
		return nil, err
	}

	vote.Weight = &weight
	return vote, err
}

func (h *Helpers) fetchVote(addr string, id int) (*models.VoteWithBalance, error) {
	voteWithBalance := &models.VoteWithBalance{
		Vote: models.Vote{
			Addr:        addr,
			Proposal_id: id,
		}}

	if err := voteWithBalance.GetVote(h.A.DB); err != nil {
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

func (h *Helpers) processVotes(
	addr string,
	ids []int,
	pageParams shared.PageParams,
) (
	[]*models.VoteWithBalance,
	shared.PageParams,
	error,
) {
	votes, totalRecords, err := models.GetVotesForAddress(
		h.A.DB,
		addr,
		&ids,
		pageParams,
	)
	if err != nil {
		log.Error().Err(err).Msg("Error getting votes for address.")
		return nil, pageParams, err
	}

	var votesWithBalances []*models.VoteWithBalance

	for _, vote := range votes {
		proposal := models.Proposal{ID: vote.Proposal_id}
		if err := proposal.GetProposalById(h.A.DB); err != nil {
			switch err.Error() {
			case pgx.ErrNoRows.Error():
				msg := fmt.Sprintf("Proposal with ID %d not found.", vote.Proposal_id)
				return nil, pageParams, errors.New(msg)
			default:
				return nil, pageParams, err
			}
		}

		s := h.initStrategy(*proposal.Strategy)
		if s == nil {
			return nil, pageParams, errors.New("Strategy not found.")
		}

		weight, err := s.GetVoteWeightForBalance(vote, &proposal)
		if err != nil {
			return nil, pageParams, err
		}

		vote.Weight = &weight
		votesWithBalances = append(votesWithBalances, vote)
	}

	pageParams.TotalRecords = totalRecords

	return votesWithBalances, pageParams, nil
}

func (h *Helpers) createVote(r *http.Request, p models.Proposal) (*models.VoteWithBalance, errorResponse) {
	var v models.Vote
	if err := validatePayload(r.Body, &v); err != nil {
		log.Error().Err(err).Msg("Invalid request payload.")
		return nil, errIncompleteRequest
	}

	v.Proposal_id = p.ID

	// validate user hasn't already voted
	existingVote := models.Vote{Proposal_id: v.Proposal_id, Addr: v.Addr}
	if err := existingVote.GetVote(h.A.DB); err == nil {
		errResponse := errAlreadyVoted
		errResponse.Details = fmt.Sprintf(errResponse.Details, v.Addr, v.Proposal_id)
		log.Error().Msgf(errResponse.Details)
		return nil, errResponse
	}

	// check that proposal is live
	if os.Getenv("APP_ENV") != "DEV" {
		if !p.IsLive() {
			return nil, errInactiveProposal
		}
	}

	if errResponse := h.validateVote(p, v); errResponse != nilErr {
		return nil, errResponse
	}

	v.Proposal_id = p.ID

	s := h.initStrategy(*p.Strategy)
	if s == nil {
		return nil, errStrategyNotFound
	}

	voteWithBalance, errResponse := h.useStrategyFetchBalance(v, p, s)
	if errResponse != nilErr {
		return nil, errResponse
	}

	if errResponse := h.insertVote(voteWithBalance, p); errResponse != nilErr {
		return nil, errResponse
	}

	return &voteWithBalance, nilErr
}

func (h *Helpers) insertVote(v models.VoteWithBalance, p models.Proposal) errorResponse {
	weight, err := h.useStrategyGetVoteWeight(p, &v)
	if err != nil {
		log.Error().Err(err).Msgf("Error getting vote weight for address %s.", v.Addr)
		return errIncompleteRequest
	}

	c := models.Community{ID: p.Community_id}
	if err := c.GetCommunityByProposalId(h.A.DB, p.ID); err != nil {
		return errGetCommunity
	}

	strategy, err := c.GetStrategy(*p.Strategy)
	if err != nil {
		return errStrategyNotFound
	}

	if err = p.ValidateBalance(weight); err != nil {
		log.Error().Err(err).Msg("Account balance is too low to vote on this proposal.")
		errResponse := errInsufficientBalance
		errResponse.Details = fmt.Sprintf(errResponse.Details, strategy.Threshold, strategy.Name)
		return errResponse
	}

	// Include voucher in vote data when pinning
	ipfsVote := map[string]interface{}{
		"vote": v,
	}
	v.Cid, err = h.pinJSONToIpfs(ipfsVote)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning proposal to IPFS.")
		return errCreateVote
	}

	if err := v.CreateVote(h.A.DB); err != nil {
		msg := fmt.Sprintf("Error creating vote for address %s.", v.Addr)
		log.Error().Err(err).Msg(msg)
		return errCreateVote
	}

	return nilErr
}

func (h *Helpers) validateVote(p models.Proposal, v models.Vote) errorResponse {

	// validate the user is not on community's blocklist
	if err := h.validateBlocklist(v.Addr, p.Community_id); err != nil {
		log.Error().Err(err).Msgf(fmt.Sprintf("Address %v is on blocklist for community id %v.\n", v.Addr, p.Community_id))
		return errForbidden
	}

	// validate choice exists on proposal
	if err := v.ValidateChoice(p); err != nil {
		log.Error().Err(err)
		return errIncompleteRequest
	}

	// If voucher is present
	if v.Voucher != nil {
		// Transaction Signature validation
		voucher := v.Voucher
		authorizer := voucher.Authorizers[0]

		v.Composite_signatures = shared.GetUserCompositeSignatureFromVoucher(voucher)

		// Validate authorizer
		if authorizer != v.Addr || authorizer != (*v.Composite_signatures)[0].Addr {
			err := errors.New("authorizer address must match voter address and envelope signer")
			log.Error().Err(err)
			return errIncompleteRequest
		}

		message := voucher.Arguments[0]["value"]

		messageBytes, err := hex.DecodeString(message)
		if err != nil {
			log.Error().Err(err)
			return errIncompleteRequest
		}

		// validate proper message format
		//<proposalId>:<choice>:<timestamp>
		if err := models.ValidateVoteMessage(string(messageBytes), p); err != nil {
			log.Error().Err(err)
			return errIncompleteRequest
		}

		// re-build message & composite signatures for validation
		// set v.Message as the encoded message, rather than the colon(:) delimited message above.
		// we can do this because we can always recover the tx arguments that make up the
		// colon delimited message by decoding this rlp encoded message
		v.Message = shared.EncodeMessageFromVoucher(voucher)

		if err := h.validateTxSignature(v.Addr, v.Message, v.Composite_signatures); err != nil {
			return errIncompleteRequest
		}
	} else {
		// validate proper message format
		// hex decode before validating
		if err := models.ValidateVoteMessage(v.Message, p); err != nil {
			log.Error().Err(err)
			return errIncompleteRequest
		}

		if err := h.validateUserSignature(v.Addr, v.Message, v.Composite_signatures); err != nil {
			return errIncompleteRequest
		}
	}

	return nilErr
}

func (h *Helpers) fetchCommunity(id int) (models.Community, error) {
	community := models.Community{ID: id}

	if err := community.GetCommunity(h.A.DB); err != nil {
		log.Error().Err(err)
		return models.Community{}, err
	}

	return community, nil
}

func (h *Helpers) searchCommunities(query string) ([]models.Community, error) {
	results, err := models.SearchForCommunity(h.A.DB, query)
	if err != nil {
		return []models.Community{}, err
	}

	return results, nil
}

func (h *Helpers) createProposal(p models.Proposal) (models.Proposal, errorResponse) {
	if err := h.validateStrategyName(*p.Strategy); err != nil {
		fmt.Printf("Error validating strategy name: %v \n", err)
		return models.Proposal{}, errStrategyNotFound
	}

	if p.Voucher != nil {
		if err := h.validateUserViaVoucher(p.Creator_addr, p.Voucher); err != nil {
			return models.Proposal{}, errForbidden
		}
	} else {
		if err := h.validateUser(p.Creator_addr, p.Timestamp, p.Composite_signatures); err != nil {
			return models.Proposal{}, errForbidden
		}
	}

	community, err := h.fetchCommunity(p.Community_id)
	if err != nil {
		return models.Proposal{}, errIncompleteRequest
	}

	strategy, err := models.MatchStrategyByProposal(*community.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Community does not have this strategy available.")
		return models.Proposal{}, errIncompleteRequest
	}

	// Set Min Balance/Max Weight to community defaults if not provided
	if p.Min_balance == nil {
		p.Min_balance = strategy.Contract.Threshold
	}
	if p.Max_weight == nil {
		p.Max_weight = strategy.Contract.MaxWeight
	}

	if err := h.snapshot(&strategy, &p); err != nil {
		return models.Proposal{}, errIncompleteRequest
	}

	if err := h.enforceCommunityRestrictions(community, p, strategy); err != nil {
		return models.Proposal{}, errIncompleteRequest
	}

	if err := h.processSnapshotStatus(&strategy, &p); err != nil {
		errMsg := "Error processing snapshot status."
		log.Error().Err(err).Msg(errMsg)
		return models.Proposal{}, errIncompleteRequest
	}

	p.Cid, err = h.pinJSONToIpfs(p)
	if err != nil {
		log.Error().Err(err).Msg("IPFS error: " + err.Error())
		return models.Proposal{}, errIncompleteRequest
	}

	validate := validator.New()
	vErr := validate.Struct(p)
	if vErr != nil {
		log.Error().Err(vErr)
		return models.Proposal{}, errIncompleteRequest
	}

	if os.Getenv("APP_ENV") == "PRODUCTION" {
		if strategy.Contract.Name != nil && p.Start_time.Before(time.Now().UTC().Add(time.Hour)) {
			p.Start_time = time.Now().UTC().Add(time.Hour)
		}
	}

	if err := p.CreateProposal(h.A.DB); err != nil {
		return models.Proposal{}, errIncompleteRequest
	}

	return p, nilErr
}

func (h *Helpers) validateStrategyName(name string) error {
	if name == "" {
		return errors.New("Strategy name is required.")
	}

	for k, _ := range strategyMap {
		if name == k {
			return nil
		} else {
			continue
		}
	}

	return errors.New("Strategy not found.")
}

func (h *Helpers) enforceCommunityRestrictions(
	c models.Community,
	p models.Proposal,
	s models.Strategy,
) error {

	if *c.Only_authors_to_submit {
		if err := models.EnsureRoleForCommunity(h.A.DB, p.Creator_addr, c.ID, "author"); err != nil {
			errMsg := fmt.Sprintf("Account %s is not an author for community %d.", p.Creator_addr, p.Community_id)
			log.Error().Err(err).Msg(errMsg)
			return errors.New(errMsg)
		}
	} else {
		fmt.Println("Community does not require authors to submit proposals")

		threshold, err := strconv.ParseFloat(*c.Proposal_threshold, 64)
		if err != nil {
			log.Error().Err(err).Msg("Invalid proposal threshold")
			return errors.New("Invalid proposal threshold")
		}

		contract := shared.Contract{
			Name:        c.Contract_name,
			Addr:        c.Contract_addr,
			Public_path: c.Public_path,
			Threshold:   &threshold,
		}
		hasBalance, err := h.processTokenThreshold(p.Creator_addr, contract, *c.Contract_type)
		if err != nil {
			errMsg := "Error processing Token Threshold."
			log.Error().Err(err).Msg(errMsg)
			return errors.New(errMsg)
		}

		if !hasBalance {
			errMsg := "Insufficient token balance to create proposal."
			log.Error().Err(err).Msg(errMsg)
			return errors.New(errMsg)
		}
	}

	return nil
}

func (h *Helpers) snapshot(strategy *models.Strategy, p *models.Proposal) error {
	s := h.initStrategy(*strategy.Name)

	//var snapshotResponse *shared.SnapshotResponse
	if s.RequiresSnapshot() {
		snapshotResponse, err := h.A.SnapshotClient.TakeSnapshot(strategy.Contract)
		if err != nil {
			errMsg := "Error taking snapshot."
			return errors.New(errMsg)
		}
		p.Block_height = &snapshotResponse.Data.BlockHeight
		p.Snapshot_status = &snapshotResponse.Data.Status
	}

	return nil
}

func (h *Helpers) createCommunity(payload models.CreateCommunityRequestPayload) (models.Community, error) {
	c := payload.Community

	if c.Voucher != nil {
		log.Info().Msgf("validate user via voucher %v \n", c.Voucher)
		if err := h.validateUserViaVoucher(c.Creator_addr, c.Voucher); err != nil {
			return models.Community{}, err
		}
	} else {
		if err := h.validateUser(c.Creator_addr, c.Timestamp, c.Composite_signatures); err != nil {
			return models.Community{}, err
		}
	}

	cid, err := h.pinJSONToIpfs(c)
	if err != nil {
		log.Error().Err(err).Msg("Error pinning JSON to IPFS.")
		return models.Community{}, err
	}
	c.Cid = cid

	validate := validator.New()
	vErr := validate.Struct(c)
	if vErr != nil {
		log.Error().Err(vErr).Msg("Invalid community.")
		return models.Community{}, err
	}

	if err := c.CreateCommunity(h.A.DB); err != nil {
		log.Error().Err(err).Msg("Database error creating community.")
		return models.Community{}, err
	}

	if err := h.processCommunityRoles(&c, &payload); err != nil {
		log.Error().Err(err).Msg("Error processing community roles.")
		return models.Community{}, err
	}

	return c, nil
}

func (h *Helpers) processCommunityRoles(
	c *models.Community,
	p *models.CreateCommunityRequestPayload,
) error {
	if err := models.GrantRolesToCommunityCreator(h.A.DB, c.Creator_addr, c.ID); err != nil {
		errMsg := "Database error adding community creator roles."
		log.Error().Err(err).Msg(errMsg)
		return errors.New(errMsg)
	}

	if p.Additional_admins != nil {
		for _, addr := range *p.Additional_admins {
			if err := models.GrantAdminRolesToAddress(h.A.DB, c.ID, addr); err != nil {
				log.Error().Err(err)
				return err
			}
		}
	}

	if p.Additional_authors != nil {
		for _, addr := range *p.Additional_authors {
			if err := models.GrantAuthorRolesToAddress(h.A.DB, c.ID, addr); err != nil {
				log.Error().Err(err)
				return err
			}
		}
	}

	return nil
}

func (h *Helpers) updateCommunity(id int, payload models.UpdateCommunityRequestPayload) (models.Community, error) {
	c, err := h.fetchCommunity(id)
	if err != nil {
		return models.Community{}, err
	}

	// validate is community creator
	// TODO: update to validating address is admin
	if err := c.CanUpdateCommunity(h.A.DB, payload.Signing_addr); err != nil {
		log.Error().Err(err)
		return models.Community{}, err
	}

	if payload.Voucher != nil {
		if err := h.validateUserViaVoucher(payload.Signing_addr, payload.Voucher); err != nil {
			log.Error().Err(err)
			return models.Community{}, err
		}
	} else {
		if err := h.validateUser(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
			log.Error().Err(err)
			return models.Community{}, err
		}
	}

	if err := c.UpdateCommunity(h.A.DB, &payload); err != nil {
		log.Error().Err(err)
		return models.Community{}, err
	}

	c, err = h.fetchCommunity(id)
	if err != nil {
		return models.Community{}, err
	}

	return c, nil
}

func (h *Helpers) removeUserRole(payload models.CommunityUserPayload) (int, error) {
	if payload.Voucher != nil {
		if err := h.validateUserViaVoucher(payload.Signing_addr, payload.Voucher); err != nil {
			log.Error().Err(err)
			return http.StatusForbidden, err
		}
	} else {
		if err := h.validateUser(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
			log.Error().Err(err)
			return http.StatusForbidden, err
		}
	}

	if payload.User_type == "member" {
		if payload.Addr == payload.Signing_addr {
			// If a member is removing themselves, remove all their other roles as well
			userRoles, err := models.GetAllRolesForUserInCommunity(h.A.DB, payload.Addr, payload.Community_id)
			if err != nil {
				log.Error().Err(err)
				return http.StatusInternalServerError, err
			}
			for _, userRole := range userRoles {
				if err := userRole.Remove(h.A.DB); err != nil {
					log.Error().Err(err)
					return http.StatusInternalServerError, err
				}
			}
		} else {
			// validate someone else is not removing a "member" role
			CANNOT_REMOVE_MEMBER_ERR := errors.New("Cannot remove another member from a community.")
			log.Error().Err(CANNOT_REMOVE_MEMBER_ERR)
			return http.StatusForbidden, CANNOT_REMOVE_MEMBER_ERR
		}
	}

	u := payload.CommunityUser

	if payload.User_type == "admin" {
		// validate signer is admin
		var adminUser = models.CommunityUser{Addr: payload.Signing_addr, Community_id: payload.Community_id, User_type: "admin"}
		if err := adminUser.GetCommunityUser(h.A.DB); err != nil {
			USER_MUST_BE_ADMIN_ERR := errors.New("User must be community admin.")
			log.Error().Err(err).Msg("Database error.")
			log.Error().Err(USER_MUST_BE_ADMIN_ERR)
			return http.StatusForbidden, USER_MUST_BE_ADMIN_ERR
		}
		// If the admin role is being removed, remove author role as well
		author := models.CommunityUser{Addr: u.Addr, Community_id: u.Community_id, User_type: "author"}
		if err := author.Remove(h.A.DB); err != nil {
			return http.StatusInternalServerError, err
		}
		// remove admin role
		if err := u.Remove(h.A.DB); err != nil {
			return http.StatusInternalServerError, err
		}
		// Otherwise, just remove the specified user role
	} else if err := u.Remove(h.A.DB); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (h *Helpers) createCommunityUser(payload models.CommunityUserPayload) (int, error) {
	// validate community_user payload fields
	validate := validator.New()
	vErr := validate.Struct(payload)
	if vErr != nil {
		errMsg := "Invalid community user."
		log.Error().Err(vErr).Msg(errMsg)
		return http.StatusBadRequest, errors.New(errMsg)
	}
	// validate user is allowed to create this user
	if payload.User_type != "member" {
		if payload.Signing_addr == payload.Addr {
			CANNOT_GRANT_SELF_ERR := errors.New("Users cannot grant themselves a privileged user_type.")
			log.Error().Err(CANNOT_GRANT_SELF_ERR)
			return http.StatusForbidden, CANNOT_GRANT_SELF_ERR
		}
		// If signing address is not user address, verify they have admin status in this community
		var communityAdmin = models.CommunityUser{Community_id: payload.Community_id, Addr: payload.Signing_addr, User_type: "admin"}
		if err := communityAdmin.GetCommunityUser(h.A.DB); err != nil {
			USER_MUST_BE_ADMIN_ERR := errors.New("User must be community admin to grant privileges.")
			log.Error().Err(err).Msg("Database error.")
			log.Error().Err(USER_MUST_BE_ADMIN_ERR)
			return http.StatusForbidden, USER_MUST_BE_ADMIN_ERR
		}
	}
	// only an account can add itself as a "member", unless an admin is granting
	// an address a privileged role
	if payload.User_type == "member" && payload.Addr != payload.Signing_addr {
		CANNOT_ADD_MEMBER_ERR := errors.New(
			"An account can only add itself as a community member, unless an admin is granting privileged role.",
		)
		log.Error().Err(CANNOT_ADD_MEMBER_ERR)
		return http.StatusForbidden, CANNOT_ADD_MEMBER_ERR
	}

	if payload.Voucher != nil {
		if err := h.validateUserViaVoucher(payload.Signing_addr, payload.Voucher); err != nil {
			log.Error().Err(err)
			return http.StatusForbidden, err
		}
	} else {
		if err := h.validateUser(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures); err != nil {
			log.Error().Err(err)
			return http.StatusForbidden, err
		}
	}

	// check that community user doesnt already exist
	// should throw a "ErrNoRows" error
	u := payload.CommunityUser
	if err := u.GetCommunityUser(h.A.DB); err == nil {
		errMsg := fmt.Sprintf("Error: Address %s is already a %s of community %d.\n", u.Addr, u.User_type, u.Community_id)
		log.Error().Err(err).Msg(errMsg)
		return http.StatusBadRequest, errors.New(errMsg)
	}

	// Grant appropriate roles
	if u.User_type == "admin" {
		if err := models.GrantAdminRolesToAddress(h.A.DB, u.Community_id, u.Addr); err != nil {
			log.Error().Err(err)
			return http.StatusInternalServerError, err
		}
	} else if u.User_type == "author" {
		if err := models.GrantAuthorRolesToAddress(h.A.DB, u.Community_id, u.Addr); err != nil {
			return http.StatusInternalServerError, err
		}
	} else {
		// grant member role
		if err := u.CreateCommunityUser(h.A.DB); err != nil {
			log.Error().Err(err)
			return http.StatusInternalServerError, err
		}
	}

	return http.StatusCreated, nil
}

func (h *Helpers) updateAddressesInList(id int, payload models.ListUpdatePayload, action string) (int, error) {
	l := models.List{ID: id}

	// get current proposal from DB
	if err := l.GetListById(h.A.DB); err != nil {
		errMsg := fmt.Sprintf("Error querying list with id %v.", id)
		log.Error().Err(err).Msg(errMsg)
		return http.StatusInternalServerError, err
	}

	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		errMsg := "Remove from list validation error."
		if action == "add" {
			errMsg = "Add to list validation error."
		}
		log.Error().Err(vErr).Msg(errMsg)
		return http.StatusBadRequest, errors.New(errMsg)
	}

	if err := h.validateUserWithRole(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures, l.Community_id, "admin"); err != nil {
		log.Error().Err(err)
		return http.StatusForbidden, err
	}

	if action == "remove" {
		l.RemoveAddresses(payload.Addresses)
	} else {
		l.AddAddresses(payload.Addresses)
	}

	cid, err := h.pinJSONToIpfs(l)
	if err != nil {
		log.Error().Err(err).Msg("IPFS error: " + err.Error())
		return http.StatusInternalServerError, errors.New("Error pinning JSON to IPFS.")
	}
	l.Cid = cid

	if err := l.UpdateList(h.A.DB); err != nil {
		errMsg := "Database error updating list."
		log.Error().Err(err).Msg(errMsg)
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (h *Helpers) createListForCommunity(payload models.ListPayload) (models.List, int, error) {
	if existingList, _ := models.GetListForCommunityByType(h.A.DB, payload.Community_id, *payload.List_type); existingList.ID > 0 {
		errMsg := fmt.Sprintf("List of type %s already exists for community %d.", *payload.List_type, payload.Community_id)
		return models.List{}, http.StatusBadRequest, errors.New(errMsg)
	}

	// validate payload fields
	validate := validator.New()
	if vErr := validate.Struct(payload); vErr != nil {
		errMsg := "Validation error in list payload."
		log.Error().Err(vErr).Msg(errMsg)
		return models.List{}, http.StatusBadRequest, errors.New(errMsg)
	}

	if err := h.validateUserWithRole(payload.Signing_addr, payload.Timestamp, payload.Composite_signatures, payload.Community_id, "admin"); err != nil {
		log.Error().Err(err)
		return models.List{}, http.StatusForbidden, err
	}

	l := payload.List

	cid, err := h.pinJSONToIpfs(l)
	if err != nil {
		log.Error().Err(err).Msg("IPFS error: " + err.Error())
		return models.List{}, http.StatusInternalServerError, errors.New("Error pinning JSON to IPFS.")
	}
	l.Cid = cid

	// create list
	if err := l.CreateList(h.A.DB); err != nil {
		return models.List{}, http.StatusInternalServerError, err
	}

	return l, http.StatusCreated, nil
}

func (h *Helpers) validateUserSignature(addr string, message string, sigs *[]shared.CompositeSignature) error {
	shouldValidateSignature := h.A.Config.Features["validateSigs"]

	if !shouldValidateSignature {
		return nil
	}

	hexMessage := hex.EncodeToString([]byte(message))
	if err := h.A.FlowAdapter.ValidateSignature(addr, hexMessage, sigs, "USER"); err != nil {
		return err
	}

	return nil
}

func (h *Helpers) validateTxSignature(addr string, message string, sigs *[]shared.CompositeSignature) error {
	shouldValidateSignature := h.A.Config.Features["validateSigs"]

	if !shouldValidateSignature {
		return nil
	}

	if err := h.A.FlowAdapter.ValidateSignature(addr, message, sigs, "TRANSACTION"); err != nil {
		return err
	}
	return nil
}

func (h *Helpers) validateBlocklist(addr string, communityId int) error {
	if !h.A.Config.Features["validateBlocklist"] {
		return nil
	}

	blockList, _ := models.GetListForCommunityByType(h.A.DB, communityId, "block")
	isBlocked := funk.Contains(blockList.Addresses, addr)

	isTest := flag.Lookup("test.v") != nil

	if isBlocked && !isTest {
		return errors.New("User does not have permission.")
	}
	return nil
}

// Need to move this to conditional middleware
func (h *Helpers) validateTimestamp(timestamp string, expiry int) error {
	if !h.A.Config.Features["validateTimestamps"] {
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

func (h *Helpers) validateUser(addr, timestamp string, compositeSignatures *[]shared.CompositeSignature) error {

	if err := h.validateTimestamp(timestamp, 60); err != nil {
		return err
	}

	if err := h.validateUserSignature(addr, timestamp, compositeSignatures); err != nil {
		return err
	}

	return nil
}

func (h *Helpers) validateUserViaVoucher(addr string, voucher *shared.Voucher) error {
	timestamp := voucher.Arguments[0]["value"]
	if err := h.validateTimestamp(timestamp, 60); err != nil {
		return err
	}

	compositeSignatures := shared.GetUserCompositeSignatureFromVoucher(voucher)
	// Validate authorizer
	authorizer := voucher.Authorizers[0]
	if authorizer != addr || authorizer != (*compositeSignatures)[0].Addr {
		err := errors.New("authorizer address must match voter address and envelope signer")
		log.Error().Err(err)
		return err
	}
	// validate signature using encoded transaction payload as message
	message := shared.EncodeMessageFromVoucher(voucher)
	if err := h.validateTxSignature(addr, message, compositeSignatures); err != nil {
		return err
	}

	return nil
}

func (h *Helpers) validateUserWithRole(addr, timestamp string, compositeSignatures *[]shared.CompositeSignature, communityId int, role string) error {
	//print out all the params
	if err := h.validateTimestamp(timestamp, 60); err != nil {
		return err
	}
	if err := h.validateUserSignature(addr, timestamp, compositeSignatures); err != nil {
		return err
	}
	if err := models.EnsureRoleForCommunity(h.A.DB, addr, communityId, role); err != nil {
		errMsg := fmt.Sprintf("Account %s is not an author for community %d.", addr, communityId)
		log.Error().Err(err).Msg(errMsg)
		return err
	}

	return nil
}

func (h *Helpers) validateUserWithRoleViaVoucher(addr string, voucher *shared.Voucher, communityId int, role string) error {
	timestamp := voucher.Arguments[0]["value"]
	if err := h.validateTimestamp(timestamp, 60); err != nil {
		return err
	}

	compositeSignatures := shared.GetUserCompositeSignatureFromVoucher(voucher)
	// Validate authorizer
	authorizer := voucher.Authorizers[0]
	if authorizer != addr || authorizer != (*compositeSignatures)[0].Addr {
		err := errors.New("authorizer address must match voter address and envelope signer")
		log.Error().Err(err)
		return err
	}

	// validate signature using encoded transaction payload as message
	message := shared.EncodeMessageFromVoucher(voucher)
	if err := h.validateTxSignature(addr, message, compositeSignatures); err != nil {
		return err
	}
	if err := models.EnsureRoleForCommunity(h.A.DB, addr, communityId, role); err != nil {
		errMsg := fmt.Sprintf("Account %s is not an author for community %d.", addr, communityId)
		log.Error().Err(err).Msg(errMsg)
		return err
	}

	return nil
}

func (h *Helpers) processSnapshotStatus(s *models.Strategy, p *models.Proposal) error {
	var processing = "processing"

	if s.Contract.Name != nil && p.Snapshot_status == &processing {
		snapshotResponse, err := h.A.SnapshotClient.
			GetSnapshotStatusAtBlockHeight(
				s.Contract,
				*p.Block_height,
			)
		if err != nil {
			return err
		}

		p.Snapshot_status = &snapshotResponse.Data.Status

		if err := p.UpdateSnapshotStatus(h.A.DB); err != nil {
			return err
		}
	}
	return nil

}

func (h *Helpers) processTokenThreshold(address string, c shared.Contract, contractType string) (bool, error) {
	var scriptPath string

	if contractType == "nft" {
		scriptPath = "./main/cadence/scripts/get_nfts_ids.cdc"
	} else {
		scriptPath = "./main/cadence/scripts/get_balance.cdc"
	}

	hasBalance, err := h.A.FlowAdapter.EnforceTokenThreshold(scriptPath, address, &c)
	if err != nil {
		return false, err
	}

	return hasBalance, nil
}

func (h *Helpers) initStrategy(name string) Strategy {
	s := strategyMap[name]
	if s == nil {
		return nil
	}

	s.InitStrategy(h.A.FlowAdapter, h.A.DB, h.A.SnapshotClient)

	return s
}

func (h *Helpers) pinJSONToIpfs(data interface{}) (*string, error) {
	shouldOverride := flag.Lookup("ipfs-override").Value.(flag.Getter).Get().(bool)
	if shouldOverride {
		dummyHash := "dummy-hash"
		return &dummyHash, nil
	}

	pin, err := h.A.IpfsClient.PinJson(data)
	if err != nil {
		return nil, err
	}
	return &pin.IpfsHash, nil
}

func validateContractThreshold(s []models.Strategy) error {
	for _, s := range s {
		if s.Threshold != nil {
			if *s.Threshold < 1 {
				return errors.New("Contract Threshold cannot be less than 1.")
			}
		}
	}
	return nil
}

func validateProposalThreshold(threshold string, onlyAuthorsToSubmit bool) error {
	propThreshold, err := strconv.ParseFloat(threshold, 64)
	if err != nil {
		return errors.New("Error Converting Proposal Threshold to Float.")
	}
	if !onlyAuthorsToSubmit && propThreshold < 1 {
		return errors.New("Proposal Threshold cannot be less than 1.")
	}
	return nil
}
