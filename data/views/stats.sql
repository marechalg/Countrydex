create or replace view users as (
    select count(distinct owner) from countrydex._in_countrydex
);

create or replace view total_catchs as (
    select count(*) from countrydex._in_countrydex
);

create or replace view most_catched as (
    select code, count(*) as cnt from countrydex._in_countrydex group by code order by cnt desc limit 1
);

create or replace view average_completion as (
    with ratios as (
        with countries as (
            select count(*) as amount from countrydex._country
        )
        select count(distinct i.code)::numeric / c.amount as ratio
        from countrydex._in_countrydex i
        cross join countries c
        group by i.owner, c.amount
    ) select avg(ratio) from ratios
);

create or replace view stats as (
    with u as (
        select count from countrydex.users
    ),
    tc as (
        select * from countrydex.total_catchs
    ),
    mc as (
        select c.name_en, mc.cnt from countrydex.most_catched mc left join countrydex._country c on mc.code = c.code
    ),
    ac as (
        select avg from countrydex.average_completion
    )
    select
        u.count as users,
        tc.count as total_catchs,
        mc.name_en as most_catched_flag,
        mc.cnt as most_catched_number,
        ac.avg as average_completion
    from u cross join tc cross join mc cross join ac
);