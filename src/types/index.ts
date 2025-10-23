// User types
export interface User {
  _id: string
  provider: string
  provider_id: string
  email?: string
  display_name?: string
  photo_url?: string
  country_code?: string
  dj_mode?: boolean
  role?: string[]
  created_at?: string
  updated_at?: string
}

// Log types
export interface Log {
  _id: string
  level: string
  message: string
  timestamp: string
  meta?: Record<string, any>
  userId?: string
  path?: string
  method?: string
  statusCode?: number
  durationMs?: number
}

// Statistics types
export interface Statistics {
  totals: {
    users: number
    tracks: number
    interactions: number
    likes: number
    dislikes: number
  }
  last24Hours: {
    newUsers: number
    newTracks: number
    newInteractions: number
  }
}

export interface UserGrowth {
  date: string
  newUsers: number
}

export interface TrackInteraction {
  date: string
  likes: number
  dislikes: number
  total: number
}

export interface TrackData {
  date: string
  newTracks: number
}

// Health types
export interface Health {
  status: string
  timestamp: string
  mongodb: {
    status: string
    connected: boolean
    databaseSize: number
    collections: Record<string, number>
  }
  redis: {
    status: string
    connected: boolean
    memoryUsed: number
    memoryTotal: number
    keyCount: number
    uptime: number
  }
}

// Time range options
export type TimeRange = '24h' | '7d' | '30d' | '90d'

export const TIME_RANGE_OPTIONS = [
  { label: 'Last 24 hours', value: '24h' as TimeRange },
  { label: 'Last 7 days', value: '7d' as TimeRange },
  { label: 'Last 30 days', value: '30d' as TimeRange },
  { label: 'Last 90 days', value: '90d' as TimeRange }
]
