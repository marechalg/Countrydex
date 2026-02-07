-- Active: 1762247470917@@localhost@5432@countrydex@public
select *
from _in_countrydex ic join _country c on ic.code = c.code
where owner = $1;