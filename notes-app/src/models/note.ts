import { Attachment } from './attachment';
import { v4 as uuid } from 'uuid';

export class Note {
  id: string = `new-note-${uuid()}`;
  title: string = '';
  content: string = '';
  date: Date = new Date();
  favourite: boolean = false;
  color: string = '';
  attachments: Attachment[] = [];
  hashtags: string[] = [];
}

export function createNoteModelFromCouchDB(note: Note | undefined): Note {
  return {
    id: note?.id ?? 'empty',
    title: note?.title ?? '',
    content: note?.content ?? '',
    date: note?.date ?? new Date(),
    favourite: note?.favourite ?? false,
    color: note?.color ?? '',
    attachments: note?.attachments ?? [],
    hashtags: note?.hashtags ?? []
  }
}

export function createNoteCouchDBFromModel(note: Note): any {
  return {
    "id": note?.id ?? 'empty',
    "title": note?.title ?? '',
    "content": note?.content ?? '',
    "date": note?.date ?? new Date(),
    "favourite": note?.favourite ?? false,
    "color": note?.color ?? '',
    "hashtags": note?.hashtags ?? []
  }
}
