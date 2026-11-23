create or replace view leaderboard_unique as (
    select owner, count(code) from (
        select distinct owner, code
        from _in_countrydex
    ) as uniques
    group by owner
    having count(code) >= 10
    order by count desc
);

create or replace view leaderboard_all as (
    select owner, count(code)
    from _in_countrydex
    group by owner
    having count(code) >= 10
    order by count desc
);

select owner, count(code) from countrydex._in_countrydex group by owner having count(code) >= 10;

create or replace view leaderboard_quick as (
    with ten as (
        select owner, count(code) from countrydex._in_countrydex group by owner having count(code) >= 10
    )
    select owner, avg(delta) from (
        select t.owner, getMinutes(timestamp) as delta
        from ten t left join countrydex._in_countrydex c on t.owner = c.owner
    ) as calculated
    group by owner
    order by avg asc
);

create or replace function getMinutes(ts bigint) returns int as $func$
declare
    minutes int;
begin
    minutes := extract(minute from to_timestamp(ts / 1000.0));
    
    if minutes >= 30 then
        return minutes - 30;
    else
        return minutes + 30;
    end if;
end;
$func$ language plpgsql;