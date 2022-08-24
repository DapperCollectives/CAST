DELETE FROM community_types WHERE key='nft';
DELETE FROM community_types WHERE key='collector';

BEGIN;
ALTER TYPE community_type RENAME VALUE 'collector' TO 'service';
END TRANSACTION;
COMMIT;

INSERT INTO community_types (key, name, description) VALUES ('service', 'Service', 'Service Community');