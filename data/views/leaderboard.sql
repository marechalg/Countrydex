create or replace view leaderboard_unique as (
    select owner, count(code) from (
        select distinct owner, code
        from _in_countrydex
    ) as uniques
    group by owner
    order by count asc
);