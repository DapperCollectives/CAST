import FungibleToken from "FUNGIBLE_TOKEN_ADDRESS"
import "TOKEN_NAME" from "TOKEN_ADDRESS"

pub struct AccountInfo {
    pub(set) var address: Address?
    pub(set) var balance: UFix64
    pub(set) var hasVault: Bool

    init() {
        self.address = nil
        self.balance = 0.0 as UFix64
        self.hasVault = true
    }
}

pub fun main(address: Address): AccountInfo {
    var info: AccountInfo = AccountInfo()
    let account = getAccount(address)
    info.address = address

    if let vaultRef = account.getCapability(/public/"TOKEN_BALANCE_PATH")
        .borrow<&"TOKEN_NAME".Vault{FungibleToken.Balance}>() {
            info.balance = vaultRef.balance
            info.hasVault = true
    }
    else {
        info.hasVault = false
    }
    return info
}
 