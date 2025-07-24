export enum Author {
  USER = 'user',
  AI = 'ai',
}

export interface AIError {
  title?: string;
  message: string | null;
  displayRetry: boolean;
}

export class HttpError extends Error {
  statusCode: number;
  title: string;

  constructor(statusCode: number, title: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.title = title;
  }
}

export enum HTTPStatus {
  RATE_LIMIT_CODE = 429,
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
  partialAIFailure?: boolean;
  hasError?: boolean;
  isFeedback?: boolean;
}

export interface ChatGroup {
  context?: {
    labelText: string;
  };
  messages: Message[];
}
