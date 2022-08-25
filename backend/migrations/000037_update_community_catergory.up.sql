DELETE FROM community_types WHERE key='service';

BEGIN;
ALTER TYPE community_type ADD VALUE IF NOT EXISTS 'nft';
ALTER TYPE community_type RENAME VALUE 'service' TO 'collector';
END TRANSACTION;
COMMIT;

INSERT INTO community_types (key, name, description) VALUES ('nft', 'NFT', 'NFT Community');
INSERT INTO community_types (key, name, description) VALUES ('collector', 'Collector', 'Collector Community');