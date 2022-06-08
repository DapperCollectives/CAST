CREATE TABLE nfts (
  id BIGSERIAL primary key,
  owner_addr VARCHAR(18) NOT NULL,
  nft_id VARCHAR(50),
  proposal_id BIGINT NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
