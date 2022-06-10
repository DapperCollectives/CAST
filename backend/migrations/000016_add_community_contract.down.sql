ALTER TABLE communities DROP COLUMN IF EXISTS contract_name;
ALTER TABLE communities DROP COLUMN IF EXISTS contract_addr;
ALTER TABLE communities DROP COLUMN IF EXISTS public_path;
ALTER TABLE communities DROP COLUMN IF EXISTS threshold;
ALTER TABLE communities DROP COLUMN IF EXISTS only_authors_to_submit;
