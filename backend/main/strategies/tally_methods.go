package strategies

import (
	"fmt"
	"sort"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"golang.org/x/exp/slices"
)

type TallyStruct struct {
	choice string
	votes  int
}

func RankedChoice(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	proposal *models.Proposal,
	isNFT bool,
) {
	firstRank := 0

	// Create a copy of the votes so the original votes slice is not changed.
	tmpVotes := make([]*models.VoteWithBalance, len(votes))
	copy(tmpVotes, votes)

	// Put choices into a map for tallying.
	tallyMap := make(map[string]int)
	for i := range proposal.Choices {
		choiceKey := fmt.Sprintf("%d", *proposal.Choices[i].ID)
		tallyMap[choiceKey] = 0
	}

	for {
		totalVotes := 0

		// Count votes.
		for _, vote := range tmpVotes {
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
		tallyArray := createArray(tallyMap)

		// Sort tallied votes from highest to lowest
		sort.Slice(tallyArray, func(i, j int) bool {
			return tallyArray[i].votes > tallyArray[j].votes
		})

		// Check for a winner: highest scored choice is a majority of the votes
		// or is the last choice remaining in the event of a split.
		if tallyArray[0].votes > totalVotes/2 || len(tallyArray) == 1 {
			break
		}

		//Reset score for next round of tallying.
		for _, t := range tallyArray {
			tallyMap[t.choice] = 0
			r.Results[t.choice] = 0
			r.Results_float[t.choice] = 0
		}

		// Last place is the end of the sorted array.
		lastPlace := tallyArray[len(tallyArray)-1].choice

		// Remove the last place choice from the tally map.
		delete(tallyMap, lastPlace)

		// Remove the last place choice from votes.
		for _, vote := range votes {
			vote.Choices = removeChoice(vote.Choices, lastPlace)
		}
	}
}

func SingleChoiceNFT(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	proposal *models.Proposal,
	getVoteWeight func(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error),
) error {	
	for i := 0; i < len(proposal.Choices); i += 1 {
		choiceKey := fmt.Sprintf("%d", *proposal.Choices[i].ID)
		r.Results[choiceKey] = 0
		r.Results_float[choiceKey] = 0
	}
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

func removeChoice(choices []string, choice string) []string {
	i := slices.IndexFunc(choices, func(s string) bool { return s == choice })
	if i >= 0 {
		choices = append(choices[:i], choices[i+1:]...)
	}

	return choices
}

func createArray(tallyMap map[string]int) []TallyStruct {
	tallyArray := make([]TallyStruct, len(tallyMap))
	i := 0
	for key, value := range tallyMap {
		tallyArray[i] = TallyStruct{
			choice: key,
			votes:  value,
		}
		i++
	}
	return tallyArray
}
