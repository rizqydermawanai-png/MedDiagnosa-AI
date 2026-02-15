export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[]; // Array of Base64 data URLs
  timestamp: Date;
  isThinking?: boolean;
}

export interface Specialist {
  id: string;
  name: string; // e.g., "Dokter Umum", "Spesialis Jantung"
  description: string;
  icon: string;
  systemPrompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  CHATTING = 'CHATTING',
  ERROR = 'ERROR'
}