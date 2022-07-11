BEGIN;
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'balance-of-nfts';
END TRANSACTION;
COMMIT;

INSERT INTO voting_strategies (key, name, description)
VALUES ('balance-of-nfts', 'Balance of NFTs', 'a weight will be added for each NFT in a user address that matches the contract of the proposal');
