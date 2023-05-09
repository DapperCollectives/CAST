import NonFungibleToken from "NON_FUNGIBLE_TOKEN_ADDRESS"

pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account
        .getCapability(/public/"COLLECTION_PUBLIC_PATH")
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs()
}
