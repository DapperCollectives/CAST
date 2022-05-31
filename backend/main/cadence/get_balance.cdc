// This script reads the balance field of an account's FlowToken Balance
import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

pub fun main(path: PublicPath, account: Address): UFix64 {

    let vaultRef = getAccount(account)
        .getCapability(path)
        .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
