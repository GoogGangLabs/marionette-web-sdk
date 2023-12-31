const EventState = {
  LOAD_STREAM: 'LOAD_STREAM',
  ICE_CANDIDATE_TYPE: 'ICE_CANDIDATE_TYPE',
  CONNECTION_STATE: 'CONNECTION_STATE',
  BLENDSHAPE_EVENT: 'BLENDSHAPE_EVENT',
  SESSION_USER_EVENT: 'SESSION_USER_EVENT',
  SESSION_ROOM_EVENT: 'SESSION_ROOM_EVENT',
  SESSION_CHAT_EVENT: 'SESSION_CHAT_EVENT',
  SESSION_SYSTEM_EVENT: 'SESSION_SYSTEM_EVENT',
  SESSION_OBJECT_EVENT: 'SESSION_OBJECT_EVENT',
  ERROR: 'ERROR',
} as const;
type EventState = (typeof EventState)[keyof typeof EventState];

const ErrorMessage = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
type ErrorMessage = (typeof ErrorMessage)[keyof typeof ErrorMessage];

const GuardFlag = {
  INIT: 1,
  STREAM: 1 << 1,
  PEER_CONNECTION: 1 << 2,
};
type GuardFlag = (typeof GuardFlag)[keyof typeof GuardFlag];

export { ErrorMessage, EventState, GuardFlag };
