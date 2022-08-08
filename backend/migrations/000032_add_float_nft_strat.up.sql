BEGIN;
ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'float-nfts';
END TRANSACTION;
COMMIT;

INSERT INTO voting_strategies (key, name, description)
VALUES ('float-nfts', 'Float NFTs', 'Vote weight is calculated via proof attendance using the Float Event ID');
