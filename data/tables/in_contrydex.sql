create table _in_countrydex (
    owner int,
    code varchar(6),
    timestamp timestamp,

    constraint fk_countrydex_country foreign key
        (code) references _country(code),

    primary key(owner, code)
);