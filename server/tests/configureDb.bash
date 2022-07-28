#!/bin/bash

export PGPASSWORD=$(< ./server/src/.secret)

echo "Configuring votemole_test"

dropdb -U edward votemole_test
createdb -U edward votemole_test

psql -U edward votemole_test < ./server/src/sql/account.sql
psql -U edward votemole_test < ./server/src/sql/poll.sql
psql -U edward votemole_test < ./server/src/sql/pollOption.sql
psql -U edward votemole_test < ./server/src/sql/ip.sql
psql -U edward votemole_test < ./server/src/sql/session.sql

echo "votemole_test configured"