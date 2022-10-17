package models

import (
	"fmt"

	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

const DEFAULT_SEARCH_SQL = `
	SELECT id, name, body, logo, category
		FROM communities
    WHERE is_featured = 'true'
		AND category IS NOT NULL
`
const SEARCH_COMMUNITIES_SQL = `
	SELECT id, name, body, logo, category, SIMILARITY(name, $1) as score	
	FROM communities 
	WHERE SIMILARITY(name, $1) > 0.1
		AND category IS NOT NULL
`
const COUNT_CATEGORIES_DEFAULT_SQL = `
	SELECT category, COUNT(*) as category_count
	FROM communities 
	WHERE is_featured = 'true'
		AND category IS NOT NULL
	GROUP BY category
`
const COUNT_CATEGORIES_SEARCH_SQL = `
	SELECT category, COUNT(*) as category_count
	FROM communities 
	WHERE SIMILARITY(name, $1) > 0.1
		AND category IS NOT NULL
	GROUP BY category
`
const COUNT_TOTAL_RECORDS_DEFAULT_SQL = `
	SELECT COUNT(*) 
	FROM communities 
	WHERE is_featured = 'true' 
	AND category IS NOT NULL
`
const COUNT_TOTAL_RECORDS_SEARCH_SQL = `
	SELECT COUNT(*) FROM communities 
	WHERE SIMILARITY(name, $1) > 0.1
`

func SearchForCommunity(
	db *s.Database,
	query string,
	filters []string,
	params shared.PageParams,
) (
	[]*Community,
	int,
	error,
) {

	sql, err := addFiltersToSql(SEARCH_COMMUNITIES_SQL, query, filters)
	if err != nil {
		return nil, 0, err
	}

	sql = sql + " ORDER BY score DESC LIMIT $2 OFFSET $3"

	rows, err := db.Conn.Query(
		db.Context,
		sql,
		query,
		params.Count,
		params.Start,
	)
	if err != nil {
		return []*Community{}, 0, fmt.Errorf("error searching for a community with the the query %s", query)
	}

	defer rows.Close()

	communities, err := scanSearchResults(rows, false)
	if err != nil {
		return []*Community{}, 0, fmt.Errorf("error scanning search results for the query %s", query)
	}

	totalRecords, err := getSearchTotalRecords(db, COUNT_TOTAL_RECORDS_SEARCH_SQL, query, filters)
	if err != nil {
		return []*Community{}, 0, fmt.Errorf("error getting total records for the query %s", query)
	}

	return communities, totalRecords, nil
}

func GetSearchDefaultCommunities(
	db *s.Database,
	params shared.PageParams,
	filters []string,
) (
	[]*Community,
	int,
	error,
) {
	var sql string
	sql, err := addFiltersToSql(DEFAULT_SEARCH_SQL, "", filters)
	if err != nil {
		return nil, 0, err
	}

	sql = sql + " LIMIT $1 OFFSET $2"

	rows, err := db.Conn.Query(
		db.Context,
		sql,
		params.Count,
		params.Start,
	)
	if err != nil {
		return nil, 0, err
	}

	defer rows.Close()

	communities, err := scanSearchResults(rows, true)
	if err != nil {
		return nil, 0, err
	}

	totalRecords, err := getSearchTotalRecords(db, COUNT_TOTAL_RECORDS_DEFAULT_SQL, "", filters)
	if err != nil {
		return nil, 0, err
	}
	return communities, totalRecords, nil
}
func getSearchTotalRecords(
	db *s.Database,
	filterCountSql,
	searchQuery string,
	filters []string,
) (int, error) {
	if filters[0] != "" {
		countSql, err := generateSearchFilterCountSql(filters)
		if err != nil {
			return 0, err
		}
		var totalRecords int
		db.Conn.QueryRow(db.Context, countSql, searchQuery).Scan(&totalRecords)

		return totalRecords, nil
	} else {

		var totalRecords int
		db.Conn.QueryRow(db.Context, filterCountSql, searchQuery).Scan(&totalRecords)

		return totalRecords, nil
	}
}

func scanSearchResults(rows pgx.Rows, isDefault bool) ([]*Community, error) {
	var communities []*Community

	var err error
	for rows.Next() {
		var c Community
		if isDefault {
			err = rows.Scan(&c.ID, &c.Name, &c.Body, &c.Logo, &c.Category)
		} else {
			// score is required for scanning, but can be ignored. Only used
			// to order the search results by SQL.
			var score float32
			err = rows.Scan(&c.ID, &c.Name, &c.Body, &c.Logo, &c.Category, &score)
		}
		if err != nil {
			log.Error().Err(err)
			return communities, fmt.Errorf("error scanning community row: %v", err)
		}
		communities = append(communities, &c)
	}

	return communities, nil
}

/// Generate SQL Functions////
func generateSearchFilterCountSql(filters []string) (string, error) {
	if len(filters) > 0 {
		var sql string = `
				SELECT COUNT(*) FROM communities
        WHERE SIMILARITY(name, $1) > 0.1
        AND category IS NOT NULL
				AND category IN (`
		for i, filter := range filters {
			if i == len(filters)-1 {
				sql += fmt.Sprintf("'%s')", filter)
			} else {
				sql += fmt.Sprintf("'%s',", filter)
			}
		}

		return sql, nil
	} else {
		return "", fmt.Errorf("No filters provided")
	}
}

func generateDefaultFilterCountSql(filters []string) (string, error) {
	if len(filters) > 0 {
		var sql string = `
				SELECT COUNT(*) FROM communities
        WHERE category IS NOT NULL
				AND is_featured = true
				AND category IN (`
		for i, filter := range filters {
			if i == len(filters)-1 {
				sql += fmt.Sprintf("'%s')", filter)
			} else {
				sql += fmt.Sprintf("'%s',", filter)
			}
		}

		return sql, nil
	} else {
		return "", fmt.Errorf("No filters provided")
	}
}
func GetCategoryCount(db *s.Database, search string) (map[string]int, error) {
	var rows pgx.Rows
	var err error

	if search == "" {
		rows, err = db.Conn.Query(
			db.Context,
			COUNT_CATEGORIES_DEFAULT_SQL,
		)
	} else {
		rows, err = db.Conn.Query(
			db.Context,
			COUNT_CATEGORIES_SEARCH_SQL,
			search,
		)
	}

	// If we get pgx.ErrNoRows, just return an empty array
	// and obfuscate error
	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return make(map[string]int), nil
	}

	defer rows.Close()

	categoryCount := make(map[string]int)
	for rows.Next() {
		results := struct {
			Category string
			Count    int
		}{}
		err := rows.Scan(&results.Category, &results.Count)
		if err != nil {
			return make(map[string]int), fmt.Errorf("error scanning community row: %v", err)
		}
		categoryCount[results.Category] = results.Count
	}

	return categoryCount, nil
}

func addFiltersToSql(query, search string, filters []string) (string, error) {
	var sql string
	if filters[0] != "" {
		sql = query + " AND ("
		for i, filter := range filters {
			if i == 0 {
				sql += fmt.Sprintf("category = '%s'", filter)
			} else {
				sql += fmt.Sprintf(" OR category = '%s'", filter)
			}
		}
		sql += ")"
	} else {
		sql = query
	}

	return sql, nil
}
