import { Attachment } from './../../models/attachment';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MdEditorOption } from 'ngx-markdown-editor';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from 'src/models/note';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NotesService } from '../services/notes.service';

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent implements OnInit {
  isNewNote: boolean = true;
  note: Note;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  titleControl: FormControl = new FormControl('', [Validators.required, Validators.required]);
  public mode: string = "editor";
  public options: MdEditorOption = {
    showPreviewPanel: false,
    enablePreviewContentClick: false,
    resizable: false
  };

  constructor(
    public dialogRef: MatDialogRef<NoteEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { note: Note, isNewNote: boolean },
    private notesService: NotesService,
  ) {
    this.note = data.note;
    this.isNewNote = data.isNewNote;
    this.dialogRef.disableClose = true;

    this.titleControl = new FormControl(this.note.title, [Validators.required, Validators.required]);
    this.preRender = this.preRender.bind(this);
    this.postRender = this.postRender.bind(this);
  }

  ngOnInit(): void {
  }

  removeHashtag(hashtag: string): void {
    const index = this.note.hashtags.indexOf(hashtag);

    if (index >= 0) {
      this.note.hashtags.splice(index, 1);
    }
  }

  addHashtag(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.note.hashtags.push(value);
    }
    event.chipInput!.clear();
  }

  addNote(): void {
    this.note.title = this.titleControl.value;
    const files: File[] = (document.querySelector('input[type=file]') as any).files;
    const attachments: Attachment[] = [];
    Array.from(files).forEach(file => {
      attachments.push({ fileName: file.name, fileType: file.type, content: file });
    });
    this.note.attachments = attachments;
    this.notesService.createNote(this.note);
    this.dialogRef.close(true);
  }

  async updateNote(): Promise<void> {
    const files: File[] = (document.querySelector('input[type=file]') as any).files;
    const attachments: Attachment[] = this.note.attachments;
    Array.from(files).forEach(file => {
      attachments.push({ fileName: file.name, fileType: file.type, content: file })
    });

    const note: Note = {
      id: this.note.id,
      color: this.note.color,
      title: this.titleControl.value,
      content: this.note.content,
      date: this.note.date,
      favourite: this.note.favourite,
      attachments: attachments,
      hashtags: this.note.hashtags
    };

    this.dialogRef.close(true);
    await this.notesService.updateNote(note);
  }

  closeUpdate(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage() {
    if (this.titleControl.hasError('required') || this.note.content === '') {
      return 'You must enter a value';
    }
    return '';
  }


  togglePreviewPanel() {
    this.options.showPreviewPanel = !this.options.showPreviewPanel;
    this.options = Object.assign({}, this.options);
  }

  changeMode() {
    if (this.mode === "editor") {
      this.mode = "preview";
    } else {
      this.mode = "editor";
    }
  }

  togglePreviewClick() {
    this.options.enablePreviewContentClick = !this.options
      .enablePreviewContentClick;
    this.options = Object.assign({}, this.options);
  }

  toggleResizeAble() {
    this.options.resizable = !this.options.resizable;
    this.options = Object.assign({}, this.options);
  }

  preRender(content: string) {
    return content;
  }

  postRender(content: string) {
    return content;
  }
}
