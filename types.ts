export type SpeedUnit = 'Mbps' | 'Kbps' | 'MB/s';

export enum TestState {
  IDLE = 'IDLE',
  PING = 'PING',
  DOWNLOAD = 'DOWNLOAD',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface SpeedDataPoint {
  time: number;
  download: number | null;
}

export interface TestResults {
  ping: number;
  download: number;
}
