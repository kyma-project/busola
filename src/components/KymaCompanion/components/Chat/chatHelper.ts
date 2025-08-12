import jsyaml from 'js-yaml';
import { Author, ChatGroup, Message, MessageChunk } from './types';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { useEffect, useState } from 'react';
import { getResourcePath } from 'components/Modules/support';

// Helper functions for managing grouped chat state
export const chatHelpers = {
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
    isFeedback: boolean,
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
      isFeedback,
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
    return chatHelpers.updateGroupContext(groups, 0, context);
  },
};

export const parseParams = (url: string, resource: string) => {
  const parts = url.split('/').filter(Boolean); // Remove empty strings from split
  let [namespace, resType, resName]: [string | null, string, string] = [
    null,
    '',
    '',
  ];
  if (parts[0] === 'namespaces') {
    [namespace, resType, resName] = [parts[1], parts[2], parts[3]];
  } else {
    [resType, resName] = [parts[0], parts[1]];
  }

  const parsedResource = jsyaml.load(resource.replace('yaml', '')) || {};
  return { namespace, resType, resName, parsedResource };
};

export const useDoesNamespaceExist = (url: string, resource: string) => {
  const fetch = useFetch();

  const { namespace } = parseParams(url, resource);
  const { parsedResource } = parseParams(url, resource);
  // @ts-ignore
  const resourceNamespace = parsedResource?.metadata?.namespace;
  const [namespaceExists, setNamespaceExists] = useState(false);

  useEffect(() => {
    async function fetchResource() {
      if (namespace !== resourceNamespace) {
        setNamespaceExists(false);
        return;
      }
      try {
        const isNamespace = await fetch({
          relativeUrl: `/api/v1/namespaces/${namespace}`,
        });

        setNamespaceExists(isNamespace.ok);
      } catch (e) {
        if (e instanceof Error) {
          setNamespaceExists(false);
        }
      }
    }

    fetchResource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, resource]);

  return namespaceExists;
};

export const useDoesResourceExist = (url: string, resource: string) => {
  const fetch = useFetch();
  const { parsedResource, namespace } = parseParams(url, resource);
  // @ts-ignore
  const resourceNamespace = parsedResource?.metadata?.namespace;

  const [resourceExists, setResourceExists] = useState(false);

  useEffect(() => {
    async function fetchResource() {
      if (resourceNamespace !== namespace) {
        setResourceExists(false);
        return;
      }
      try {
        const isResource = await fetch({
          relativeUrl: getResourcePath(parsedResource),
        });
        const json = await isResource.json();
        setResourceExists(isResource.ok && !!json);
      } catch (e) {
        if (e instanceof Error) {
          setResourceExists(false);
        }
      }
    }

    fetchResource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, resource]);

  return resourceExists;
};
