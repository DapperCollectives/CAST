import FLOAT from 0xf8d6e0586b0a20c7
import FLOATVerifiers from 0xf8d6e0586b0a20c7
import NonFungibleToken from 0xf8d6e0586b0a20c7
import MetadataViews from 0xf8d6e0586b0a20c7
import GrantedAccountAccess from 0xf8d6e0586b0a20c7

transaction(
  forHost: Address, 
  claimable: Bool, 
  name: String, 
  description: String, 
  image: String, 
  url: String, 
  transferrable: Bool, 
  timelock: Bool, 
  dateStart: UFix64, 
  timePeriod: UFix64, 
  secret: Bool, 
  secretPK: String, 
  limited: Bool, 
  capacity: UInt64, 
  initialGroups: [String], 
  flowTokenPurchase: Bool, 
  flowTokenCost: UFix64,
  minimumBalanceToggle: Bool,
  minimumBalance: UFix64
) {

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
    
    if forHost != acct.address {
      let FLOATEvents = acct.borrow<&FLOAT.FLOATEvents>(from: FLOAT.FLOATEventsStoragePath)
                        ?? panic("Could not borrow the FLOATEvents from the signer.")
      self.FLOATEvents = FLOATEvents.borrowSharedRef(fromHost: forHost)
    } else {
      self.FLOATEvents = acct.borrow<&FLOAT.FLOATEvents>(from: FLOAT.FLOATEventsStoragePath)
                        ?? panic("Could not borrow the FLOATEvents from the signer.")
    }
  }

  execute {
    var Timelock: FLOATVerifiers.Timelock? = nil
    var SecretV2: FLOATVerifiers.SecretV2? = nil
    var Limited: FLOATVerifiers.Limited? = nil
    var MinimumBalance: FLOATVerifiers.MinimumBalance? = nil
    var verifiers: [{FLOAT.IVerifier}] = []
    if timelock {
      Timelock = FLOATVerifiers.Timelock(_dateStart: dateStart, _timePeriod: timePeriod)
      verifiers.append(Timelock!)
    }
    if secret {
      SecretV2 = FLOATVerifiers.SecretV2(_publicKey: secretPK)
      verifiers.append(SecretV2!)
    }
    if limited {
      Limited = FLOATVerifiers.Limited(_capacity: capacity)
      verifiers.append(Limited!)
    }
    if minimumBalanceToggle {
      MinimumBalance = FLOATVerifiers.MinimumBalance(_amount: minimumBalance)
      verifiers.append(MinimumBalance!)
    }
    let extraMetadata: {String: AnyStruct} = {}
    if flowTokenPurchase {
      let tokenInfo = FLOAT.TokenInfo(_path: /public/flowTokenReceiver, _price: flowTokenCost)
      extraMetadata["prices"] = {"A.1654653399040a61.FlowToken.Vault": tokenInfo}
    }
    self.FLOATEvents.createEvent(claimable: claimable, description: description, image: image, name: name, transferrable: transferrable, url: url, verifiers: verifiers, extraMetadata, initialGroups: initialGroups)
    log("Started a new event for host.")
  }
}  
