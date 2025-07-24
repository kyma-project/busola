export enum Author {
  USER = 'user',
  AI = 'ai',
}

export enum ErrorType {
  FATAL,
  RETRYABLE,
}

export interface ErrResponse {
  type: ErrorType;
  message: string;
  statusCode?: number;
  attempt?: number;
  maxAttempts?: number;
  title?: string;
}

export interface MessageChunk {
  event?: string;
  data: {
    agent?: string;
    answer: {
      content: string;
      tasks?: {
        task_id: number;
        task_name: string;
        status: string;
        agent: string;
      }[];
      next: string;
      is_feedback?: boolean;
    };
    error?: string | null;
  };
}

export interface Message {
  author: Author;
  messageChunks: MessageChunk[];
  isLoading: boolean;
  suggestions?: string[];
  suggestionsLoading?: boolean;
  hasError?: boolean;
  isFeedback?: boolean;
}

export interface ChatGroup {
  context?: {
    labelText: string;
  };
  messages: Message[];
}
