package strategies

import (
	"strconv"
	"strings"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/stretchr/testify/assert"
)

func TestRankedChoiceVoting(t *testing.T) {

	c := strings.Fields("a b c d")
	choices := make([]shared.Choice, 4)
	for i := 0; i < len(c); i += 1 {
		choices[i].Choice_text = c[i]
	}
	proposal := &models.Proposal{
		Choices: choices,
		TallyMethod: "ranked-choice",
	}
	proposalResults := createProposalResults(proposal)

	balanceOfNFTs := BalanceOfNfts{}
	
	singleWinnerVotes := make([]*models.VoteWithBalance, 5)
	singleWinnerVotes[0] = createVote("a b c d")
	singleWinnerVotes[1] = createVote("a b d c")
	singleWinnerVotes[2] = createVote("a c d")
	singleWinnerVotes[3] = createVote("a")
	singleWinnerVotes[4] = createVote("a")
	expectedSingleWinnerResults := createProposalResults(proposal)
	updateProposalResults(
		expectedSingleWinnerResults,
		"a:5 b:0 c:0 d:0",
	)

	fourthRoundWinnerVotes := make([]*models.VoteWithBalance, 5)
	fourthRoundWinnerVotes[0] = createVote("a b c d")
	fourthRoundWinnerVotes[1] = createVote("a b d c")
	fourthRoundWinnerVotes[2] = createVote("b c a")
	fourthRoundWinnerVotes[3] = createVote("b")
	fourthRoundWinnerVotes[4] = createVote("c")
	expectedFourthRoundWinnerResults := createProposalResults(proposal)
	updateProposalResults(
		expectedFourthRoundWinnerResults,
		"a:0 b:4 c:0 d:0",
	)

	splitVoteVotes := make([]*models.VoteWithBalance, 4)
	splitVoteVotes[0] = createVote("a")
	splitVoteVotes[1] = createVote("a")
	splitVoteVotes[2] = createVote("b")
	splitVoteVotes[3] = createVote("b")
	expectedSplitVoteResults := createProposalResults(proposal)
	updateProposalResults(
		expectedSplitVoteResults,
		"a:0 b:2 c:0 d:0",
	)

    subTests := []struct {
        name           string
        votes 		   []*models.VoteWithBalance
		r 			   *models.ProposalResults
		proposal 	   *models.Proposal
		expected *models.ProposalResults
    }{
        {
            name: "Single Winner",
			votes: singleWinnerVotes,
			r: proposalResults,
            proposal: proposal,
			expected: expectedSingleWinnerResults,
        },
		{
            name: "Fourth Round Winner",
			votes: fourthRoundWinnerVotes,
			r: proposalResults,
            proposal: proposal,
			expected: expectedFourthRoundWinnerResults,
        },
		{
            name: "Split Vote",
			votes: splitVoteVotes,
			r: proposalResults,
            proposal: proposal,
			expected: expectedSplitVoteResults,
        },
    }
    for _, subTest := range subTests {
        t.Run(subTest.name, func(t *testing.T) {
			results, _ := balanceOfNFTs.TallyVotes(subTest.votes, subTest.r, subTest.proposal)
			assert.Equal(t, subTest.expected.Results, results.Results)
        })
    }
}

func createVote(choices string) *models.VoteWithBalance {
	mockNFT := &models.NFT{
		ID: 12345678,
	}
	mockNFTs := make([]*models.NFT, 1)
	mockNFTs[0] = mockNFT

	vote := models.Vote{
		Choices: strings.Fields(choices),
	}

	return &models.VoteWithBalance{
		Vote: vote,
		NFTs: mockNFTs,
	}
}

func createProposalResults(p *models.Proposal) *models.ProposalResults {
	pr := models.ProposalResults{
		Results: make(map[string]int),
		Results_float: make(map[string]float64),
	}

	for _, choice := range p.Choices {
		pr.Results[choice.Choice_text] = 0
		pr.Results_float[choice.Choice_text] = 0.0
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

