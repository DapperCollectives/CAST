-- -- DELETE FROM voting_strategies WHERE key='one-address-one-vote-ft';
-- -- DELETE FROM voting_strategies WHERE key='one-address-one-vote';

-- -- Remove values from enum
-- DELETE FROM pg_enum WHERE oid IN (
--     SELECT oid FROM pg_enum where enumLabel='one-address-one-vote-nft' OR enumLabel='one-address-one-vote-ft'
-- );