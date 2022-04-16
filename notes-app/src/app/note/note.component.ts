import { Attachment } from './../../models/attachment';
import { Note } from './../../models/note';
import { NoteEditComponent } from './../note-edit/note-edit.component';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { NotesService } from '../services/notes.service';

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {
  @Input() id: string = '';
  @Input() color: string = '';
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() date: Date = new Date();
  @Input() favourite: boolean = false;
  @Input() attachments: Attachment[] = [];
  @Input() hashtags: string[] = [];

  class: string = '';
  dialogRef: MatDialogRef<NoteEditComponent> | undefined;

  constructor(public notesService: NotesService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.class = `note-${this.color}`;
  }

  async toggleFavourite(): Promise<void> {
    this.favourite = !this.favourite;

    const note = this.createCurrentNoteModel();
  }

  getFavouriteStyle(): string {
    if (this.favourite) return 'yellow';
    return 'white'
  }

  async deleteNote(): Promise<void> {
    await this.notesService.deleteNote(this.id);
  }

  async updateNote(): Promise<void> {
    const note = this.createCurrentNoteModel();

    const config: MatDialogConfig = {
      height: '570px',
      width: '700px',
      data: { note: note, isNewNote: false }
    }

    this.dialogRef = this.dialog.open(NoteEditComponent, config);
  }

  async downloadAttachment(event: any): Promise<void> {
    console.log("Note ID: " + this.id)
    const clickedAttachment = this.attachments.find(attachment => attachment.fileName === (event.target.innerText as string).split(/\r\n|\n\r|\n|\r/)[0]);
    const attachment = await this.notesService.downloadAttachment(this.id, clickedAttachment!.fileName);

    if (attachment) {
      const data = attachment;
      const fileName = clickedAttachment!.fileName;
      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0);
    }
  }

  removeAttachment(attachment: Attachment): void {
    // this.blobStorage.deleteAttachement(this.id, attachment);
    const index = this.attachments.indexOf(attachment);
    if (index >= 0) {
      this.attachments.splice(index, 1);
    }
  }

  private createCurrentNoteModel(): Note {
    return {
      id: this.id,
      color: this.color,
      title: this.title,
      content: this.content,
      date: this.date,
      favourite: this.favourite,
      attachments: this.attachments,
      hashtags: this.hashtags
    };
  }
}
