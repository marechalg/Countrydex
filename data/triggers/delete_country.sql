create or replace trigger tg_delete_country
    before delete on _country
    for each row execute procedure delete_country();

create or replace function delete_country() returns trigger as $$
begin
    delete from _in_countrydex where code = old.code;
    delete from _spawn where code = old.code;
end;
$$ language plpgsql;