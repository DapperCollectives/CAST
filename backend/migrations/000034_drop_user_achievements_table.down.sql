ALTER TABLE votes DROP COLUMN is_early;
ALTER TABLE votes DROP COLUMN is_winning;

CREATE TYPE achievement_types AS enum ('earlyVote', 'streak', 'winningVote');

CREATE EXTENSION IF NOT EXISTS tablefunc;

CREATE TABLE user_achievements (
  id BIGSERIAL primary key,
  addr VARCHAR(18) NOT NULL,
  achievement_type achievement_types,
  community_id INT not null references communities(id),
  proposals BIGINT array,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  details VARCHAR NOT NULL
);

ALTER TABLE user_achievements ADD UNIQUE (details);

