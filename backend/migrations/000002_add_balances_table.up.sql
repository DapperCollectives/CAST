CREATE TABLE balances (
    id BIGSERIAL primary key,
    proposal_id INT not null,
    addr VARCHAR(18),
    primary_account_balance BIGINT,
    secondary_address VARCHAR(18),
    secondary_account_balance BIGINT,
    staking_balance BIGINT,
    script_result VARCHAR(32),
    stakes VARCHAR array,
    block_height BIGINT,
    created_at TIMESTAMP without time zone default (now() at time zone 'utc')
);