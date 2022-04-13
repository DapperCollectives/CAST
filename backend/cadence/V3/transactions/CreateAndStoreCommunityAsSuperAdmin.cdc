import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction(name: String, description: String, meta: {String: String}) {
    let acct: AuthAccount

    prepare(acct: AuthAccount) {
        self.acct = acct
    }

    execute {
        let communityCollectionCap = self.acct.borrow<&VotingCommunity.CommunityCollection>(from: VotingCommunity.COMMUNITY_COLLECTION_PATH) ??
            panic("cannot get community collection capability")
        communityCollectionCap.createAndStoreCommunity(name: name, description: description, meta: meta)
    }
}