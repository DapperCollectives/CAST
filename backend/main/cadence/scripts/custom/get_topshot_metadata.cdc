import TopShot from 0xf8d6e0586b0a20c7
import MetadataViews from 0xf8d6e0586b0a20c7


pub fun main(address: Address, id: UInt64): TopShot.TopShotMomentMetadataView {
    let account = getAccount(address)

    let collectionRef = account.getCapability(/public/MomentCollection)
                            .borrow<&{TopShot.MomentCollectionPublic}>()!

    let nft = collectionRef.borrowMoment(id: id)!
    
    // Get the Top Shot specific metadata for this NFT
    let view = nft.resolveView(Type<TopShot.TopShotMomentMetadataView>())!

    let metadata = view as! TopShot.TopShotMomentMetadataView
    
    return metadata
}
