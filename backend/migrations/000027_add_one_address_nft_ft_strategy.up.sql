BEGIN;
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'one-address-one-vote-nft';
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'one-address-one-vote-ft';
END TRANSACTION;
COMMIT;

INSERT INTO voting_strategies (key, name, description)
VALUES ('one-address-one-vote-nft', 'One Address One Vote (NFT)', 'One address is simply only allowed one vote, if they own the specified NFT.');
INSERT INTO voting_strategies (key, name, description)
VALUES ('one-address-one-vote-ft', 'One Address One Vote (FT)', 'One address is simply only allowed one vote, if they own the specified FT.');
