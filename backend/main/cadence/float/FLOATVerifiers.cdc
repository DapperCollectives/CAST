import FLOAT from 0xf8d6e0586b0a20c7
import FungibleToken from 0xee82856bf20e2aa6 
import FlowToken from 0x0ae53cb6e3f42a79

pub contract FLOATVerifiers {

    // The "verifiers" to be used
    
    //
    // Timelock
    //
    // Specifies a time range in which the 
    // FLOAT from an event can be claimed
    pub struct Timelock: FLOAT.IVerifier {
        // An automatic switch handled by the contract
        // to stop people from claiming after a certain time.
        pub let dateStart: UFix64
        pub let dateEnding: UFix64

        pub fun verify(_ params: {String: AnyStruct}) {
            assert(
                getCurrentBlock().timestamp >= self.dateStart,
                message: "This FLOAT Event has not started yet."
            )
            assert(
                getCurrentBlock().timestamp <= self.dateEnding,
                message: "Sorry! The time has run out to mint this FLOAT."
            )
        }

        init(_dateStart: UFix64, _timePeriod: UFix64) {
            self.dateStart = _dateStart
            self.dateEnding = self.dateStart + _timePeriod
        }
    }

    //
    // Secret
    //
    // Specifies a secret code in order
    // to claim a FLOAT (not very secure, but cool feature)
    pub struct Secret: FLOAT.IVerifier {
        // The secret code, set by the owner of this event.
        access(self) let secretPhrase: String

        pub fun verify(_ params: {String: AnyStruct}) {
            let secretPhrase = params["secretPhrase"]! as! String
            assert(
                self.secretPhrase == secretPhrase, 
                message: "You did not input the correct secret phrase."
            )
        }

        init(_secretPhrase: String) {
            self.secretPhrase = _secretPhrase
        }
    }

    //
    // Limited
    //
    // Specifies a limit for the amount of people
    // who can CLAIM. Not to be confused with how many currently
    // hold a FLOAT from this event, since users can
    // delete their FLOATs.
    pub struct Limited: FLOAT.IVerifier {
        pub var capacity: UInt64

        pub fun verify(_ params: {String: AnyStruct}) {
            let event = params["event"]! as! &FLOAT.FLOATEvent{FLOAT.FLOATEventPublic}
            let currentCapacity = event.totalSupply
            assert(
                currentCapacity < self.capacity,
                message: "This FLOAT Event is at capacity."
            )
        }

        init(_capacity: UInt64) {
            self.capacity = _capacity
        }
    }

    //
    // MultipleSecret
    //
    // Allows for Multiple Secret codes
    // Everytime a secret gets used, it gets removed
    // from the list.
    pub struct MultipleSecret: FLOAT.IVerifier {
        access(self) let secrets: {String: Bool}

        pub fun verify(_ params: {String: AnyStruct}) {
            let secretPhrase = params["secretPhrase"]! as! String
            assert(
                self.secrets[secretPhrase] != nil, 
                message: "You did not input a correct secret phrase."
            )
            self.secrets.remove(key: secretPhrase)
        }

        init(_secrets: [String]) {
            self.secrets = {}
            for secret in _secrets {
                self.secrets[secret] = true
            }
        }
    }

    //
    // SecretV2
    //
    // Much more secure than Secret
    pub struct SecretV2: FLOAT.IVerifier {
        pub let publicKey: String

        pub fun verify(_ params: {String: AnyStruct}) {
            let data: [UInt8] = (params["claimee"]! as! Address).toString().utf8
            let sig: [UInt8] = (params["secretSig"]! as! String).decodeHex()
            let publicKey = PublicKey(publicKey: self.publicKey.decodeHex(), signatureAlgorithm: SignatureAlgorithm.ECDSA_P256)
            let valid = publicKey.verify(signature: sig, signedData: data, domainSeparationTag: "FLOW-V0.0-user", hashAlgorithm: HashAlgorithm.SHA3_256)
            
            assert(
                valid, 
                message: "You did not input the correct secret phrase."
            )
        }

        init(_publicKey: String) {
            self.publicKey = _publicKey
        }
    }

    //
    // MinimumBalance
    //
    // Requires a minimum Flow Balance to succeed
    pub struct MinimumBalance: FLOAT.IVerifier {
        pub let amount: UFix64

        pub fun verify(_ params: {String: AnyStruct}) {
            let claimee: Address = params["claimee"]! as! Address
            let flowVault = getAccount(claimee).getCapability(/public/flowTokenBalance)
                                .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
                                ?? panic("Could not borrow the Flow Token Vault")
            
            assert(
                flowVault.balance >= self.amount, 
                message: "You do not meet the minimum required Flow Token balance."
            )
        }

        init(_amount: UFix64) {
            self.amount = _amount
        }
    }
}
