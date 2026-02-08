select c.code, name
from countrydex._in_countrydex ic join countrydex._country c on ic.code = c.code
where owner = $1;