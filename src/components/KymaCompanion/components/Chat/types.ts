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
}

export interface ChatGroup {
  context?: {
    labelText: string;
  };
  messages: Message[];
}

// Helper functions for managing grouped chat state
export const chatGroupHelpers = {
  // Add a new message to the latest group (or create a new group if context changed)
  addMessage: (
    groups: ChatGroup[],
    message: Message,
    currentContext?: string,
  ): ChatGroup[] => {
    const newGroups = [...groups];

    // If no groups exist yet, create the first one
    if (newGroups.length === 0) {
      return [
        {
          context: currentContext ? { labelText: currentContext } : undefined,
          messages: [message],
        },
      ];
    }

    const lastGroup = newGroups[newGroups.length - 1];

    // If context hasn't changed, add to the last group
    if (
      lastGroup.context?.labelText === currentContext ||
      (!lastGroup.context && !currentContext)
    ) {
      return [
        ...newGroups.slice(0, -1),
        {
          ...lastGroup,
          messages: [...lastGroup.messages, message],
        },
      ];
    }

    // Context has changed, create a new group
    return [
      ...newGroups,
      {
        context: currentContext ? { labelText: currentContext } : undefined,
        messages: [message],
      },
    ];
  },

  // Update the latest message in the latest group
  updateLatestMessage: (
    groups: ChatGroup[],
    updates: Partial<Message>,
  ): ChatGroup[] => {
    if (groups.length === 0) return groups;

    const newGroups = [...groups];
    const lastGroup = newGroups[newGroups.length - 1];

    if (lastGroup.messages.length === 0) return groups;

    const updatedMessages = [...lastGroup.messages];
    updatedMessages[updatedMessages.length - 1] = {
      ...updatedMessages[updatedMessages.length - 1],
      ...updates,
    };

    newGroups[newGroups.length - 1] = {
      ...lastGroup,
      messages: updatedMessages,
    };

    return newGroups;
  },

  // Concat a message chunk to the latest message
  concatMsgToLatestMessage: (
    groups: ChatGroup[],
    response: MessageChunk,
    isLoading: boolean,
  ): ChatGroup[] => {
    if (groups.length === 0) return groups;

    const newGroups = [...groups];
    const lastGroup = newGroups[newGroups.length - 1];

    if (lastGroup.messages.length === 0) return groups;

    const updatedMessages = [...lastGroup.messages];
    const lastMessage = updatedMessages[updatedMessages.length - 1];

    updatedMessages[updatedMessages.length - 1] = {
      ...lastMessage,
      messageChunks: [...lastMessage.messageChunks, response],
      isLoading,
    };

    newGroups[newGroups.length - 1] = {
      ...lastGroup,
      messages: updatedMessages,
    };

    return newGroups;
  },

  // Remove the last message (from any group)
  removeLastMessage: (groups: ChatGroup[]): ChatGroup[] => {
    if (groups.length === 0) return groups;

    const newGroups = [...groups];
    const lastGroupIndex = newGroups.length - 1;
    const lastGroup = newGroups[lastGroupIndex];

    if (lastGroup.messages.length === 0) return groups;

    const updatedMessages = lastGroup.messages.slice(0, -1);

    // If the group becomes empty, remove it
    if (updatedMessages.length === 0) {
      return newGroups.slice(0, -1);
    }

    newGroups[lastGroupIndex] = {
      ...lastGroup,
      messages: updatedMessages,
    };

    return newGroups;
  },

  // Set error on the last user message across all groups
  setErrorOnLastUserMsg: (groups: ChatGroup[]): ChatGroup[] => {
    const newGroups = [...groups];

    // Find the last user message by iterating backwards
    for (let i = newGroups.length - 1; i >= 0; i--) {
      const group = newGroups[i];
      for (let j = group.messages.length - 1; j >= 0; j--) {
        if (group.messages[j].author === Author.USER) {
          const updatedMessages = [...group.messages];
          updatedMessages[j] = {
            ...updatedMessages[j],
            hasError: true,
            isLoading: false,
          };

          newGroups[i] = {
            ...group,
            messages: updatedMessages,
          };

          return newGroups;
        }
      }
    }

    return groups;
  },

  // Find the last user message content across all groups
  findLastUserPrompt: (groups: ChatGroup[]): string | undefined => {
    for (let i = groups.length - 1; i >= 0; i--) {
      const group = groups[i];
      for (let j = group.messages.length - 1; j >= 0; j--) {
        if (group.messages[j].author === Author.USER) {
          return group.messages[j].messageChunks[0]?.data.answer.content;
        }
      }
    }
    return undefined;
  },

  // Create initial chat state with welcome message
  createInitialState: (welcomeMessage: string): ChatGroup[] => {
    return [
      {
        messages: [
          {
            author: Author.AI,
            messageChunks: [
              {
                data: {
                  answer: {
                    content: welcomeMessage,
                    next: '__end__',
                  },
                },
              },
            ],
            isLoading: false,
            suggestionsLoading: true,
          },
        ],
      },
    ];
  },

  // Update the context of a specific group (by index)
  updateGroupContext: (
    groups: ChatGroup[],
    groupIndex: number,
    context: string | undefined,
  ): ChatGroup[] => {
    if (groupIndex < 0 || groupIndex >= groups.length) return groups;

    const newGroups = [...groups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      context: context ? { labelText: context } : undefined,
    };

    return newGroups;
  },

  // Update the context of the first group
  updateFirstGroupContext: (
    groups: ChatGroup[],
    context: string | undefined,
  ): ChatGroup[] => {
    return chatGroupHelpers.updateGroupContext(groups, 0, context);
  },
};
