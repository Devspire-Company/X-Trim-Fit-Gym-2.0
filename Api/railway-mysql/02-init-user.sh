#!/bin/bash
set -e
: "${MYSQL_IVMS_PASSWORD:?MYSQL_IVMS_PASSWORD is required}"
: "${MYSQL_API_PASSWORD:?MYSQL_API_PASSWORD is required}"

# MySQL 5.5 has no CREATE USER IF NOT EXISTS; init runs only on first start.
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "
CREATE USER 'ivms'@'%' IDENTIFIED BY '${MYSQL_IVMS_PASSWORD}';
GRANT SELECT, INSERT, UPDATE ON railway.attendance TO 'ivms'@'%';
CREATE USER 'xtrim_api'@'%' IDENTIFIED BY '${MYSQL_API_PASSWORD}';
GRANT SELECT ON railway.attendance TO 'xtrim_api'@'%';
FLUSH PRIVILEGES;
"
