import TopShot from 0x0b2a3299cc857e29
import MetadataViews from 0x1d7e57aa55817448

pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account.getCapability(/public/MomentCollection)
                            .borrow<&{TopShot.MomentCollectionPublic}>()!

    let ids = collectionRef.getIDs()

    let nftIds: [UInt64] = []

    for id in ids {
        let nft = collectionRef.borrowMoment(id: id)!
        let view = nft.resolveView(Type<TopShot.TopShotMomentMetadataView>())!
        let metadata = view as! TopShot.TopShotMomentMetadataView

        if metadata.teamAtMoment == "Toronto Raptors" {
             nftIds.append(id)
        }
    }
    
    return nftIds
}
