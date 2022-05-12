ALTER TABLE communities DROP COLUMN category;
ALTER TABLE communities DROP COLUMN terms_and_conditions_url;
DROP TABLE IF EXISTS community_types;
DROP TYPE IF EXISTS community_type;