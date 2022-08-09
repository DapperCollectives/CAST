import Crypto

pub fun main(
  address: Address,
  keyIds: [Int],
  signatures: [String],
  message: String
): Bool {
  let keyList = Crypto.KeyList()
  
  let account = getAccount(address)
  let keys = account.keys
  let messageBytes = message.utf8
  var i = 0
  var totalWeight = 0.0
  while i < keyIds.length {
    if let key = keys.get(keyIndex: keyIds[i]) {
      let signature = signatures[i]
      let signatureBytes = signature.decodeHex()
      if key.isRevoked {
        // do not check revoked keys
        i = i + 1
        continue
      }
      let pk = PublicKey(
          publicKey: key.publicKey.publicKey,
          signatureAlgorithm: key.publicKey.signatureAlgorithm
      )
      if pk.verify(
        signature: signatureBytes,
        signedData: messageBytes,
        domainSeparationTag: "FLOW-V0.0-transaction",
        hashAlgorithm: key.hashAlgorithm
      ) {
        // this key is good, add weight to total weight
        totalWeight = totalWeight + key.weight
        if totalWeight >= 999.0 {
            return true
        }
      }
    } else {
      // checked all the keys, none of them match
      return false
    }
    i = i + 1
  }
  return false
}