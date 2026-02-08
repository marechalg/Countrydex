select *
from _in_countrydex ic join _country c on ic.code = c.code
where ic.owner = $1 and c.code = $2
order by timestamp asc
limit 1;