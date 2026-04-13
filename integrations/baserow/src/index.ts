import { Slate } from 'slates';
import { spec } from './spec';
import { listRows, getRow, createRows, updateRows, deleteRows, listTables, listFields, listViews, listDatabases, manageField, uploadFile } from './tools';
import { tableEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRows,
    getRow,
    createRows,
    updateRows,
    deleteRows,
    listTables,
    listFields,
    listViews,
    listDatabases,
    manageField,
    uploadFile
  ],
  triggers: [
    tableEvents
  ]
});
