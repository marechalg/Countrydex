create table _spawn (
    message int primary key,
    solved boolean,
    code varchar(6),

    constraint fk_spawn_country foreign key
        (code) references _country(code)
);