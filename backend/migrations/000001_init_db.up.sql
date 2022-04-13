CREATE TABLE communities (
  id BIGSERIAL primary key,
  name VARCHAR(256) not null,
  description TEXT,
  body TEXT,
  logo VARCHAR(256),
  slug VARCHAR(64),
  strategies VARCHAR array,
  strategy VARCHAR(64),
  proposal_validation VARCHAR(64),
  proposal_threshold VARCHAR(64),
  creator_addr VARCHAR(18) not null,
  cid VARCHAR(64),
  created_at TIMESTAMP without time zone default (now() at time zone 'utc')
);

INSERT INTO communities (name, description, creator_addr) VALUES ('Flow', 'Vote on Flow Validators', '0xf8d6e0586b0a20c7');

-- PROPOSALS

CREATE TYPE statuses AS enum ('published', 'pending', 'draft', 'scheduled', 'closed');

CREATE TABLE proposals (
  id BIGSERIAL primary key,
  name VARCHAR(256) not null,
  description TEXT,
  body TEXT,
  choices varchar array,
  community_id INT not null references communities(id),
  creator_addr VARCHAR(18) not null,
  strategy VARCHAR(64) not null,
  max_weight BIGINT,
  min_balance BIGINT,
  status statuses,
  start_time TIMESTAMP not null, 
  end_time TIMESTAMP not null, 
  block_height INT DEFAULT 0,
  result VARCHAR(256),
  cid VARCHAR(64),
  created_at TIMESTAMP without time zone default (now() at time zone 'utc')
);

INSERT INTO proposals (name, description, choices, community_id, status, strategy, creator_addr, start_time, end_time) VALUES 
('test proposal', 'test description', array['a', 'b', 'c'], 1, 'published', 'token-weighted-default', '0xf8d6e0586b0a20c7', now(), (now() + INTERVAL '1 day')),
('test proposal', 'test description', array['a', 'b', 'c'], 1, 'published', 'token-weighted-default', '0xf8d6e0586b0a20c7', (now() + INTERVAL '7 days'), (now() + INTERVAL '30 days')),
('test proposal', 'test description', array['a', 'b', 'c'], 1, 'published', 'token-weighted-default', '0xf8d6e0586b0a20c7', (now() - INTERVAL '30 days'), (now() - INTERVAL '1 day')),
('test proposal', 'test description', array['a', 'b', 'c'], 1, 'closed', 'token-weighted-default', '0xf8d6e0586b0a20c7', now(), (now() + INTERVAL '1 day'));

CREATE TABLE votes (
  id BIGSERIAL primary key,
  proposal_id INT not null references proposals(id),
  addr VARCHAR(18) not null,
  choice VARCHAR(256) not null,
  balance BIGINT,
  sig VARCHAR(256) not null,
  message VARCHAR(512) not null,
  cid VARCHAR(64),
  created_at TIMESTAMP without time zone default (now() at time zone 'utc')
);

-- Strategies
CREATE TYPE strategies AS enum ('token-weighted-default', 'token-weighted-capped');

CREATE TABLE voting_strategies (
  key strategies primary key,
  name VARCHAR(128) not null,
  description TEXT
);

INSERT INTO voting_strategies (key, name, description)
VALUES ('token-weighted-default', 'Token Weighted', 'Number of tokens held directly corresponds to the weight of the vote');
INSERT INTO voting_strategies (key, name, description)
VALUES ('token-weighted-capped', 'Token Weighted - Capped', 'Number of tokens held directly corresponds to the weight of the vote, up to the specified cap.');

-- Proposal Results
CREATE TABLE proposal_results (
  proposal_id INT not null references proposals(id),
  results JSON,
  cid VARCHAR(64),
  updated_at TIMESTAMP without time zone default (now() at time zone 'utc')
);

-- CREATE TABLE users (
--   id BIGSERIAL primary key,
--   address VARCHAR(16) not null
-- );

-- CREATE TYPE role_types AS enum ('user', 'admin', 'superadmin');

-- CREATE TABLE user_roles (
--   id BIGSERIAL primary key,
--   community_id VARCHAR(32),
--   user_id VARCHAR(32),
--   role role_types
-- );
