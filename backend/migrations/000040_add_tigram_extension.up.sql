CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS trgm_idx on communities using gin(name gin_trgm_ops);
