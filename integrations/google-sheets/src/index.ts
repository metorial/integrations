import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSpreadsheet,
  getSpreadsheet,
  updateSpreadsheet,
  deleteSpreadsheet,
  readCells,
  writeCells,
  clearCells,
  manageSheets,
  formatCells,
  batchUpdate,
  createChart,
  createPivotTable,
  setDataValidation,
  manageProtectedRanges,
  manageNamedRanges,
  createFilterView,
  mergeCells,
} from './tools';
import { spreadsheetChanged } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSpreadsheet,
    getSpreadsheet,
    updateSpreadsheet,
    deleteSpreadsheet,
    readCells,
    writeCells,
    clearCells,
    manageSheets,
    formatCells,
    batchUpdate,
    createChart,
    createPivotTable,
    setDataValidation,
    manageProtectedRanges,
    manageNamedRanges,
    createFilterView,
    mergeCells,
  ],
  triggers: [
    spreadsheetChanged,
  ],
});
