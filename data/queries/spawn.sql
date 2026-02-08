select channel, message, c.code, c.name, solved
from countrydex._spawn s join countrydex._country c on s.code = c.code
where channel = $1;