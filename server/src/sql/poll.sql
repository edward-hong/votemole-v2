CREATE TABLE poll(
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
  "pollQuestion"    VARCHAR(512) NOT NULL,
  "accountId"       uuid,
  FOREIGN KEY ("accountId") REFERENCES account(id)
);