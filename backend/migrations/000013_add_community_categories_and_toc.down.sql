ALTER TABLE communities DROP COLUMN IF EXISTS category;
ALTER TABLE communities DROP COLUMN IF EXISTS terms_and_conditions_url;
ALTER TABLE communities DROP COLUMN IF EXISTS only_authors_to_submit;
DROP TABLE IF EXISTS community_types;
DROP TYPE IF EXISTS community_type;
