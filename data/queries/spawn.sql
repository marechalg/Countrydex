select channel, message, c.code, c.name, solved
from _spawn s join _country c on s.code = c.code
where channel = $1;