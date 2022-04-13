import CommunityVoting from "../contracts/CommunityVoting.cdc"

pub fun main(adminAddress: Address): {UInt64: [String]} {
  let acct = getAccount(adminAddress)
  let cap = acct.getCapability<&CommunityVoting.Admin{CommunityVoting.PublicResults}>(CommunityVoting.PUBLIC_CAPABILITY_PATH).borrow() ??
    panic("cannot find capability")
  
  return cap.getResults()
}
