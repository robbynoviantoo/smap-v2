'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import alert from '@/lib/alert';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Image as ImageIcon, 
  X, 
  User as UserIcon, 
  Check, 
  CheckCheck, 
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface ChatUser {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  unread_count?: number;
  last_message?: string;
  last_message_at?: string;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  recipient_id: number;
  message?: string;
  image?: string;
  is_mine: boolean;
  read_at?: string;
  created_at: string;
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch user list
  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['chat', 'users'],
    queryFn: async () => {
      const res = await apiClient.get('/chat/users');
      return res.data?.data || [];
    },
    refetchInterval: 5000, // Poll every 5s for new messages/contacts
  });

  const users: ChatUser[] = usersData || [];

  // 2. Fetch conversation with selected user
  const { data: conversationData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat', 'messages', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return { messages: [] };
      const res = await apiClient.get(`/chat/messages/${selectedUser.id}`);
      return res.data?.data || { messages: [] };
    },
    enabled: Boolean(selectedUser),
    refetchInterval: selectedUser ? 3000 : false, // Poll every 3s when conversation is active
  });

  const messages: ChatMessage[] = conversationData?.messages || [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!messageText.trim() && !imageFile) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      if (messageText.trim()) formData.append('message', messageText.trim());
      if (imageFile) formData.append('image', imageFile);

      await apiClient.post(`/chat/messages/${selectedUser.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessageText('');
      setImageFile(null);
      setImagePreview(null);

      // Invalidate queries to immediately show sent message
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedUser.id] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'users'] });
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal mengirim pesan.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
      {/* Left Sidebar: Contact list */}
      <div
        className={`w-full sm:w-80 md:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col ${
          selectedUser ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Pesan Internal</h2>
            <span className="text-xs text-gray-400 font-medium">{users.length} Kontak</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari rekan kerja..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* User items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">Tidak ada kontak ditemukan.</div>
          ) : (
            filteredUsers.map((u) => {
              const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name || 'Staff';
              const isSelected = selectedUser?.id === u.id;
              const unread = u.unread_count || 0;

              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full p-4 flex items-center justify-between gap-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-brand-50/60 dark:bg-brand-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs uppercase">
                        {fullName.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {fullName}
                        </span>
                        {u.last_message_at && (
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(u.last_message_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {u.last_message || u.email}
                      </p>
                    </div>
                  </div>

                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Conversation Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-900/20">
          {/* Header */}
          <div className="p-4 bg-white dark:bg-white/[0.03] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden p-1.5 text-gray-500 hover:text-gray-700 -ml-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs uppercase">
                {(selectedUser.first_name || selectedUser.name || 'U').charAt(0)}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{selectedUser.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Memuat riwayat chat...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-xs text-gray-400 space-y-1">
                <MessageSquare className="w-8 h-8 text-gray-300 mb-1" />
                <p className="font-semibold text-gray-600 dark:text-gray-300">Belum ada percakapan</p>
                <p>Kirim pesan pertama untuk memulai komunikasi.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.is_mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md rounded-2xl p-3.5 space-y-1.5 shadow-xs ${
                      msg.is_mine
                        ? 'bg-brand-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-xs'
                    }`}
                  >
                    {msg.image && (
                      <div className="rounded-xl overflow-hidden mb-1">
                        <img
                          src={msg.image}
                          alt="Attachment"
                          className="w-full max-h-60 object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {msg.message && (
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    )}

                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] ${
                        msg.is_mine ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.is_mine && (
                        msg.read_at ? (
                          <CheckCheck className="w-3 h-3 text-cyan-200" />
                        ) : (
                          <Check className="w-3 h-3 text-white/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview before sending */}
          {imagePreview && (
            <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-gray-500">Gambar siap dikirim</span>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-white/[0.03] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
          >
            <label className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ImageIcon className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />

            <button
              type="submit"
              disabled={isSending || (!messageText.trim() && !imageFile)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-all disabled:opacity-40"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50/30 dark:bg-gray-900/20">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center mb-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
            Pusat Pesan Internal (Chat)
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Pilih salah satu rekan kerja di daftar sebelah kiri untuk memulai percakapan atau berbagi tangkapan layar aset.
          </p>
        </div>
      )}
    </div>
  );
}
