// This script reads the balance field of an account's FlowToken Balance
import FungibleToken from "FUNGIBLE_TOKEN"
import "TOKEN_NAME" from "EXAMPLE_TOKEN"

pub fun main(path: PublicPath, account: Address): UFix64 {

    let vaultRef = getAccount(account)
        .getCapability(path)
        .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
