import NonFungibleToken from "NON_FUNGIBLE_TOKEN_ADDRESS"
import "TOKEN_NAME" from "TOKEN_ADDRESS"
import MetadataViews from "METADATA_VIEWS_ADDRESS" 

/// This transaction is what an account would run
/// to set itself up to receive NFTs
transaction {

    prepare(signer: AuthAccount) {
        // Return early if the account already has a collection
        if signer.borrow<&"TOKEN_NAME".Collection>(from: "TOKEN_NAME".CollectionStoragePath) != nil {
            return
        }

        // Create a new empty collection
        let collection <- "TOKEN_NAME".createEmptyCollection()

        // save it to the account
        signer.save(<-collection, to: "TOKEN_NAME".CollectionStoragePath)

        // create a public capability for the collection
        signer.link<&{NonFungibleToken.CollectionPublic, "TOKEN_NAME"."TOKEN_NAME"CollectionPublic, MetadataViews.ResolverCollection}>(
            "TOKEN_NAME".CollectionPublicPath,
            target: "TOKEN_NAME".CollectionStoragePath
        )
    }
}
