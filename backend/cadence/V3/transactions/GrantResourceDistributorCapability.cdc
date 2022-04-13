import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction(adminRequesterAddress: Address) {

    let capabilityPrivatePath: PrivatePath
    let resourceDistributorCapability: Capability<&VotingCommunity.ResourceDistributor>
    let adminRequester: PublicAccount

    prepare(superAdmin: AuthAccount) {

        self.adminRequester = getAccount(adminRequesterAddress)

        // These paths must be unique within the contract account's storage
        // TODO: use programatic Paths when supported, or construct on client and pass in
        // self.resourceStoragePath = StoragePath(identifier: adminRequesterAddress.toString())
        // self.capabilityPrivatePath = PrivatePath(identifier: adminRequesterAddress.toString())
        // self.resourceStoragePath = /storage/admin_01
        // self.capabilityPrivatePath = /private/admin_01
        self.capabilityPrivatePath= %PRIVATE_PATH%

        let resourceDistributorCap = superAdmin.borrow<&VotingCommunity.ResourceDistributor>(from: VotingCommunity.RESOURCE_DISTRIBUTOR_PATH) ??
            panic("Could not find ResourceDistributor resource")

        // create collection to be linked
        // let collection <- superAdminCap.createCollection()
        // superAdmin.save(<- collection, to: self.resourceStoragePath)

        // link capability
        self.resourceDistributorCapability = superAdmin.link<&VotingCommunity.ResourceDistributor>(self.capabilityPrivatePath, target: VotingCommunity.RESOURCE_DISTRIBUTOR_PATH) ??
            panic("Could not link admin capability")
        
        // track the capability in-contract
        resourceDistributorCap.trackCapability(adminAddress: self.adminRequester.address, privatePath: self.capabilityPrivatePath)

    }

    execute {

        let capabilityReceiver = self.adminRequester.getCapability
            <&VotingCommunity.AdminProxy{VotingCommunity.AdminReceiver}>
            (VotingCommunity.ADMIN_PROXY_PUBLIC_PATH)
            .borrow() ?? panic("Could not borrow capability receiver reference")

        capabilityReceiver.setResourceDistributorCapability(capability: self.resourceDistributorCapability)
    }
}