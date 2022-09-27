package strategies

import (
	"sort"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"golang.org/x/exp/slices"
)

type TallyStruct struct {
	choice string
	votes int
}

func RankedChoice(
	votes []*models.VoteWithBalance, 
	r *models.ProposalResults, 
	proposal *models.Proposal,
	isNFT bool,
) {
	firstRank := 0

	// Put choices into a map for tallying.
	tallyMap := make(map[string]int)
	for i := 0; i < len(proposal.Choices); i += 1 {
		tallyMap[proposal.Choices[i].Choice_text] = 0
	}

	for {
		totalVotes := 0
		
		for _, vote := range votes {
			includeVote := (isNFT && len(vote.NFTs) != 0) || !isNFT
			exhaustedVote := len(vote.Choices) == 0
			if includeVote && !exhaustedVote {
				totalVotes += 1
				tallyMap[vote.Choices[firstRank]] += 1
				r.Results[vote.Choices[firstRank]] += 1
				r.Results_float[vote.Choices[firstRank]] += 1
			}
		}

		// Create an array from the tally map for sorting.
		tallyArray := make([]TallyStruct, len(tallyMap))
		i := 0
		for key, value := range tallyMap {
			tallyArray[i] = TallyStruct{
				choice: key, 
				votes: value,
			}
			i++
		}

		// Sort tallied votes from highest to lowest
		sort.Slice(tallyArray, func(i, j int) bool {
			return tallyArray[i].votes > tallyArray[j].votes
		})

		// Check for a winner: highest scored choice is a majority of the votes
		// or is the last choice remaining in the event of a split.
		if(tallyArray[0].votes > totalVotes / 2 || len(tallyArray) == 1) {
			break
		}

		// Last place is the end of the sorted array.
		lastPlace := tallyArray[len(tallyArray) - 1].choice

		// Remove the last place choice from the tally map.
		delete(tallyMap, lastPlace)

		// Remove the last place choice from votes.
		for _, vote := range votes {
			i := slices.IndexFunc(vote.Choices, func(s string) bool { return s == lastPlace })
			if i >= 0 {
				vote.Choices = append(vote.Choices[:i], vote.Choices[i+1:]...)
			}
		}

		//Reset score for next round of tallying.
		for _, t := range tallyArray {
			tallyMap[t.choice] = 0
			r.Results[t.choice] = 0
			r.Results_float[t.choice] = 0
		}
	}
}

func SingleChoiceNFT(
	votes []*models.VoteWithBalance, 
	r *models.ProposalResults, 
	proposal *models.Proposal,
	getVoteWeight func (vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error),
) error {
	for _, vote := range votes {
		if len(vote.NFTs) != 0 {
			var voteWeight float64

			voteWeight, err := getVoteWeight(vote, proposal)
			if err != nil {
				return err
			}

			r.Results[vote.Choices[0]] += int(voteWeight)
			r.Results_float[vote.Choices[0]] += voteWeight
		}
	}

	return nil
}