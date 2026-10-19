select c.code, name_fr, name_en
from countrydex._in_countrydex ic join countrydex._country c on ic.code = c.code
where owner = $1;