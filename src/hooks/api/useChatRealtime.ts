'use client';

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pusher, { type PresenceChannel } from 'pusher-js';
import apiClient from '@/lib/api-client';
import { useAuth } from './useAuth';

const ChatRealtimeContext = createContext({
  isRealtime: false,
  presenceReady: false,
  onlineIds: [] as number[],
});

export function useChatRealtime() {
  return useContext(ChatRealtimeContext);
}

export function ChatRealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subscribedUser, setSubscribedUser] = useState<number | null>(null);
  const userId = user?.id;
  const [presence, setPresence] = useState<{ userId: number; ids: number[] } | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    if (!userId || !key) return;

    const secure = process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https';
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || (secure ? 443 : 8080));
    const client = new Pusher(key, {
      cluster: 'mt1',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname,
      wsPort: port,
      wssPort: port,
      forceTLS: secure,
      enabledTransports: secure ? ['wss'] : ['ws', 'wss'],
      disableStats: true,
      channelAuthorization: {
        customHandler: ({ socketId, channelName }, callback) => {
          apiClient.post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channelName,
          }).then(
            ({ data }) => callback(null, data),
            (error: unknown) => callback(
              error instanceof Error ? error : new Error('Channel authorization failed'),
              null,
            ),
          );
        },
      },
    });

    const presenceChannel = client.subscribe('presence-users.online') as PresenceChannel;
    const updatePresence = () => {
      const ids: number[] = [];
      presenceChannel.members.each((member: { id: string }) => ids.push(Number(member.id)));
      setPresence({ userId, ids });
    };
    presenceChannel.bind('pusher:subscription_succeeded', updatePresence);
    presenceChannel.bind('pusher:member_added', updatePresence);
    presenceChannel.bind('pusher:member_removed', updatePresence);
    presenceChannel.bind('pusher:subscription_error', () => setPresence(null));

    const channel = client.subscribe(`private-chat.${userId}`);
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['chat'] });
    };
    channel.bind('pusher:subscription_succeeded', () => {
      setSubscribedUser(userId);
      refresh();
    });
    channel.bind('pusher:subscription_error', () => setSubscribedUser(null));
    channel.bind('message.sent', refresh);
    channel.bind('messages.read', refresh);
    client.connection.bind('state_change', ({ current }: { current: string }) => {
      if (current !== 'connected') {
        setSubscribedUser(null);
        setPresence(null);
      }
    });

    const disconnect = () => {
      setPresence(null);
      setSubscribedUser(null);
      client.disconnect();
    };
    const reconnect = () => client.connect();
    window.addEventListener('offline', disconnect);
    window.addEventListener('online', reconnect);

    return () => {
      window.removeEventListener('offline', disconnect);
      window.removeEventListener('online', reconnect);
      presenceChannel.unbind_all();
      channel.unbind_all();
      client.connection.unbind_all();
      client.disconnect();
    };
  }, [userId, queryClient]);

  return createElement(ChatRealtimeContext.Provider, {
    value: {
      isRealtime: Boolean(userId && subscribedUser === userId),
      presenceReady: Boolean(userId && presence?.userId === userId),
      onlineIds: presence && presence.userId === userId ? presence.ids : [],
    },
  }, children);
}
