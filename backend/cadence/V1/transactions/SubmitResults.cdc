import CommunityVoting from "../contracts/CommunityVoting.cdc"

transaction(proposalId: UInt64, results: [String]) {

  let acct: AuthAccount
  prepare(acct: AuthAccount) {
    self.acct = acct
  }

  execute {
    let adminRef = self.acct.borrow<&CommunityVoting.Admin>(from: CommunityVoting.ADMIN_STORAGE_PATH) ??
      panic("no admin ref")

    adminRef.addResult(proposalId: proposalId, results: results)
  }
}
