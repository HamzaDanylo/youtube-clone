import 'express-session' 
import { type SessionMetadata } from './session-matadata.types'

declare module 'express-session' {
    interface SessionData { 
        userId?: string,
        createdAt?: Date | string,
        metadata: SessionMetadata
    }
}