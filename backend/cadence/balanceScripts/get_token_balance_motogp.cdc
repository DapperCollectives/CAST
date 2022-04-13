// get FLOW balance of MotoGPTransfer
import MotoGPTransfer from 0xa49cc0ee46c54bfb

pub struct AccountInfo {
    pub(set) var primaryAcctBalance: UFix64
    pub(set) var secondaryAddress: Address?
    pub(set) var secondaryAcctBalance: UFix64
    pub(set) var stakedBalance: UFix64
    pub(set) var hasVault: Bool
    pub(set) var stakes: String

    init() {
        self.primaryAcctBalance = 0.0 as UFix64
        self.secondaryAddress = nil
        self.secondaryAcctBalance = 0.0 as UFix64
        self.stakedBalance = 0.0 as UFix64
        self.hasVault = true
        self.stakes = ""
    }
}

pub fun main(): {Address: AccountInfo} {
    let accountDict: {Address: AccountInfo} = {}
    let address: Address = 0xa49cc0ee46c54bfb
    let info: AccountInfo = AccountInfo()
    info.primaryAcctBalance = MotoGPTransfer.getFlowBalance()
    accountDict.insert(key: address, info)

    return accountDict
}