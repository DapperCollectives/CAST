ALTER TABLE proposals ADD COLUMN choices_arr VARCHAR array;
-- UPDATE proposals SET choices = ARRAY[choices_json[1]["choiceText"], choices_json[2]["choiceText"]]
ALTER TABLE proposals DROP COLUMN choices;
ALTER TABLE proposals RENAME COLUMN choices_arr TO choices;