// This script reads the balance field of an account's FlowToken Balance
import FungibleToken from {{FUNGIBLE_TOKEN_ADDRESS}}
import {{TOKEN_NAME}} from {{TOKEN_ADDRESS}}

pub fun main(path: PublicPath, account: Address): UFix64 {

    let vaultRef = getAccount(account)
        .getCapability(path)
        .borrow<&{{TOKEN_NAME}}.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}

