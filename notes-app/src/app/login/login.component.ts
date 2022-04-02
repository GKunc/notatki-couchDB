import { COUCHDB_DATABASE_URL, COUCHDB_DATABASE_LOCAL_URL } from './../consts';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CouchDbWrapperService } from '../services/coach-db-wrapper.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  remoteDatebase: PouchDB.Database | undefined;
  login = new FormControl('', [Validators.required, Validators.required]);
  password = new FormControl('', [Validators.required, Validators.required]);
  hidePassword = true;

  constructor(
    private couchDbService: CouchDbWrapperService,
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public model: any,
    public snackBar: MatSnackBar
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {}

  async authenticate(): Promise<void> {
    this.couchDbService
      .verifyConnection(this.login.value, this.password.value)
      .then(() =>
        this.couchDbService.connectToRemoteDb(
          this.login.value,
          this.password.value
        )
      )
      .then(() => {
        document.cookie = 'Authenticated=true';
        document.cookie = `Login=${this.login.value}`;
        document.cookie = `Password=${this.password.value}`;
        this.dialogRef.close(true);
      })
      .catch(() => {
        const config: MatSnackBarConfig = {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['error-notification'],
        };
        this.snackBar.open('Login or password is invalid!', 'Dismiss', config);
      });
  }

  getErrorMessage() {
    if (this.login.hasError('required') || this.password.hasError('required')) {
      return 'You must enter a value';
    }
    return '';
  }
}
