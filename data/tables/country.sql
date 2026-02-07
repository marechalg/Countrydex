-- Active: 1762247470917@@localhost@5432@countrydex
create table _country (
    code varchar(6) primary key,
    name varchar (128),
    description varchar(1024)
);