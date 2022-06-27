ALTER TABLE communities DROP COLUMN strategies;
ALTER TABLE communities ADD COLUMN strategies VARCHAR array;
