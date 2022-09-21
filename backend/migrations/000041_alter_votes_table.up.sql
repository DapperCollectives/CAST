alter table votes
    alter column choice type varchar(255)[] using array[choice];
alter table votes
    rename column choice TO choices;