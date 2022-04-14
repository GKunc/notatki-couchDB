var config = {
    cosmosEndpoint: 'https://cosmosdb-notatki.documents.azure.com:443/',
    cosmosKey: 'oPFHg7FBGyYqTxVxMxS0iWI4amENMCK9k5nIQygubQrYWaCqb9MylP1Usgg10ljblPJo5TDGPSMaLSBNnRkVxQ==',
    blobConnectionString: 'DefaultEndpointsProtocol=https;AccountName=notatkistorage;AccountKey=LS5Hf+1piYwdmECeLsh4jK3CES54Pjl37hmAmZ2QLyfwANdtrUr/J42qIhLSHG3FTe5o6ks/I6w7+AStFTAk1A==;EndpointSuffix=core.windows.net',
    blobContainerName: 'attachements',
    database: {
        id: 'notes_app'
    },

    usersContainer: {
        id: 'users'
    },

    notesContainer: {
        id: 'notes'
    }
}

module.exports = config
