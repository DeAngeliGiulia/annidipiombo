Dump del DB:
docker exec annipiombo-mysql-1 mysqldump -u root -proot piombobase > dump.sql

import del dump
docker exec -i annipiombo-mysql-1 mysql -u root -proot piombobase < dump.sql
