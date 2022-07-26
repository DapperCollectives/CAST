UPDATE voting_strategies SET name = 'Balance of NFTs', description = 'A weight will be added for each NFT in a user address that matches the contract of the proposal' WHERE key = 'balance-of-nfts';
UPDATE voting_strategies SET name = 'Staked Token Weighted', description = 'Vote weight is proportional to the number tokens staked.' WHERE key = 'staked-token-weighted-default';
UPDATE voting_strategies SET name = 'Token Weighted', description = 'Number of tokens held directly corresponds to the weight of the vote' WHERE key = 'token-weighted-default';
UPDATE voting_strategies SET name = 'One Address One Vote', description = 'One address is simply only allowed one vote, assets do not come into play.' WHERE key = 'one-address-one-vote';
