var config = {}

config.endpoint = 'https://cosmosdb-notatki.documents.azure.com:443/'
config.key = 'oPFHg7FBGyYqTxVxMxS0iWI4amENMCK9k5nIQygubQrYWaCqb9MylP1Usgg10ljblPJo5TDGPSMaLSBNnRkVxQ=='

config.database = {
    id: 'notes_app'
}

config.usersContainer = {
    id: 'users'
}

config.notesContainer = {
    id: 'notes'
}

module.exports = config
