CREATE TABLE nfts (
  id BIGSERIAL primary key,
  owner_addr VARCHAR(18) NOT NULL,
  contract_addr VARCHAR(18) NOT NULL,
  contract_name VARCHAR(150) NOT NULL,
  public_path VARCHAR(150),
  nft_id INT,
  nft_uuid VARCHAR(50),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
