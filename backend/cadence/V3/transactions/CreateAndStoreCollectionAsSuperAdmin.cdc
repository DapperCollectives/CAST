import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction() {
    let acct: AuthAccount

    prepare(acct: AuthAccount) {
        self.acct = acct
    }

    execute {
        let superAdminCap = self.acct.borrow<&VotingCommunity.SuperAdmin>(from: VotingCommunity.SUPER_ADMIN_PATH) ??
            panic("cannot get super admin capability")
        let collectionResource <- superAdminCap.createCollection()
        self.acct.save<@VotingCommunity.CommunityCollection>(<- collectionResource, to: VotingCommunity.COMMUNITY_COLLECTION_PATH)
    }
}
