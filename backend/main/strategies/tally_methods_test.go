package strategies

import (
	"fmt"
	"strconv"
	"strings"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"gotest.tools/assert"
)

var VoteChoiceToId = map[string]string{
	"a": "0",
	"b": "1",
	"c": "2",
	"d": "3",
}

func TestRankedChoiceVoting(t *testing.T) {
	c := strings.Fields("a b c d")
	choices := make([]shared.Choice, 4)
	for i := 0; i < len(c); i += 1 {
		id := uint(i)
		choices[i].ID = &id
		choices[i].Choice_text = c[i]
	}
	computedStatus := "closed"
	proposal := &models.Proposal{
		Choices:         choices,
		TallyMethod:     "ranked-choice",
		Computed_status: &computedStatus,
	}

	// First Round Winner
	t1Votes := make([]*models.VoteWithBalance, 5)
	t1Votes[0] = createVote("a b c d")
	t1Votes[1] = createVote("a b d c")
	t1Votes[2] = createVote("a c d")
	t1Votes[3] = createVote("a")
	t1Votes[4] = createVote("a")
	t1Results := createProposalResults(proposal)
	updateProposalResults(
		t1Results,
		"0:5 1:0 2:0 3:0",
	)

	// Fourth Round Winner
	t2Votes := make([]*models.VoteWithBalance, 5)
	t2Votes[0] = createVote("a b c d")
	t2Votes[1] = createVote("a b d c")
	t2Votes[2] = createVote("b c a")
	t2Votes[3] = createVote("b")
	t2Votes[4] = createVote("c")
	t2Results := createProposalResults(proposal)
	updateProposalResults(
		t2Results,
		"0:3 1:0 2:0 3:0",
	)

	// Split Vote
	t3Votes := make([]*models.VoteWithBalance, 4)
	t3Votes[0] = createVote("a")
	t3Votes[1] = createVote("a")
	t3Votes[2] = createVote("b")
	t3Votes[3] = createVote("b")
	t3Results := createProposalResults(proposal)
	updateProposalResults(
		t3Results,
		"0:2 1:0 2:0 3:0",
	)

	// Larger Vote
	t4Votes := make([]*models.VoteWithBalance, 18)
	t4Votes[0] = createVote("a c d")
	t4Votes[1] = createVote("a c d")
	t4Votes[2] = createVote("a c d")
	t4Votes[3] = createVote("a c d")
	t4Votes[4] = createVote("a c d")
	t4Votes[5] = createVote("a c d")
	t4Votes[6] = createVote("b d c")
	t4Votes[7] = createVote("b d c")
	t4Votes[8] = createVote("b d c")
	t4Votes[9] = createVote("b d c")
	t4Votes[10] = createVote("c a b d")
	t4Votes[11] = createVote("c a b d")
	t4Votes[12] = createVote("c d")
	t4Votes[13] = createVote("c d")
	t4Votes[14] = createVote("c b")
	t4Votes[15] = createVote("b d a c")
	t4Votes[16] = createVote("b d a c")
	t4Votes[17] = createVote("d")
	t4Results := createProposalResults(proposal)
	updateProposalResults(
		t4Results,
		"0:8 1:7 2:0 3:0",
	)

	// Choices with No votes
	t5Votes := make([]*models.VoteWithBalance, 6)
	t5Votes[0] = createVote("a b")
	t5Votes[1] = createVote("b a")
	t5Votes[2] = createVote("a")
	t5Votes[3] = createVote("a")
	t5Votes[4] = createVote("b")
	t5Votes[5] = createVote("a b")
	t5Results := createProposalResults(proposal)
	updateProposalResults(
		t5Results,
		"0:4 1:2 2:0 3:0",
	)

	subTests := []struct {
		name     string
		votes    []*models.VoteWithBalance
		proposal *models.Proposal
		expected *models.ProposalResults
	}{
		{
			name:     "First Round Winner",
			proposal: proposal,
			votes:    t1Votes,
			expected: t1Results,
		},
		{
			name:     "Fourth Round Winner",
			proposal: proposal,
			votes:    t2Votes,
			expected: t2Results,
		},
		{
			name:     "Split Vote",
			proposal: proposal,
			votes:    t3Votes,
			expected: t3Results,
		},
		{
			name:     "Larger Vote",
			proposal: proposal,
			votes:    t4Votes,
			expected: t4Results,
		},
		{
			name:     "Choices with No Votes",
			proposal: proposal,
			votes:    t5Votes,
			expected: t5Results,
		},
	}
	for _, subTest := range subTests {
		t.Run(subTest.name, func(t *testing.T) {
			results := createProposalResults(subTest.proposal)
			RankedChoice(subTest.votes, results, subTest.proposal, true)
			assert.DeepEqual(t, subTest.expected.Results, results.Results)
		})
	}
}

