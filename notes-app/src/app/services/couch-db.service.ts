import { Attachment } from './../../models/attachment';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  createNoteCouchDBFromModel,
  createNoteModelFromCouchDB,
  Note,
} from 'src/models/note';
import { CouchDbWrapperService } from './coach-db-wrapper.service';
import { CosmosClient } from '@azure/cosmos';
import { CosmosDbService } from './cosmos-db.service';

@Injectable({
  providedIn: 'root',
})
export class CouchDbService {
  notes: Note[] = [];
  private _notes$: BehaviorSubject<Note[]>;
  public get notes$(): Observable<Note[]> {
    return this._notes$.asObservable();
  }

  constructor(private newService: CouchDbWrapperService) {
    this._notes$ = new BehaviorSubject<Note[]>([]);
    this.newService.listenOnChanges('notes-changes', async () => {
      await this.getAllNotes();
    });
  }

  async getAllNotes(): Promise<Note[]> {
    const cosmosDB = new CosmosDbService();
    const container = await cosmosDB.getCosmosContainer()
    const query = 'SELECT * FROM c'

    const { resources: items } = await container.items.query(query).fetchAll();
    let notes: Note[] = [];

    items.forEach(item => {
      const note = createNoteModelFromCouchDB(item);
      notes.push(note)
    });

    // const db = this.newService.getDatabase();
    // let notes: Note[] = [];
    // const result = await db.allDocs<Note>();
    // const noteIds =
    //   result?.rows.map((row) => {
    //     return row.id;
    //   }) ?? [];
    // for (let i = 0; i < noteIds.length; i++) {
    //   const noteId = noteIds[i];
    //   const noteDB = await db.get<Note>(noteId, {
    //     attachments: true,
    //     binary: true
    //   });
    //   const note = createNoteModelFromCouchDB(noteDB);
    //   if (noteDB?._attachments) {
    //     note.attachments = await this.getAttachments(noteDB?._attachments);
    //   }
    //   notes.push(note);
    // }
    this.notes = notes;
    this._notes$.next(this.notes as Note[]);
    return notes;
  }

  async createNote(note: Note): Promise<void> {
    const cosmosDB = new CosmosDbService();
    const container = await cosmosDB.getCosmosContainer()

    container.items.create(note);

    // await this.addAttachments(note);
    this.notes.push(note);
    this._notes$.next(this.notes as Note[]);
  }

  async deleteNote(noteId: string): Promise<void> {
    const db = this.newService.getDatabase();
    const noteToDelete = await db.get(noteId);
    if (noteToDelete) {
      db.remove(noteToDelete);
      this.notes = this.notes.filter((note) => note.id != noteId);
      this._notes$.next(this.notes as Note[]);
    }
  }

  async updateNote(note: Note): Promise<void> {
    const db = this.newService.getDatabase();
    const noteFromCouchDB = await db.get(note.id);
    let noteToUpdate = createNoteCouchDBFromModel(note);
    noteToUpdate._rev = noteFromCouchDB?._rev;
    await db.put(noteToUpdate);
    await this.addAttachments(note);
    const found = this.notes.find((noteN) => noteN.id === note.id);
    const index = this.notes.findIndex((noteN) => noteN === found);
    if (index !== -1) this.notes[index] = note;
    this._notes$.next(this.notes as Note[]);
  }

  async getAttachments(
    attachments: PouchDB.Core.Attachments
  ): Promise<Attachment[]> {
    const result: Attachment[] = [];
    const attachmentsNames = Object.keys(attachments as Object);

    for (let i = 0; i < attachmentsNames.length; i++) {
      const attachment = attachments[
        attachmentsNames[i]
      ] as PouchDB.Core.FullAttachment;
      result.push({
        fileName: attachmentsNames[i],
        fileType: attachment.content_type,
        content: attachment.data as File,
      });
    }

    return result;
  }

  async addAttachments(note: Note): Promise<void> {
    const db = this.newService.getDatabase();

    for (let i = 0; i < note.attachments.length; i++) {
      const attachment = note.attachments[i];
      const noteFromCouchDB = await db.get(note.id);
      if (noteFromCouchDB)
        await db.putAttachment(
          note.id,
          attachment.fileName,
          noteFromCouchDB._rev,
          attachment.content,
          attachment.fileType
        );
    }
  }

  async removeAttachment(
    noteId: string,
    attachment: Attachment
  ): Promise<void> {
    const db = this.newService.getDatabase();
    const note = await db.get(noteId);
    if (note) {
      await db.removeAttachment(note._id, attachment.fileName, note._rev);

      const foundNote = this.notes.find((note) => note.id === noteId);
      if (foundNote) {
        foundNote.attachments = foundNote.attachments.filter(
          (att) => att.fileName !== attachment.fileName
        );
      }
      this._notes$.next(this.notes as Note[]);
    }
  }
}
