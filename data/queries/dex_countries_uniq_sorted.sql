select c.code, name
from _in_countrydex ic join _country c on ic.code = c.code
where owner = $1
group by c.code, name
order by name asc;