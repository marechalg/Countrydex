select c.code, c.name_en, c.name_fr
from countrydex._in_countrydex ic 
join countrydex._country c on ic.code = c.code
where owner = $1
group by c.code, c.name_en, c.name_fr;