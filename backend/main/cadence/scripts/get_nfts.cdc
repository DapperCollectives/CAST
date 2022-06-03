import NonFungibleToken from 0xf8d6e0586b0a20c7
import ExampleNFT from 0xf8d6e0586b0a20c7

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account
        .getCapability(ExampleNFT.CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs().length
}
