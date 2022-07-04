#!/bin/bash

export PGPASSWORD=$(< ./server/src/.secret)

echo "Configuring votemole"

dropdb -U edward votemole
createdb -U edward votemole

psql -U edward votemole < ./server/src/sql/account.sql
psql -U edward votemole < ./server/src/sql/poll.sql
psql -U edward votemole < ./server/src/sql/pollOption.sql
psql -U edward votemole < ./server/src/sql/ip.sql

echo "votemole configured"