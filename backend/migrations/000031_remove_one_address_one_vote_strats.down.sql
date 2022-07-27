-- no going back!
BEGIN;
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'one-address-one-vote-nft';
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'one-address-one-vote-ft';
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'one-address-one-voteft';
END TRANSACTION;
COMMIT;

INSERT INTO voting_strategies (key, name, description)
VALUES ('one-address-one-vote-nft', 'One Address One Vote (NFT)', 'A wallet address vote counts as one vote as long as it has at least one NFT that matches the contract of the proposal.');
INSERT INTO voting_strategies (key, name, description)
VALUES ('one-address-one-vote-ft', 'One Address One Vote (FT)', 'A wallet address vote counts as one vote as long as it has at least one fungible token that matches the contract of the proposal.');
INSERT INTO voting_strategies (key, name, description)
VALUES ('one-address-one-vote', 'One Address One Vote', 'A wallet address vote counts as one vote as long as it has at least one fungible token that matches the contract of the proposal.');