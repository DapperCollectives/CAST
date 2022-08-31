import TopShot from 0xTOPSHOTADDRESS
import MetadataViews from 0xMETADATAVIEWSADDRESS


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
            nftIds = nftIds.concat(id)
        }
    }
    
    return nftIds
}