import Crypto

pub fun main(
    address: Address,
    keyIds: [Int],
    signatures: [String],
    message: String
): Bool {
    let keyList = Crypto.KeyList()
    let account = getAccount(address)

    let keyIds = keyIds
    let uniqueKeys: {Int: Bool} = {}
    for id in keyIds {
        assert(uniqueKeys[id] == nil, message: "Duplicate keyId found for signatures")
        uniqueKeys[id] = true
    }

    // In verify we need a [KeyListSignature] so we do that here
    let signatureSet: [Crypto.KeyListSignature] = []
    var totalWeight = 0.0

    var i = 0
    while (i < keyIds.length) {
        let accountKey: AccountKey = account.keys.get(keyIndex: keyIds[i]) ?? panic("Provided key signature does not exist")
        
        let keyWeight = accountKey.weight
        totalWeight = totalWeight + keyWeight

        keyList.add(
            PublicKey(
                publicKey: accountKey.publicKey.publicKey,
                signatureAlgorithm: UInt(accountKey.publicKey.signatureAlgorithm.rawValue) == 2 ? SignatureAlgorithm.ECDSA_secp256k1  : SignatureAlgorithm.ECDSA_P256
            ),
            hashAlgorithm: HashAlgorithm.SHA3_256,
            weight: keyWeight
        )

        var signature = signatures[i]
        signatureSet.append(
            Crypto.KeyListSignature(
                keyIndex: keyIds[i],
                signature: signature.decodeHex()
            )
        )
        i = i + 1
    }

    let signatureValid = keyList.verify(
        signatureSet: signatureSet,
        signedData: message.decodeHex()
    )

    return signatureValid
}
