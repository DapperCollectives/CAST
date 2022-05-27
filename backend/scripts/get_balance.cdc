import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)

    let vaultRef = account.getCapability(/public/flowTokenVault)
        .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
