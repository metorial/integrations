import { Slate } from 'slates';
import { spec } from './spec';
import {
  getProfile,
  listRooms,
  getRoom,
  createRoom,
  updateRoom,
  leaveOrDeleteRoom,
  manageRoomMembers,
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  markMessages,
  createTask,
  getTasks,
  updateTaskStatus,
  getContacts,
  handleContactRequest,
  getFiles
} from './tools';
import { messageEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getProfile,
    listRooms,
    getRoom,
    createRoom,
    updateRoom,
    leaveOrDeleteRoom,
    manageRoomMembers,
    sendMessage,
    getMessages,
    editMessage,
    deleteMessage,
    markMessages,
    createTask,
    getTasks,
    updateTaskStatus,
    getContacts,
    handleContactRequest,
    getFiles
  ],
  triggers: [
    messageEvent
  ]
});
