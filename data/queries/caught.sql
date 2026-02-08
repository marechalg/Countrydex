select *
from countrydex._country c join _in_countrydex ic on c.code = ic.code
where ic.owner = $1 and c.code = $2;