import FungibleToken from 0xee82856bf20e2aa6 

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)

    let vaultRef = account.getCapability(/public/MainVault)
        .borrow<&FungibleToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
