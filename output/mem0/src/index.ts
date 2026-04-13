import { Slate } from 'slates';
import { spec } from './spec';
import { addMemory, searchMemories, getMemory, listMemories, updateMemory, deleteMemory, listEntities, deleteEntity } from './tools';
import { memoryEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [addMemory, searchMemories, getMemory, listMemories, updateMemory, deleteMemory, listEntities, deleteEntity],
  triggers: [memoryEvents],
});
