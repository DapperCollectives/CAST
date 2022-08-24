import FLOAT from 0xf8d6e0586b0a20c7
import FLOATVerifiers from 0xf8d6e0586b0a20c7
import NonFungibleToken from 0xf8d6e0586b0a20c7
import MetadataViews from 0xf8d6e0586b0a20c7
import GrantedAccountAccess from 0xf8d6e0586b0a20c7

transaction(groupName: String, image: String, description: String) {

  let FLOATEvents: &FLOAT.FLOATEvents

  prepare(acct: AuthAccount) {
      // SETUP COLLECTION
      if acct.borrow<&FLOAT.Collection>(from: FLOAT.FLOATCollectionStoragePath) == nil {
          acct.save(<- FLOAT.createEmptyCollection(), to: FLOAT.FLOATCollectionStoragePath)
          acct.link<&FLOAT.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection, FLOAT.CollectionPublic}>
                  (FLOAT.FLOATCollectionPublicPath, target: FLOAT.FLOATCollectionStoragePath)
      }

      // SETUP FLOATEVENTS
      if acct.borrow<&FLOAT.FLOATEvents>(from: FLOAT.FLOATEventsStoragePath) == nil {
        acct.save(<- FLOAT.createEmptyFLOATEventCollection(), to: FLOAT.FLOATEventsStoragePath)
        acct.link<&FLOAT.FLOATEvents{FLOAT.FLOATEventsPublic, MetadataViews.ResolverCollection}>
                  (FLOAT.FLOATEventsPublicPath, target: FLOAT.FLOATEventsStoragePath)
      }

      // SETUP SHARED MINTING
      if acct.borrow<&GrantedAccountAccess.Info>(from: GrantedAccountAccess.InfoStoragePath) == nil {
          acct.save(<- GrantedAccountAccess.createInfo(), to: GrantedAccountAccess.InfoStoragePath)
          acct.link<&GrantedAccountAccess.Info{GrantedAccountAccess.InfoPublic}>
                  (GrantedAccountAccess.InfoPublicPath, target: GrantedAccountAccess.InfoStoragePath)
      }

      self.FLOATEvents = acct.borrow<&FLOAT.FLOATEvents>(from: FLOAT.FLOATEventsStoragePath)
                        ?? panic("Could not borrow the FLOATEvents from the signer.")

  }

  execute {
    self.FLOATEvents.createGroup(groupName: groupName, image: image, description: description)
    log("Created a new Group.")
  }

  }
