CREATE TABLE ip(
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
  ip          VARCHAR(64),
  "pollId"    uuid,
  FOREIGN KEY ("pollId") REFERENCES poll(id) ON DELETE CASCADE
);