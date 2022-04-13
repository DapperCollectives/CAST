import VotingCommunity from "../contracts/VotingCommunity.cdc"

pub fun main(): Int {
    let acct = getAccount(0x02)
    let cap = acct.getCapability<&VotingCommunity.AdminProxy>(VotingCommunity.ADMIN_PROXY_PUBLIC_PATH).borrow() ??
        panic("what capability, sir?")
    cap.testAdmin()
    return 1
}