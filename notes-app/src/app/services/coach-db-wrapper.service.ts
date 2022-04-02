import { Injectable, OnDestroy } from '@angular/core';
import PouchDB from 'pouchdb';
import { CookieService } from './cookie.service';
import { POUCHDB_DATABASE_URL, COUCHDB_DATABASE_LOCAL_URL } from '../consts';

@Injectable({
  providedIn: 'root',
})
export class CouchDbWrapperService implements OnDestroy {
  private localDb: PouchDB.Database | null = null;
  private serverDb: PouchDB.Database | null = null;
  private syncHandler: PouchDB.Replication.Sync<{}> | null = null;
  private changesListeners: { [key: string]: () => Promise<void> } = {};
  constructor(private cookieService: CookieService) {}

  listenOnChanges(subName: string, listener: () => Promise<void>) {
    this.changesListeners[subName] = listener;
  }

  public getDatabase() {
    return this.localDb!;
  }

  public init(): Promise<any> {
    this.localDb = new PouchDB(POUCHDB_DATABASE_URL, {});

    this.listenToChanges();

    const { login, password, logged } = this.getCredentials();
    if (logged) {
      this.connectToRemoteDb(login, password);
    }

    return Promise.resolve();
  }

  public verifyConnection(login: string, password: string): Promise<boolean> {
    const db = new PouchDB(COUCHDB_DATABASE_LOCAL_URL, {
      auth: {
        username: login,
        password: password,
      },
    });
    return db.put(this.getTestNote()).then(() => {
      return db.get('test-note').then((doc) => {
        return db.remove(doc).then(() => {
          return true;
        });
      });
    });
  }

  public connectToRemoteDb(login: string, password: string): any {
    this.serverDb = new PouchDB(COUCHDB_DATABASE_LOCAL_URL, {
      auth: {
        username: login,
        password: password,
      },
    });

    this.syncDatabases();
  }

  private getTestNote() {
    return {
      _id: 'test-note',
      title: 'Test',
      content: 'Test',
      date: new Date(),
      favourite: '',
      color: 'blue',
    };
  }

  private syncDatabases() {
    if (!this.localDb || !this.serverDb) {
      return;
    }

    this.syncHandler = this.localDb
      .sync(this.serverDb, {
        live: true,
        retry: true,
      })
      .on('error', (err) => {
        console.log('Error occuried: ', err);
      });
  }

  private listenToChanges() {
    this.localDb!.changes({
      since: 'now',
      live: true,
      include_docs: false,
    }).on('change', (change) => {
      Object.entries(this.changesListeners).forEach(async ([key, val]) => {
        await val();
      });
    });
  }

  private getCredentials(): {
    login: string;
    password: string;
    logged: boolean;
  } {
    let login = '';
    let password = '';
    let logged = false;

    if (this.cookieService.getCookie('Authenticated')) {
      login = this.cookieService.getCookie('Login');
      password = this.cookieService.getCookie('Password');
      logged = true;
    }

    return { login, password, logged };
  }

  ngOnDestroy(): void {
    this.syncHandler?.cancel();
  }
}
