alter table votes
    alter column choices type varchar(255) using coalesce(choice[1],'');
alter table votes    
    rename column choices TO choice;
