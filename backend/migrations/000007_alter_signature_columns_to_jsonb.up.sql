-- Add composite_signature jsonb columns
ALTER TABLE votes ADD COLUMN composite_signatures jsonb;
ALTER TABLE proposals ADD COLUMN composite_signatures jsonb;
ALTER TABLE communities ADD COLUMN composite_signatures jsonb;

-- Populate composite_signature jsonb columns
UPDATE votes SET composite_signatures = to_jsonb(CONCAT(
    '[{ "addr":"',addr,'", "keyId":',1,', "signature":"',sig,'", "f_type":"CompositeSignature", "f_vsn":"1.0.0" }]'
)::json)
WHERE sig is not null;

-- Remove sig columns
ALTER TABLE votes DROP COLUMN sig;