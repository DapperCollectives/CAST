import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction() {
    let acct: AuthAccount

    prepare(acct: AuthAccount) {
        self.acct = acct
    }

    execute {
        let proxyAdminCap = self.acct.borrow<&VotingCommunity.AdminProxy>(from: VotingCommunity.ADMIN_PROXY_STORAGE_PATH) ??
            panic("cannot get creator capability")
        let superAdminResource <- proxyAdminCap.createSuperAdmin()
        self.acct.save<@VotingCommunity.SuperAdmin>(<- superAdminResource, to: VotingCommunity.SUPER_ADMIN_PATH)
    }
}
