CREATE TABLE users (
  uuid UUID PRIMARY KEY NOT NULL,
  addr VARCHAR(255) NOT NULL,
  created_at TIMESTAMP without time zone default (now() at time zone 'utc'),
  profile_image TEXT,
  name VARCHAR(50),
  website VARCHAR(50),
  bio VARCHAR(255),
  twitter VARCHAR(50),
  discord VARCHAR(50),
  instagram VARCHAR(50)
);
