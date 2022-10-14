-- Update proposal.choices column by setting the id of each array element to its index

-- 0
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 0;
-- 1
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB) 
	from item
	where p.id = item.proposal_id and item.i = 1;
-- 2
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 2;
-- 3
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 3;
-- 4
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 4;
-- 5
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 5;
-- 6
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 6;
-- 7
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 7;
-- 8
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 8;
-- 9
	WITH item as (
		SELECT ('{' || index - 1 || ',"id"}')::TEXT[] AS path,
	    	index - 1 as i,
	    	id as proposal_id
	    FROM proposals p,
	         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
	    ORDER BY proposal_id
	)
	update proposals p
	set choices = jsonb_set(choices, item.path, to_json(item.i)::JSONB)
	from item
	where p.id = item.proposal_id and item.i = 9;


-------------------------
-- Update vote choices --
-------------------------

WITH item as (
	SELECT
    	id as proposal_id,
    	(item::JSON->>'choiceText')::TEXT as choicetext,
    	(item->>'id') as choiceid
    FROM proposals p,
         jsonb_array_elements(p.choices) WITH ORDINALITY arr(item, index)
    ORDER BY proposal_id
)
update votes v
set choices = ARRAY[item.choiceid::BIGINT]
from item
where v.proposal_id = item.proposal_id and choices[1]::TEXT = item.choicetext