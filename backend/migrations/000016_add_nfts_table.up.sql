CREATE TABLE nfts (
  id BIGSERIAL primary key,
  owner_addr VARCHAR(18) NOT NULL,
  nft_id VARCHAR(50),
  proposal_id BIGINT NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TYPE strategies ADD VALUE IF NOT EXISTS 'balance-of-nfts';
COMMIT;

INSERT INTO voting_strategies (key, name, description)
VALUES ('balance-of-nfts',  'Balance of NFTs', 'calculates vote based on balance of nft ids');
