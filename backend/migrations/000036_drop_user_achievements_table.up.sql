ALTER TABLE votes ADD COLUMN is_early BOOLEAN DEFAULT 'false';
ALTER TABLE votes ADD COLUMN is_winning BOOLEAN DEFAULT 'false';

DROP TABLE IF EXISTS user_achievements;
DROP TYPE IF EXISTS achievement_types;
DROP EXTENSION IF EXISTS tablefunc;

ALTER TABLE proposals ADD COLUMN achievements_done BOOLEAN DEFAULT 'false';