CREATE TYPE achievement_types AS enum ('earlyVote', 'streak', 'winningVote');

CREATE EXTENSION IF NOT EXISTS tablefunc;

CREATE TABLE community_users_achievements (
  id BIGSERIAL primary key,
  addr VARCHAR(18) NOT NULL,
  achievement_type achievement_types,
  community_id INT not null references communities(id),
  proposals BIGINT array,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
