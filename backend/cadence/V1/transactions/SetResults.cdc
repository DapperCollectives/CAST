import CommunityVoting from "../contracts/CommunityVoting.cdc"

transaction(results: {UInt64: [String]}) {

  let acct: AuthAccount
  prepare(acct: AuthAccount) {
    self.acct = acct
  }

  execute {
    let adminRef = self.acct.borrow<&CommunityVoting.Admin>(from: CommunityVoting.ADMIN_STORAGE_PATH) ??
      panic("no admin ref")

    adminRef.setResults(results: results)
  }
}
