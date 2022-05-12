CREATE TYPE user_types AS enum ('admin', 'author', 'member');

CREATE TABLE community_users (
    community_id INT not null references communities(id),
    addr VARCHAR(18) not null,
    user_type user_types
);

/* add emulator service account as admin */

INSERT INTO community_users (community_id, addr, user_type) VALUES (1, '0xf8d6e0586b0a20c7', 'admin');
INSERT INTO community_users (community_id, addr, user_type) VALUES (1, '0xf8d6e0586b0a20c7', 'author');
INSERT INTO community_users (community_id, addr, user_type) VALUES (1, '0xf8d6e0586b0a20c7', 'member');