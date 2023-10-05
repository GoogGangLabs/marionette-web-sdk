import { EventEmitter } from 'events';
import { MetadataType, SystemEventType, TargetType, UserRole, UserState } from './enum';

export type PeerType = 'stream' | 'data' | 'metadata';

export interface ICECredential {
  username: string;
  credential: string;
  iceHost: string;
}

export interface MarionetteConstraint {
  event: EventEmitter;
  host: string;
  token: string;
  iceCredential: ICECredential;
}

export interface MarionetteConfigurations {
  token: string;
  roomId?: string;
  nickname?: string;
}

export interface StreamConfigurations {
  deviceId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
}

export type BlendshapeResult = number[];

export interface OptimizationSessionList {
  data: Uint8Array[];
}

export interface OptimizationSession {
  sessionId: string;
  roomId: string;
  // fps: number; todo
  sequence: number;
  optimizedValue: number;
  results: Buffer;
  blendshapes?: BlendshapeResult;
}

export class FetchConfigurations<T> {
  host: string;
  method?: 'GET' | 'POST' | 'PATCH';
  body?: T;
}

export interface IceCredentialResponse {
  sessionId: string;
  username: string;
  credential: string;
  iceHost: string;
}

export interface SignalingRequest {
  roomId: string;
  nickname: string;
  streamSdp: string;
  dataSdp: string;
  metadataSdp: string;
}

export interface SignalingResponse {
  streamSdp: string;
  dataSdp: string;
  metadataSdp: string;
}

export class MetadataTemplate {
  type?: MetadataType;
  targetType?: TargetType;
  source: string;
  target?: string[];
  timestamp?: number;
  user?: UserTemplate;
  room?: RoomTemplate;
  chat?: ChatTemplate;
  system?: SystemTemplate;
  object?: string;
}

export class UserTemplate {
  sessionId: string;
  nickname?: string;
  role: UserRole;
  state: UserState;
}

export class RoomTemplate {
  roomId: string;
  ownerId: string;
  name: string;
  timestamp: number;
  maxCount: number;
  userList: UserTemplate[];
}

export class ChatTemplate {
  message: string;
}

export class SystemTemplate {
  type: SystemEventType;
  source: string;
  message: string;
}
