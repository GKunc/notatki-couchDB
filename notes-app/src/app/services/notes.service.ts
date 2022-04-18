import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from 'src/models/note';
import { CosmosDbService } from './cosmos-db.service';
import { BlobStorageService } from './blob-storage.service';

@Injectable({
    providedIn: 'root',
})
export class NotesService {
    notes: Note[] = [];
    private _notes$: BehaviorSubject<Note[]>;
    public get notes$(): Observable<Note[]> {
        return this._notes$.asObservable();
    }

    constructor(private cosmosDbService: CosmosDbService, private blobStorageService: BlobStorageService) {
        this._notes$ = new BehaviorSubject<Note[]>([]);
    }

    async getAllNotes(): Promise<Note[]> {
        const items = await this.cosmosDbService.getAllNotes();
        this.notes = items;
        this._notes$.next(this.notes as Note[]);
        return this.notes;
    }

    async createNote(note: Note): Promise<void> {
        const uploadPromises = [];

        this.notes.push(note);
        this._notes$.next(this.notes as Note[]);

        uploadPromises.push(this.cosmosDbService.createNote(note));
        await this.blobStorageService.createAttachmentsContainer(note.id);
        note.attachments.forEach(attachment => {
            uploadPromises.push(this.blobStorageService.uploadAttachement(note.id, attachment));
        });
        Promise.all(uploadPromises);
    }

    async deleteNote(noteId: string): Promise<void> {
        this.notes = this.notes.filter((note) => note.id != noteId);
        this._notes$.next(this.notes as Note[]);

        await this.cosmosDbService.deleteNote(noteId);
        await this.blobStorageService.deleteAttachmentsContainer(noteId);
    }

    async updateNote(note: Note): Promise<void> {
        const index = this.notes.findIndex((noteN) => noteN.id === note.id);
        if (index !== -1) {
            this.notes[index] = note;
        }
        this._notes$.next(this.notes as Note[]);

        await this.cosmosDbService.updateNote(note);
        await this.blobStorageService.updateAttachmets(note);
    }

    async deleteAttachment(note: Note, attachmentName: string): Promise<void> {
        await this.cosmosDbService.updateNote(note);
        await this.blobStorageService.deleteAttachement(note.id, attachmentName);
    }

    async downloadAttachment(noteId: string, fileName: string): Promise<Blob> {
        return this.blobStorageService.getAttachment(noteId, fileName);
    }
}
