select owner, count(timestamp)
from countrydex._in_countrydex
where code = $1
group by owner
order by count desc, min(timestamp) asc;