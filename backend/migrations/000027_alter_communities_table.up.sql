ALTER TABLE communities ADD COLUMN is_featured BOOLEAN;

UPDATE communities SET is_featured = 'true' WHERE id = 1;
