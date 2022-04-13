ALTER TYPE statuses ADD VALUE 'cancelled';
COMMIT;

UPDATE proposals
SET status = 'cancelled' WHERE status = 'closed';