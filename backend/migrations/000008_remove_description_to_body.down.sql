ALTER TABLE communities ADD COLUMN description TEXT;

UPDATE communities SET description=body;

ALTER TABLE proposals ADD COLUMN description TEXT;