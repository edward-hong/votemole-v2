CREATE EXTENSION pgcrypto;

CREATE TABLE account(
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
  "profileId"   VARCHAR(64) NOT NULL
);