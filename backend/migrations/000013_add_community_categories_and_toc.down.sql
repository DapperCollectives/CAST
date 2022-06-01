ALTER TABLE communities DROP COLUMN category;
ALTER TABLE communities DROP COLUMN terms_and_conditions_url;
ALTER TABLE communities DROP COLUMN only_authors_to_submit;
DROP TABLE IF EXISTS community_types;
DROP TYPE IF EXISTS community_type;
