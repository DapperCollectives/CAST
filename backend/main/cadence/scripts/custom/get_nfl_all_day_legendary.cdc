import AllDay from 0xe4cf4bdc1751c65d 

pub fun main(address: Address): [UInt64] {

    let account = getAccount(address)

    let collectionRef = account.getCapability(/public/AllDayNFTCollection)
                            .borrow<&{AllDay.MomentNFTCollectionPublic}>()!

    let ids = collectionRef.getIDs()

    let nftIds: [UInt64] = []

    for id in ids {
        let nft = collectionRef.borrowNFT(id: id)!
        let view = nft.resolveView(Type<AllDay.AllDayMomentMetadataView>())!
        let metadata = view as! AllDay.AllDayMomentMetadataView

        if metadata.teamAtMoment == "Portland Trailblazers" {
             nftIds.append(id)
        }
    }
    
    return nftIds
}
