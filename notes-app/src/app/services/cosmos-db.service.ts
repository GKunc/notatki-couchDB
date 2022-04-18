import { Injectable } from '@angular/core';
import { Container, CosmosClient } from '@azure/cosmos';
import { createNoteModelFromCouchDB, Note } from 'src/models/note';

@Injectable({
    providedIn: 'root',
})
export class CosmosDbService {
    async getCosmosContainer(): Promise<Container> {
        const config = require('../../../config')
        const cosmosEndpoint = config.cosmosEndpoint
        const cosmosKey = config.cosmosKey

        const databaseId = config.database.id
        const containerId = config.notesContainer.id

        const options = {
            endpoint: cosmosEndpoint,
            key: cosmosKey,
            userAgentSuffix: 'CosmosDBNotes'
        };

        const client = new CosmosClient(options)

        return client
            .database(databaseId)
            .container(containerId);
    }

    async getAllNotes() {
        const cosmosDB = new CosmosDbService();
        const container = await cosmosDB.getCosmosContainer();

        const query = 'SELECT * FROM c'

        const { resources: items } = await container.items.query(query).fetchAll();
        let notes: Note[] = [];

        items.forEach(item => {
            const note = createNoteModelFromCouchDB(item);
            notes.push(note)
        });

        return notes;
    }

    async createNote(note: Note): Promise<void> {
        const cosmosDB = new CosmosDbService();
        const container = await cosmosDB.getCosmosContainer()

        container.items.create(note);
    }

    async deleteNote(noteId: string): Promise<void> {
        const cosmosDB = new CosmosDbService();
        const container = await cosmosDB.getCosmosContainer()
        await container.item(noteId, noteId).delete();
    }

    async updateNote(note: Note): Promise<void> {
        const cosmosDB = new CosmosDbService();
        const container = await cosmosDB.getCosmosContainer();
        container.item(note.id, note.id).replace(note);
    }
}

