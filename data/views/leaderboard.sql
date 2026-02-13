create or replace view leaderboard_unique as (
    select owner, count(code) from (
        select distinct owner, code
        from _in_countrydex
    ) as uniques
    group by owner
    order by count desc
);

create or replace view leaderboard_all as (
    select owner, count(code)
    from _in_countrydex
    group by owner
    order by count desc
);

create or replace view leaderboard_quick as (
    select owner, avg(delta) from (
        select owner, getMinutes(timestamp) as delta
        from _in_countrydex
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