package server

func (a *App) initializeRoutes() {
	// Health
	a.Router.HandleFunc("/", a.health).Methods("GET")
	a.Router.HandleFunc("/api", a.health).Methods("GET")
	// File upload
	a.Router.HandleFunc("/upload", a.upload).Methods("POST", "OPTIONS")
	// Communities
	a.Router.HandleFunc("/communities", a.getCommunities).Methods("GET")
	a.Router.HandleFunc("/communities-for-homepage", a.getCommunitiesForHomePage).Methods("GET")
	a.Router.HandleFunc("/communities/{id:[0-9]+}", a.getCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{id:[0-9]+}", a.updateCommunity).Methods("PATCH", "OPTIONS")
	a.Router.HandleFunc("/communities", a.createCommunity).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/strategies", a.getActiveStrategiesForCommunity).Methods("GET")
	//Community Search
	a.Router.HandleFunc("/communities/search", a.searchCommunities).Methods("GET")
	// Proposals
	a.Router.HandleFunc("/proposals/{id:[0-9]+}", a.getProposal).Methods("GET")
	a.Router.HandleFunc("/proposals/{id:[0-9]+}", a.updateProposal).Methods("PUT", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals", a.getProposalsForCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals/{id:[0-9]+}", a.getProposal).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals", a.createProposal).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/proposals/{id:[0-9]+}", a.updateProposal).
		Methods("PUT", "OPTIONS")
	// Lists
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/lists", a.getListsForCommunity).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/lists", a.createListForCommunity).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/lists/{id:[0-9]+}", a.getList).Methods("GET")
	a.Router.HandleFunc("/lists/{id:[0-9]+}/add", a.addAddressesToList).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/lists/{id:[0-9]+}/remove", a.removeAddressesFromList).Methods("POST", "OPTIONS")
	// Votes
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes", a.getVotesForProposal).Methods("GET")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes/{addr:0x[a-zA-Z0-9]+}", a.getVoteForAddress).Methods("GET")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes", a.createVoteForProposal).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/votes/{addr:0x[a-zA-Z0-9]+}", a.getVotesForAddress).Methods("GET")
	//Strategies
	// a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/votes/{addr:0x[a-zA-Z0-9]{16}}", a.updateVoteForProposal).Methods("PUT", "OPTIONS")
	a.Router.HandleFunc("/proposals/{proposalId:[0-9]+}/results", a.getResultsForProposal)
	// Types
	a.Router.HandleFunc("/voting-strategies", a.getVotingStrategies).Methods("GET")
	a.Router.HandleFunc("/community-categories", a.getCommunityCategories).Methods("GET")
	// Users
	a.Router.HandleFunc("/users/{addr:0x[a-zA-Z0-9]{16}}/communities", a.getUserCommunities).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/users", a.createCommunityUser).Methods("POST", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/users", a.getCommunityUsers).Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/users/type/{userType:[a-zA-Z]+}", a.getCommunityUsersByType).
		Methods("GET")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/users/{addr:0x[a-zA-Z0-9]{16}}/{userType:[a-zA-Z]+}", a.removeUserRole).
		Methods("DELETE", "OPTIONS")
	a.Router.HandleFunc("/communities/{communityId:[0-9]+}/leaderboard", a.getCommunityLeaderboard).Methods("GET")
	// Utilities
	a.Router.HandleFunc("/accounts/admin", a.getAdminList).Methods("GET")
	a.Router.HandleFunc("/accounts/blocklist", a.getCommunityBlocklist).Methods("GET")
	a.Router.HandleFunc("/accounts/{addr:0x[a-zA-Z0-9]{16}}/{blockHeight:[0-9]+}", a.getAccountAtBlockHeight).Methods("GET")

}
