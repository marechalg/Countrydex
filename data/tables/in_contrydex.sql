create table _in_countrydex (
    owner bigint,
    code varchar(6),
    timestamp bigint,

    constraint fk_countrydex_country foreign key
        (code) references _country(code),

    primary key(owner, code, timestamp)
);