func TestSingleChoiceVoting(t *testing.T) {

	c := strings.Fields("a b c d")
	choices := make([]shared.Choice, 4)
	for i := 0; i < len(c); i += 1 {
		id := uint(i)
		choices[i].ID = &id
		choices[i].Choice_text = c[i]
	}
	computedStatus := "closed"
	proposal := &models.Proposal{
		Choices:         choices,
		TallyMethod:     "single-choice",
		Computed_status: &computedStatus,
	}

	// One choice
	t1Votes := make([]*models.VoteWithBalance, 3)
	t1Votes[0] = createVote("a")
	t1Votes[1] = createVote("a")
	t1Votes[2] = createVote("a")
	t1Results := createProposalResults(proposal)
	updateProposalResults(
		t1Results,
		"0:3 1:0 2:0 3:0",
	)

	// Random voting pattern
	t2Votes := make([]*models.VoteWithBalance, 5)
	t2Votes[0] = createVote("a")
	t2Votes[1] = createVote("b")
	t2Votes[2] = createVote("b")
	t2Votes[3] = createVote("c")
	t2Votes[4] = createVote("d")
	t2Results := createProposalResults(proposal)
	updateProposalResults(
		t2Results,
		"0:1 1:2 2:1 3:1",
	)

	subTests := []struct {
		name     string
		votes    []*models.VoteWithBalance
		proposal *models.Proposal
		expected *models.ProposalResults
	}{
		{
			name:     "One Choice",
			proposal: proposal,
			votes:    t1Votes,
			expected: t1Results,
		},
		{
			name:     "Random Voting Pattern",
			proposal: proposal,
			votes:    t2Votes,
			expected: t2Results,
		},
	}
	for _, subTest := range subTests {
		t.Run(subTest.name, func(t *testing.T) {
			mockGetVoteWeight := func(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
				return 1.0, nil
			}
			results := createProposalResults(subTest.proposal)
			SingleChoiceNFT(subTest.votes, results, subTest.proposal, mockGetVoteWeight)
			assert.DeepEqual(t, subTest.expected.Results, results.Results)
		})
	}
}

func createVote(choices string) *models.VoteWithBalance {
	mockNFT := &models.NFT{
		ID: 12345678,
	}
	mockNFTs := make([]*models.NFT, 1)
	mockNFTs[0] = mockNFT

	var choiceIds []string
	for _, choice := range strings.Fields(choices) {
		choiceIds = append(choiceIds, VoteChoiceToId[choice])
	}

	vote := models.Vote{
		Choices: choiceIds,
	}

	return &models.VoteWithBalance{
		Vote: vote,
		NFTs: mockNFTs,
	}
}

func createProposalResults(p *models.Proposal) *models.ProposalResults {
	pr := models.ProposalResults{
		Results:       make(map[string]int),
		Results_float: make(map[string]float64),
	}

	for _, choice := range p.Choices {
		id := fmt.Sprintf("%d", *choice.ID)
		pr.Results[id] = 0
		pr.Results_float[id] = 0.0
	}

	return &pr
}

func updateProposalResults(r *models.ProposalResults, results string) *models.ProposalResults {
	newResults := strings.Fields(results)

	for _, newResult := range newResults {
		kvp := strings.Split(newResult, ":")
		value, _ := strconv.Atoi(kvp[1])
		r.Results[kvp[0]] = value
	}

	return r
}
