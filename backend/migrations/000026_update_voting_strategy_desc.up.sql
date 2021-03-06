UPDATE voting_strategies
  SET description = 'A weight will be added for each NFT in a user address that matches the contract of the proposal'
  WHERE key = 'balance-of-nfts';
UPDATE voting_strategies
  SET description = 'One address is simply only allowed one vote, assets do not come into play.'
  WHERE key = 'one-address-one-vote';