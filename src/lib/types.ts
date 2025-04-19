
// Type definitions for CloudPlay app

// Video data returned from backend
export interface Video {
  id: string;
  title: string;
  description?: string;
  cloudinaryUrl: string;
  thumbnailUrl?: string;
  duration: number;
  createdAt: string;
}

// User data
export interface User {
  id: string;
  name: string;
  avatar?: string;
}

// Video room data
export interface Room {
  id: string;
  name: string;
  currentVideo: Video | null;
  viewers: number;
  isPrivate: boolean;
  scheduledTime?: string; // ISO date string for when the room's video will go live
}

// WebSocket message types
export enum WsMessageType {
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  VIDEO_PLAY = 'VIDEO_PLAY',
  VIDEO_PAUSE = 'VIDEO_PAUSE',
  VIDEO_SEEK = 'VIDEO_SEEK',
  VIDEO_CHANGE = 'VIDEO_CHANGE',
  SYNC_REQUEST = 'SYNC_REQUEST',
  SYNC_RESPONSE = 'SYNC_RESPONSE',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  ERROR = 'ERROR',
}

// Base WebSocket message interface
export interface WsMessage {
  type: WsMessageType;
  roomId: string;
  senderId: string;
  timestamp: number;
}

// WebSocket message for video control
export interface WsVideoControlMessage extends WsMessage {
  currentTime: number;
  playing: boolean;
}

// WebSocket message for video change
export interface WsVideoChangeMessage extends WsMessage {
  videoId: string;
}

// WebSocket message for sync response
export interface WsSyncResponseMessage extends WsMessage {
  currentTime: number;
  playing: boolean;
  videoId: string;
}

// WebSocket message for chat
export interface WsChatMessage extends WsMessage {
  message: string;
  senderName: string;
}
