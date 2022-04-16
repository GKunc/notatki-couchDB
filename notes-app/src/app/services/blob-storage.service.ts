import { Injectable } from '@angular/core';
import { BlobDownloadResponseModel, BlobItem, BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Attachment } from 'src/models/attachment';

@Injectable({
    providedIn: 'root',
})
export class BlobStorageService {

    private async getBlobStorageContainerClient(containerName: string): Promise<ContainerClient> {
        const config = require('../../../config');
        const blobSasUrl = config.blobSasUrl;
        console.log('fromConnectionString')
        const blobServiceClient = new BlobServiceClient(blobSasUrl);
        console.log('fromConnectionString after')
        return blobServiceClient.getContainerClient(containerName);
    }

    async createAttachmentsContainer(noteId: string): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        containerClient.create();
    }

    async deleteAttachmentsContainer(noteId: string): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        await containerClient.delete();
    }

    async uploadAttachement(noteId: string, attachment: Attachment): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        const blockBlobClient = containerClient.getBlockBlobClient(attachment.fileName);
        await blockBlobClient.upload(attachment.content, attachment.content.size);
    }

    async deleteAttachement(noteId: string, attachment: Attachment): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        await containerClient.deleteBlob(attachment.fileName);
    }

    async getAttachment(noteId: string, fileName: string): Promise<Blob> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        try {
            const blob = (await containerClient.getBlobClient(fileName).download()).blobBody;
            if (blob) {
                return blob;
            } else {
                return new Blob();
            }
        } catch (error) {
            alert(`No attachment for note with id: ${noteId} and filename: ${fileName}`)
            throw new Error(`No attachment for note with id: ${noteId} and filename: ${fileName}`);
        }
    }

    async getAttachments(noteId: string): Promise<BlobItem[]> {
        const attachments = [];
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        try {
            let iter = containerClient.listBlobsFlat();
            let blobItem = await iter.next();
            while (!blobItem.done) {
                attachments.push(blobItem.value)
                blobItem = await iter.next();
            }
        } catch (err: any) {
            console.log(err.message);
        }
        return attachments;
    }
}

