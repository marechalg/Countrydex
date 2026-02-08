create table _spawn (
    channel bigint,
    message bigint,
    solved boolean,
    code varchar(6),

    constraint fk_spawn_country foreign key
        (code) references _country(code),
    
    primary key(channel)
);