ALTER TABLE community_users_achievements ADD details VARCHAR NOT NULL;
ALTER TABLE community_users_achievements ADD UNIQUE (details);
ALTER TABLE community_users_achievements RENAME TO user_achievements;