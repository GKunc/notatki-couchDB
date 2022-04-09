import { COUCHDB_DATABASE_URL, COUCHDB_DATABASE_LOCAL_URL } from './../consts';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CouchDbWrapperService } from '../services/coach-db-wrapper.service';
import { CosmosClient } from '@azure/cosmos';
import sha256 from 'crypto-js/sha256';

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

  ngOnInit(): void { }

  async authenticate(): Promise<void> {
    const config = require('../../../config')

    const endpoint = config.endpoint
    const key = config.key

    const databaseId = config.database.id
    const containerId = config.usersContainer.id

    const options = {
      endpoint: endpoint,
      key: key,
      userAgentSuffix: 'CosmosDBJavascriptQuickstart'
    };

    const client = new CosmosClient(options)

    const modalConfig: MatSnackBarConfig = {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['error-notification'],
    };

    this.createDatabase(client, databaseId)
      .then(async () => {
        const hasAccess = await this.findUserInDb(client, databaseId, containerId)
        if (hasAccess) {
          document.cookie = 'Authenticated=true';
          document.cookie = `Login=${this.login.value}`;
          document.cookie = `Password=${this.password.value}`;
          this.dialogRef.close(true);
        } else {
          this.snackBar.open('Login or password is invalid!', 'Dismiss', modalConfig);
        }
      })
      .catch(() => {
        this.snackBar.open('Login or password is invalid!', 'Dismiss', modalConfig);
      });
  }

  getErrorMessage() {
    if (this.login.hasError('required') || this.password.hasError('required')) {
      return 'You must enter a value';
    }
    return '';
  }

  async createDatabase(client: CosmosClient, databaseId: string) {
    const { database } = await client.databases.createIfNotExists({
      id: databaseId
    })
    console.log(`Created database:\n${database.id}\n`)
  }


  async findUserInDb(client: CosmosClient, databaseId: string, containerId: string): Promise<boolean> {
    const { database } = await client.databases.createIfNotExists({
      id: databaseId
    })
    const container = database.container(containerId);

    const querySpec = {
      query: `SELECT * FROM c`
    };

    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    if (items[0].password.toString() === sha256(this.password.value).toString())
      return true;
    return false;
  }
}
