pub contract CommunityVoting {
    pub let ADMIN_STORAGE_PATH: StoragePath
    pub let PUBLIC_CAPABILITY_PATH: PublicPath

    pub resource interface PublicResults {
        pub fun getResults(): {UInt64: [String]}
    }

    pub resource Admin: PublicResults{
        access(self) var results: {UInt64: [String]}

        init() {
            self.results = {}
        }

        pub fun getResults(): {UInt64: [String]} {
            return self.results
        }

        pub fun addResultsBulk(results: {UInt64: [String]}) {
            for key in results.keys {
                let value = results[key]!
                self.addResult(proposalId: key, results: value)
            }
        }

        pub fun addResult(proposalId: UInt64, results: [String]) {
            self.results[proposalId] = results
        }

        pub fun setResults(results: {UInt64: [String]}) {
            self.results = results
        }
    }

    init() {
        self.ADMIN_STORAGE_PATH = /storage/DAPPER_COLLECTIVE_VOTING_TOOL_MVP_Admin
        self.PUBLIC_CAPABILITY_PATH = /public/DAPPER_COLLECTIVE_VOTING_TOOL_MVP_Admin

        self.account.save<@Admin>(<- create Admin(), to: self.ADMIN_STORAGE_PATH)
        self.account.link<&Admin{PublicResults}>(self.PUBLIC_CAPABILITY_PATH, target: self.ADMIN_STORAGE_PATH)
    }
}
