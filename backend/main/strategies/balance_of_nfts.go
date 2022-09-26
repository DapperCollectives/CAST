package strategies

import (
	"fmt"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
	"golang.org/x/exp/slices"
)

type BalanceOfNfts struct {
	shared.StrategyStruct
	DPS shared.DpsAdapter
	DB  *shared.Database
}

func (b *BalanceOfNfts) FetchBalance(
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	v := models.Vote{Proposal_id: balance.Proposal_id, Addr: balance.Addr}
	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
		Vote: v,
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(b.DB, balance.Proposal_id); err != nil {
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract.")
		return nil, err
	}

	if err := b.queryNFTs(*vb, strategy, balance); err != nil {
		return nil, err
	}

	return balance, nil
}

func (b *BalanceOfNfts) queryNFTs(
	vb models.VoteWithBalance,
	strategy models.Strategy,
	balance *models.Balance,
) error {
	scriptPath := "./main/cadence/scripts/get_nfts_ids.cdc"
	nftIds, err := b.FlowAdapter.GetNFTIds(
		balance.Addr,
		&strategy.Contract,
		scriptPath,
	)
	if err != nil {
		return err
	}

	for _, nftId := range nftIds {
		nft := &models.NFT{
			ID: nftId,
		}
		vb.NFTs = append(vb.NFTs, nft)
	}

	doesExist, err := models.DoesNFTExist(b.DB, &vb)
	if err != nil {
		return err
	}

	//only if the NFT ID is not already in the DB,
	//do we add the balance
	if !doesExist && err == nil {
		err = models.CreateUserNFTRecord(b.DB, &vb)
		balance.NFTCount = len(vb.NFTs)
	}

	return err
}

func (b *BalanceOfNfts) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	proposal *models.Proposal,
) (models.ProposalResults, error) {

	// Ranked choice only comes into effect once proposal is closed for final result
	// and that proposal has more than 2 non-image choices
	// TODO: Add check for text only choices
	// TODO: Add computed_status == "closed"
	// NOTE: 50/50 split is possible in as ranking is done - what to do in a 50/50 situation?
	//	-- this is especially possible in small number of votes
	// NOTE2: What if there are equal last place - is it okay to eliminate the first one?
	//  -- order will effect the outcome
	if proposal.TallyMethod == "ranked-choice" &&
		 len(proposal.Choices) > 2 {
		isWinner := false
		firstRank := 0
		round := 1
		lastPlace := ""
		lastPlaceScore := 0

		// put choices into a map
		tally := make(map[string]int)
		for i := 0; i < len(proposal.Choices); i += 1 {
			tally[proposal.Choices[i].Choice_text] = 0
		}

		for !isWinner {
			fmt.Printf("Round %d\n", round)
			fmt.Println("==========")
			totalVotes := 0

			// count votes for ranked choice
			for _, vote := range votes {
				fmt.Println(vote.Choices)
				if len(vote.NFTs) != 0 && len(vote.Choices) > 0 {
					totalVotes += 1
					tally[vote.Choices[firstRank]] += 1
					r.Results[vote.Choices[firstRank]] += 1
					r.Results_float[vote.Choices[firstRank]] += 1
				}
			}

			fmt.Printf("%+v\n", tally)
			fmt.Printf("%+v\n", r.Results)

			// get array of keys for choices
			choices := make([]string, len(tally))
			i := 0
			for k := range tally {
				choices[i] = k
				i++
			}

			// determine if winner
			// find last place if no winner
			lastPlace = choices[0]
			lastPlaceScore = tally[choices[0]]
			votesToWin := totalVotes / 2 + 1
			for i := 0; i < len(choices); i += 1 {
				choice := choices[i]
				numVotes := tally[choice]
				if numVotes >= votesToWin {
					isWinner = true
					break
				} 
				if numVotes < lastPlaceScore {
					lastPlace = choice
					lastPlaceScore = numVotes
				}
			}

			// if no winner, prepare for vote by next rank
			if !isWinner {
				round += 1

				//Reset score for next round of tallying
				for _, choice := range choices {
					tally[choice] = 0
					r.Results[choice] = 0
					r.Results_float[choice] = 0
				}

				// remove last place choice from tally map
				delete(tally, lastPlace)

				// Remove last place choice from votes
				for _, vote := range votes {
					i := slices.IndexFunc(vote.Choices, func(s string) bool { return s == lastPlace })
					if i >= 0 {
						vote.Choices = append(vote.Choices[:i], vote.Choices[i+1:]...)
					}
				}
			}
		}
	} else {
		for _, vote := range votes {
			if len(vote.NFTs) != 0 {
				var voteWeight float64
	
				voteWeight, err := b.GetVoteWeightForBalance(vote, proposal)
				if err != nil {
					return models.ProposalResults{}, err
				}
	
				r.Results[vote.Choices[0]] += int(voteWeight)
				r.Results_float[vote.Choices[0]] += voteWeight
			}
		}
	}

	return *r, nil
}

func (b *BalanceOfNfts) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	nftIds, err := models.GetUserNFTs(b.DB, vote)
	if err != nil {
		log.Error().Err(err).Msg("error in GetVoteWeightForBalance for BalanceOfNFTs strategy")
		return 0.00, err
	}

	if proposal.Max_weight != nil && float64(len(nftIds)) > *proposal.Max_weight {
		return *proposal.Max_weight, nil
	}

	return float64(len(nftIds)), nil
}

func (b *BalanceOfNfts) GetVotes(
	votes []*models.VoteWithBalance,
	proposal *models.Proposal,
) ([]*models.VoteWithBalance, error) {
	for _, vote := range votes {
		weight, err := b.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}

	return votes, nil
}

func (s *BalanceOfNfts) InitStrategy(
	fa *shared.FlowAdapter,
	db *shared.Database,
	dps *shared.DpsAdapter,
) {
	s.FlowAdapter = fa
	s.DB = db
	s.DPS = *dps
}
