select *
from countrydex._in_countrydex ic join countrydex._country c on ic.code = c.code
where ic.owner = $1 and c.code = $2
order by timestamp desc
limit 1;