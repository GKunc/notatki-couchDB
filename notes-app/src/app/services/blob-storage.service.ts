import { Injectable } from '@angular/core';
import { BlobItem, BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Attachment } from 'src/models/attachment';
import { Note } from 'src/models/note';

@Injectable({
    providedIn: 'root',
})
export class BlobStorageService {

    private async getBlobStorageContainerClient(containerName: string): Promise<ContainerClient> {
        const config = require('../../../config');
        const blobSasUrl = config.blobSasUrl;
        const blobServiceClient = new BlobServiceClient(blobSasUrl);
        return blobServiceClient.getContainerClient(containerName);
    }

    async createAttachmentsContainer(noteId: string): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        containerClient.createIfNotExists();
    }

    async deleteAttachmentsContainer(noteId: string): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        await containerClient.delete();
    }

    async uploadAttachement(noteId: string, attachment: Attachment): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        const blockBlobClient = containerClient.getBlockBlobClient(attachment.fileName);
        await blockBlobClient.uploadData(attachment.content);
    }

    async updateAttachmets(note: Note): Promise<void> {
        const attachmentsFromDb = await this.getAttachments(note.id);
        const attachmentsToDelete: BlobItem[] = attachmentsFromDb;
        for (let i = 0; i < note.attachments.length; i++) {
            const attachment = note.attachments[i];
            const result = attachmentsFromDb.find(attachmentFromDb => {
                return attachmentFromDb.name == attachment.fileName
            })

            if (result) {
                attachmentsToDelete.filter(item => item.name !== attachment.fileName);
                continue;
            }

            else if (!result) {
                attachmentsToDelete.filter(item => item.name !== attachment.fileName);
                await this.uploadAttachement(note.id, attachment);
                continue;
            }
        }

        for (let i = 0; i < attachmentsToDelete.length; i++) {
            await this.deleteAttachement(note.id, attachmentsToDelete[i].name);

        }
    }


    async deleteAttachement(noteId: string, attachmentName: string): Promise<void> {
        const containerClient = await this.getBlobStorageContainerClient(noteId);
        await containerClient.deleteBlob(attachmentName);
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
            console.error("err.message: " + err.message);
        }
        return attachments;
    }
}

