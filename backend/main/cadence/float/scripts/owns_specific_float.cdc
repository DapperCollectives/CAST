import FLOAT from 0x2d4c3caffbeab845

pub fun main(account: Address, eventId: UInt64): Bool {
  let floatCollection = getAccount(account).getCapability(FLOAT.FLOATCollectionPublicPath)
                        .borrow<&FLOAT.Collection{FLOAT.CollectionPublic}>()
                        ?? panic("Could not borrow the Collection from the account.")
  
  return floatCollection.ownedIdsFromEvent(eventId: eventId).length > 0
}
