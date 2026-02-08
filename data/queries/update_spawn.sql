update _spawn
set message = $2, code = $3, solved = false
where channel = $1;