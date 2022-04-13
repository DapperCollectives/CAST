import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction(name: String, description: String, meta: {String: String}) {
    let acct: AuthAccount

    prepare(acct: AuthAccount) {
        self.acct = acct
    }

    execute {
        let adminCap = self.acct.borrow<&VotingCommunity.AdminProxy>(from: VotingCommunity.ADMIN_PROXY_STORAGE_PATH) ??
            panic("cannot get creator capability")
        adminCap.createAndStoreCommunity(
            name: name,
            description: description,
            meta: meta
        )
    }
}
