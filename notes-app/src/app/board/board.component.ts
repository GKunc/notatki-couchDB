import { NoteEditComponent } from './../note-edit/note-edit.component';
import { CookieService } from './../services/cookie.service';
import { CouchDbService } from './../services/couch-db.service';
import { LoginComponent } from './../login/login.component';
import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Note } from 'src/models/note';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  private notes: Note[] = [];
  filteredNotes: Note[] = [];
  loading: boolean = true;
  authenticated: boolean = false;
  loginDialogRef: MatDialogRef<LoginComponent> | undefined;
  noteDialogRef: MatDialogRef<NoteEditComponent> | undefined;
  filterTags: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public couchDb: CouchDbService,
    private cookieService: CookieService
  ) {
    this.couchDb.notes$.subscribe((notes) => {
      this.notes = notes;
      this.filterNotes();
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.cookieService.getCookie('Authenticated') === 'true') {
      this.authenticated = true;
      this.loading = false;
      await this.couchDb.getAllNotes();
    } else {
      this.loginDialogRef = this.dialog.open(LoginComponent, {});
      const config: MatSnackBarConfig = {
        duration: 3000,
        verticalPosition: 'top',
      };

      this.loginDialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          config.panelClass = ['success-notification'];
          this.loading = false;
          this.snackBar.open('Succesfully logged in!', 'Dismiss', config);
          await this.couchDb.getAllNotes();
        }
      });
    }
  }

  async createNote(color: string): Promise<void> {
    const note = new Note();
    note.color = color;
    const config: MatDialogConfig = {
      height: '650px',
      width: '700px',
      data: { note: note, isNewNote: true },
    };

    this.noteDialogRef = this.dialog.open(NoteEditComponent, config);
  }

  addFilter(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.filterTags.push(value);
    }
    this.filterNotes();
    event.chipInput!.clear();
  }

  removeFilter(filter: string): void {
    const index = this.filterTags.indexOf(filter);
    if (index >= 0) {
      this.filterTags.splice(index, 1);
      this.filterNotes();
    }
  }

  filterNotes(): void {
    if (this.filterTags.length > 0) {
      this.filteredNotes = this.notes?.filter((note) =>
        note.hashtags.some((item) => this.filterTags.includes(item))
      );
    } else {
      this.filteredNotes = this.notes;
    }
  }
}
