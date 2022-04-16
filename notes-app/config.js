var config = {
    cosmosEndpoint: 'https://cosmosdb-notatki.documents.azure.com:443/',
    cosmosKey: 'oPFHg7FBGyYqTxVxMxS0iWI4amENMCK9k5nIQygubQrYWaCqb9MylP1Usgg10ljblPJo5TDGPSMaLSBNnRkVxQ==',
    cosmos: 'cosmos-key',
    google: 'AIzaSyBovDhHD0ixi4gdkvTuReOsHtTMWj0MZ9M',
    blob: 'blob-storage-connection-string',
    blobConnectionString: 'DefaultEndpointsProtocol=https;AccountName=notatkistorage;AccountKey=LS5Hf+1piYwdmECeLsh4jK3CES54Pjl37hmAmZ2QLyfwANdtrUr/J42qIhLSHG3FTe5o6ks/I6w7+AStFTAk1A==;EndpointSuffix=core.windows.net',
    blobSasUrl: 'https://notatkistorage.blob.core.windows.net/?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-11-05T00:27:15Z&st=2022-04-16T15:27:15Z&sip=0.0.0.0-255.255.255.255&spr=https,http&sig=WUJsIKXPwuBhEKIQpzsOJ%2Fo7ZSE2%2FoseTkm6IkeaQyg%3D',
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
