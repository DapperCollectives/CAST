ALTER TYPE strategies ADD VALUE 'one-address-one-vote';
INSERT INTO voting_strategies (key, name, description)
VALUES ('one-address-one-vote', 'One Address One Vote', 'one address is simply only allowed one vote, assets do not come into play.');

