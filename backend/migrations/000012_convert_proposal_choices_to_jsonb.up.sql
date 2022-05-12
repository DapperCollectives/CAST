ALTER TABLE proposals ADD COLUMN choices_json jsonb;
UPDATE proposals SET choices_json = to_jsonb(CONCAT(
    '[{"choiceText":"', choices[1], '", "choiceImgUrl":null }, {"choiceText":"', choices[2], '", "choiceImgUrl":null}]'
)::json);
ALTER TABLE proposals DROP COLUMN choices;
ALTER TABLE proposals RENAME COLUMN choices_json TO choices;