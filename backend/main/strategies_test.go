package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
)

/*********************/
/*     COMMUNITIES   */
/*********************/

/* Token Weighted Default */
func TestTokenWeightedDefaultStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")

	communityId := otu.AddCommunities(1)[0]
	proposalId := otu.AddProposals(communityId, 1)[0]
	votes := otu.GenerateListOfVotes(proposalId, 10)
	otu.AddDummyVotesAndBalances(votes)

	t.Run("Test Tallying Results", func(t *testing.T) {
		// Tally results
		_results := otu.TallyResultsForTokenWeightedDefault(proposalId, votes)
		log.Info().Msgf("expected results: %v", _results)

		// Fetch Proposal Results
		response := otu.GetProposalResultsAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var results models.ProposalResults
		json.Unmarshal(response.Body.Bytes(), &results)

		log.Info().Msgf("actual results: %v", results)

		assert.Equal(t, _results.Proposal_id, results.Proposal_id)
		assert.Equal(t, _results.Results["a"], results.Results["a"])
		assert.Equal(t, _results.Results["b"], results.Results["b"])
	})
}
