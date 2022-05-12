CREATE TYPE list_types AS enum ('allow', 'block');

CREATE TABLE lists (
    id BIGSERIAL primary key,
    community_id INT not null references communities(id),
    addresses varchar array,
    list_type list_types,
    cid VARCHAR(64),
    created_at TIMESTAMP without time zone default (now() at time zone 'utc')
);
