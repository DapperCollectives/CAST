import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

transaction(amount: UFix64, recipient: Address) {
    prepare(signer: AuthAccount) {
        let vault = signer.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault)!
        let tokens <- vault.withdraw(amount: amount)

        let receiver = getAccount(recipient).getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()!
        
        receiver.deposit(from: <- tokens)
    }
}