ALTER TABLE user_achievements RENAME TO community_users_achievements IF EXISTS;
ALTER TABLE community_users_achievements DROP COLUMN details IF EXISTS;

