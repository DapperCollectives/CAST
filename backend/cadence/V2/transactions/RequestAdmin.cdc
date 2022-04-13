import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction {

  prepare(acct: AuthAccount) {
    let adminProxy <- VotingCommunity.createAdminProxy()

    acct.save(<- adminProxy, to: VotingCommunity.ADMIN_PROXY_STORAGE_PATH)

    acct.link<&VotingCommunity.AdminProxy{VotingCommunity.AdminReceiver}>(
      VotingCommunity.ADMIN_PROXY_PUBLIC_PATH,
      target: VotingCommunity.ADMIN_PROXY_STORAGE_PATH
    )
  }
}
