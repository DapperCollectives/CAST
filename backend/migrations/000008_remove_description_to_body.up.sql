ALTER TABLE proposals DROP COLUMN description;

UPDATE communities SET body=description;

ALTER TABLE communities DROP COLUMN description;