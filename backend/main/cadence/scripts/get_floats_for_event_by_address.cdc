import NonFungibleToken from "NON_FUNGIBLE_TOKEN_ADDRESS" 
import FLOAT from "FLOAT_TOKEN_ADDRESS"

pub fun main(account: Address, eventId: UInt64): [UInt64] {
  let nftCollection = getAccount(account).getCapability(FLOAT.FLOATCollectionPublicPath)
                        .borrow<&FLOAT.Collection{NonFungibleToken.CollectionPublic}>()
                        ?? panic("Could not borrow the Collection from the account.")
  return nftCollection.ownedIdsFromEvent(eventId: eventId)
}