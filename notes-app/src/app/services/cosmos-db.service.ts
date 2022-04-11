import { Injectable } from '@angular/core';
import { Container, CosmosClient } from '@azure/cosmos';

@Injectable({
    providedIn: 'root',
})
export class CosmosDbService {
    async getCosmosContainer(): Promise<Container> {
        const config = require('../../../config')
        const endpoint = config.endpoint
        const key = config.key

        const databaseId = config.database.id
        const containerId = config.notesContainer.id

        const options = {
            endpoint: endpoint,
            key: key,
            userAgentSuffix: 'CosmosDBNotes'
        };

        const client = new CosmosClient(options)

        return client
            .database(databaseId)
            .container(containerId);
    }
}

