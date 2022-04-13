import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction {

    let acct: AuthAccount

    prepare(acct: AuthAccount) {
        self.acct = acct
    }

    execute {
        let path = StoragePath(identifier: "something")
    }
}