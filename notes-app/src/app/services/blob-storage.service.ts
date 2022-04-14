import { Injectable } from '@angular/core';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable({
    providedIn: 'root',
})
export class BlobStorageService {
    async getBlobStorageContainerClient(): Promise<ContainerClient> {
        const config = require('../../../config');
        const blobConnectionString = config.blobConnectionString;
        const containerName = config.blobContainerName;

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            blobConnectionString
        );

        return blobServiceClient.getContainerClient(containerName);
    }

    async uploadAttachement(attachment: File): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient();
        const blockBlobClient = containerClient.getBlockBlobClient(attachment.name);
        await blockBlobClient.upload(attachment, attachment.size);
    }

    async deleteAttachement(attachment: File): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient();
        const blockBlobClient = containerClient.getBlockBlobClient(attachment.name);
        await containerClient.deleteBlob(attachment.name);
    }

}

