CREATE TABLE nfts (
  uuid UUID primary key,
  owner_addr VARCHAR(18) NOT NULL,
  id BIGINT NOT NULL,
  proposal_id BIGINT NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
