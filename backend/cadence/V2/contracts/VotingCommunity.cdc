// Voting Community v2

pub contract VotingCommunity {
    pub let SUPER_ADMIN_PATH: StoragePath
    pub let COMMUNITY_COLLECTION_PATH: StoragePath
    pub let ADMIN_PROXY_STORAGE_PATH: StoragePath
    pub let ADMIN_PROXY_PUBLIC_PATH: PublicPath
    pub let COMMUNITY_PUBLIC_PATH: PublicPath
    pub let COMMUNITY_RECEIVER_PUBLIC_PATH: PublicPath
    pub let COMMUNITY_PUBLIC_CAPABILITY_PATH: PublicPath

    access(self) var currentCommunityId: UInt64
    pub var currentAdminId: UInt64

    pub event CommunityCreated(id: UInt64, meta: {String: String}?)
    pub event AdminProxyCreated(meta: {String: String}?)
    pub event AdminCapabilityDistributed(to: Address, meta: {String: String}?)
    pub event CommunityCollectionCreated(meta: {String: String}?)
    pub event ResultsStored(results: [String], meta: {String: String}?)

    pub struct CommunityStruct {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let meta: {String: String}
        pub let proposalResults: {UInt64: [String]}

        init(community: &Community) {
            self.id = community.id
            self.name = community.name
            self.description = community.description
            self.meta = community.meta
            self.proposalResults = community.proposalResults
        }
    }

    pub resource Community {
        pub let id: UInt64
        pub let name: String
        pub let description: String
        pub let meta: {String: String}
        pub let proposalResults: {UInt64: [String]}

        init(name: String, description: String, meta: {String: String}) {
            self.id = VotingCommunity.currentCommunityId
            VotingCommunity.currentCommunityId = VotingCommunity.currentCommunityId + 1

            self.name = name
            self.description = description
            self.meta = meta
            self.proposalResults = {}
            emit CommunityCreated(id: self.id, meta: nil)
        }

        pub fun setMeta(key: String, value: String) {
            self.meta[key] = value
        }

        pub fun addResults(proposalId: UInt64, results: [String]) {
            self.proposalResults[proposalId] = results
            emit ResultsStored(results: results, meta: {"proposalId": proposalId.toString()})
        }
    }

    pub resource interface Admin {
        pub fun createCommunity(name: String, description: String, meta: {String: String}): @Community
        pub fun createAndStoreCommunity(name: String, description: String, meta: {String: String})
        pub fun storeResults(communityId: UInt64, proposalId: UInt64, results: [String])
    }

    pub resource interface CommunityReceiver {
        pub fun receiveCommunity(community: @Community)
    }

    pub resource interface CommunityPublic {
        pub fun getCommunities(): [CommunityStruct]
    }

    pub resource CommunityCollection: Admin, CommunityPublic, CommunityReceiver {
        pub let communities: @{UInt64: Community}

        pub init() {
            self.communities <- {}
            emit CommunityCollectionCreated(meta: nil)
        }

        pub fun createCommunity(name: String, description: String, meta: {String: String}): @Community {
            return <- create Community(name: name, description: description, meta: meta)
        }

        pub fun receiveCommunity(community: @Community) {
            let oldCommunity <- self.communities[community.id] <- community
            destroy oldCommunity
        }

        pub fun createAndStoreCommunity(name: String, description: String, meta: {String: String}) {
            let community <- create Community(name: name, description: description, meta: meta)
            let oldCommunity <- self.communities[community.id] <- community
            destroy oldCommunity
        }

        pub fun getCommunities(): [CommunityStruct] {
            let retArr: [CommunityStruct] = []

            for id in self.communities.keys {
                let communityRef = &self.communities[id] as &Community
                retArr.append(CommunityStruct(community: communityRef))
            }
            return retArr
        }

        pub fun storeResults(communityId: UInt64, proposalId: UInt64, results: [String]) {
            let communityRef = &self.communities[communityId] as &Community
            communityRef.addResults(proposalId: proposalId, results: results)
        }

        pub destroy() {
            destroy self.communities
        }
    }

    pub resource interface AdminReceiver {
        pub fun setCapability(capability: Capability<&CommunityCollection>)
    }

    pub resource AdminProxy: AdminReceiver, Admin {
        access(self) var adminCapability: Capability<&CommunityCollection>?

        init() {
            self.adminCapability = nil
            emit AdminProxyCreated(meta: nil)
        }

        pub fun setCapability(capability: Capability<&CommunityCollection>) {
            self.adminCapability = capability
        }

        pub fun createCommunity(name: String, description: String, meta: {String: String}): @Community {
            return <- self.adminCapability!
                .borrow()!
                .createCommunity(name: name, description: description, meta: meta)
        }

        pub fun createAndStoreCommunity(name: String, description: String, meta: {String: String}) {
            self.adminCapability!
                .borrow()!
                .createAndStoreCommunity(name: name, description: description, meta: meta)
        }

        pub fun storeResults(communityId: UInt64, proposalId: UInt64, results: [String]) {
            self.adminCapability!
                .borrow()!
                .storeResults(communityId: communityId, proposalId: proposalId, results: results)
        }
    }

    pub resource SuperAdmin {
        pub let distributedCapabilities: {Address: Path}

        init() {
            self.distributedCapabilities = {}
        }

        pub fun createCollection(): @CommunityCollection {
            return <- create CommunityCollection()
        }

        pub fun trackCapability(adminAddress: Address, storagePath: StoragePath) {
            self.distributedCapabilities[adminAddress] = storagePath
            emit AdminCapabilityDistributed(to: adminAddress, meta: nil)
        }
    }

    pub fun createAdminProxy(): @AdminProxy {
        VotingCommunity.currentAdminId = VotingCommunity.currentAdminId + 1
        return <- create AdminProxy()
    }

    init() {
        self.SUPER_ADMIN_PATH = /storage/DAPPER_COLLECTIVES_VOTING_COMMUNITY_Super_Admin
        self.COMMUNITY_COLLECTION_PATH = /storage/DAPPER_COLLECTIVES_VOTING_COMMUNITY_Community_Collection
        self.COMMUNITY_PUBLIC_PATH = /public/DAPPER_COLLECTIVES_VOTING_COMMUNITY_Community_Public
        self.COMMUNITY_RECEIVER_PUBLIC_PATH = /public/DAPPER_COLLECTIVES_VOTING_COMMUNITY_Community_Receiver_Public
        self.ADMIN_PROXY_STORAGE_PATH = /storage/DAPPER_COLLECTIVES_VOTING_COMMUNITY_Admin_Proxy
        self.ADMIN_PROXY_PUBLIC_PATH = /public/DAPPER_COLLECTIVES_VOTING_COMMUNITY_Admin_Proxy
        self.COMMUNITY_PUBLIC_CAPABILITY_PATH = /public/DAPPER_COLLECTIVES_VOTING_COMMUNITY_Public_Capability

        self.currentCommunityId = 0
        self.currentAdminId = 0

        self.account.save<@CommunityCollection>(<- create CommunityCollection(), to: self.COMMUNITY_COLLECTION_PATH)
        self.account.link<&{CommunityReceiver}>(self.COMMUNITY_RECEIVER_PUBLIC_PATH, target: self.COMMUNITY_COLLECTION_PATH)
        self.account.link<&{CommunityPublic}>(self.COMMUNITY_PUBLIC_PATH, target: self.COMMUNITY_COLLECTION_PATH)

        self.account.save<@SuperAdmin>(<- create SuperAdmin(), to: self.SUPER_ADMIN_PATH)
    }
}
