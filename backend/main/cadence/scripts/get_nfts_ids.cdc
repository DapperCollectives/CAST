import NonFungibleToken from "NON_FUNGIBLE_TOKEN_ADDRESS" 
import "TOKEN_NAME" from "TOKEN_ADDRESS" 

pub fun main(address: Address): [UInt64]{
    let account = getAccount(address)

    let collectionRef = account
        .getCapability("TOKEN_NAME".CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs()
}

