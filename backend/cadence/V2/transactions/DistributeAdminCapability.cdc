import VotingCommunity from "../contracts/VotingCommunity.cdc"

transaction(adminRequesterAddress: Address) {

    let resourceStoragePath: StoragePath
    let capabilityPrivatePath: CapabilityPath
    let adminCapability: Capability<&VotingCommunity.CommunityCollection>
    let adminRequester: PublicAccount

    prepare(superAdmin: AuthAccount) {

        self.adminRequester = getAccount(adminRequesterAddress)

        // These paths must be unique within the contract account's storage
        // TODO: use programatic Paths when supported, or construct on client and pass in
        // self.resourceStoragePath = StoragePath(identifier: adminRequesterAddress.toString())
        // self.capabilityPrivatePath = PrivatePath(identifier: adminRequesterAddress.toString())
        // self.resourceStoragePath = /storage/admin_01
        // self.capabilityPrivatePath = /private/admin_01
        self.resourceStoragePath = %STORAGE_PATH%
        self.capabilityPrivatePath= %PRIVATE_PATH%

        let superAdminCap = superAdmin.borrow<&VotingCommunity.SuperAdmin>(from: VotingCommunity.SUPER_ADMIN_PATH) ??
            panic("Could not find Super Admin resource")

        // create collection to be linked
        let collection <- superAdminCap.createCollection()
        superAdmin.save(<- collection, to: self.resourceStoragePath)

        // link capability
        self.adminCapability = superAdmin.link<&VotingCommunity.CommunityCollection>(self.capabilityPrivatePath, target: self.resourceStoragePath) ??
            panic("Could not link admin capability")
        
        // track the capability in-contract
        superAdminCap.trackCapability(adminAddress: self.adminRequester.address, storagePath: self.resourceStoragePath)

    }

    execute {

        let capabilityReceiver = self.adminRequester.getCapability
            <&VotingCommunity.AdminProxy{VotingCommunity.AdminReceiver}>
            (VotingCommunity.ADMIN_PROXY_PUBLIC_PATH)
            .borrow() ?? panic("Could not borrow capability receiver reference")

        capabilityReceiver.setCapability(capability: self.adminCapability)
    }

}
