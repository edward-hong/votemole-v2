CREATE TABLE pollOption(
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
  option      VARCHAR(512) NOT NULL,
  votes       INTEGER DEFAULT 0 NOT NULL,
  "pollId"    uuid,
  FOREIGN KEY ("pollId") REFERENCES poll(id)
);