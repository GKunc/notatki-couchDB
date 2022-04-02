import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BoardComponent } from './board/board.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoteComponent } from './note/note.component';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NoteEditComponent } from './note-edit/note-edit.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { CouchDbWrapperService } from './services/coach-db-wrapper.service';
import { CookieService } from './services/cookie.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BoardComponent,
    NoteComponent,
    NoteEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    LMarkdownEditorModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  providers: [
    CouchDbWrapperService,
    {
      provide: APP_INITIALIZER,
      useFactory: (cdbs: CouchDbWrapperService) => () => cdbs.init(),
      deps: [CouchDbWrapperService, CookieService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
