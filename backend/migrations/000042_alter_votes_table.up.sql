alter table votes
    alter column choice type varchar(1024)[] using array[choice];
alter table votes
    rename column choice TO choices;
alter table proposals
    add column tally_method varchar(64) default 'single-choice';