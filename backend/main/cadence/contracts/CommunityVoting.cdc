// CommunityVoting.cdc
// A straightforward community storage contract

pub contract CommunityVoting {
    // constants
    pub let COMMUNITY_STORAGE_PATH: StoragePath
    pub let COMMUNITY_PUBLIC_PATH: PublicPath
    pub let COLLECTION_MINTER_PATH: StoragePath
    pub let SUPER_ADMIN_PATH: PrivatePath

    // global variables
    access(contract) var currentCommunityId: UInt64

    // events
    pub event CommunityCreated()
    pub event CommunityCollectionIssued()

    // main community resource
    pub resource Community {
        pub let id: UInt64
        pub(set) var results: [String]

        init() {
            self.id = CommunityVoting.currentCommunityId + 1
            CommunityVoting.currentCommunityId = CommunityVoting.currentCommunityId + 1
            self.results = []
        }
    }

    // community struct for getting/reporting
    pub struct CommunityStruct {
        pub let id: UInt64
        pub let results: [String]

        init(community: &Community) {
            self.id = community.id
            self.results = community.results
        }
    }

    // receiver, mostly representing "Admin" capabilites
    pub resource interface CommunityReceiver {
        pub fun receiveCommunity(community: @Community)
        pub fun receiveResults(communityId: UInt64, results: [String])
    }

    // main collection of communities
    pub resource CommunityCollection: CommunityReceiver {
        pub let communities: @{UInt64: Community}

        init() {
            self.communities <- {}
        }

        pub fun createCommunity(): @Community {
            let community <- create Community()
            emit CommunityCreated()
            return <- community
        }

        pub fun receiveCommunity(community: @Community) {
            let oldCommunity <- self.communities[community.id] <- community
            destroy oldCommunity
        }

        pub fun receiveResults(communityId: UInt64, results: [String]) {
            pre {
                self.communities[communityId] != nil : "community does not exist"
            }
            let communityRef = &self.communities[communityId] as &Community
            communityRef.results = results
        }

        destroy() {
            destroy self.communities
        }
    }

    // SuperAdmin interface in order to link capabilities for distributing CommunityCollections which are basically Admin capabilites
    pub resource interface SuperAdmin {
        pub fun mintCollection(): @CommunityCollection
    }

    // resource for super admin stuff for now... may refactor
    pub resource CollectionMinter: SuperAdmin {
        pub fun mintCollection(): @CommunityCollection {
            emit CommunityCollectionIssued()
            return <- create CommunityCollection()
        }
    }

    init() {
        // set initial values
        self.COMMUNITY_STORAGE_PATH = /storage/DapperCollectivesCommunityVotingTool_Communities
        self.COMMUNITY_PUBLIC_PATH = /public/DapperCollectivesCommunityVotingTool_Communities
        self.COLLECTION_MINTER_PATH = /storage/DapperCollectivesCommunityVotingTool_CollectionMinter
        self.SUPER_ADMIN_PATH = /private/DapperCollectivesCommunityVotingTool_SuperAdmin


        self.currentCommunityId = 0

        // set up owner's account with empty collection and CollectionMinter resource
        self.account.save<@CommunityCollection>(<- create CommunityCollection(), to: self.COMMUNITY_STORAGE_PATH)
        self.account.save<@CollectionMinter>(<- create CollectionMinter(), to: self.COLLECTION_MINTER_PATH)

        // link capabilities
        self.account.link<&CollectionMinter{SuperAdmin}>(self.SUPER_ADMIN_PATH, target: self.COLLECTION_MINTER_PATH)
    }
}
