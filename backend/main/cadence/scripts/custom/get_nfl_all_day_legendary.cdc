import AllDay from 0xe4cf4bdc1751c65d 

pub fun main(query: String): [UInt64] {
    let editionIDs: [UInt64] = []
    var id: UInt64 = 1

    while id < AllDay.nextEditionID {
		var edition: AllDay.EditionData = AllDay.getEditionData(id: id)

		if edition.tier == query {
			editionIDs.append(edition.id)
		}
        id = id + 1
    }

    return editionIDs 
}
