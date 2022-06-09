ALTER TABLE communities ADD COLUMN contract_name VARCHAR(150);
ALTER TABLE communities ADD COLUMN contract_addr VARCHAR(150);
ALTER TABLE communities ADD COLUMN public_path VARCHAR(150);
ALTER TABLE communities ADD COLUMN threshold NUMERIC(18,0);
ALTER TABLE communities ADD COLUMN only_authors_to_submit BOOLEAN DEFAULT TRUE;
