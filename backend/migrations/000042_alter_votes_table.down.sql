alter table votes
    alter column choices type varchar(256) using coalesce(choices[1],'');
alter table votes    
    rename column choices TO choice;
alter table proposals
    drop column if exists tally_method;
