import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction(communityId: UInt64, proposalId: UInt64, results: [String]) {
    let acct: AuthAccount
    prepare(acct: AuthAccount){
        self.acct = acct
    }
    execute{
        let adminCap = self.acct.borrow<&VotingCommunity.AdminProxy>(from: VotingCommunity.ADMIN_PROXY_STORAGE_PATH) ??
            panic("cannot get creator capability")
        adminCap.storeResults(
          communityId: communityId, 
          proposalId: proposalId,
          results: results
        )
    }
}