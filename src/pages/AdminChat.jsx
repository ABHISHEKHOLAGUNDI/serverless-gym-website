import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ArrowLeft, User } from 'lucide-react';

const AdminChat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch all conversations
    const fetchConversations = () => {
        fetch('/api/chat').then(r => r.json()).then(setConversations).catch(console.error);
    };

    // Fetch messages for a specific member
    const fetchMessages = (memberId) => {
        fetch(`/api/chat?member_id=${memberId}`).then(r => r.json()).then(setMessages).catch(console.error);
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 8000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedMember) {
            fetchMessages(selectedMember.member_id);
            const interval = setInterval(() => fetchMessages(selectedMember.member_id), 4000);
            return () => clearInterval(interval);
        }
    }, [selectedMember]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending || !selectedMember) return;
        setSending(true);
        try {
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId: selectedMember.member_id, message: newMessage.trim() })
            });
            setNewMessage('');
            fetchMessages(selectedMember.member_id);
        } catch (err) {
            console.error('Failed to send', err);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (datetime) => {
        if (!datetime) return '';
        const d = new Date(datetime);
        return d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-4 pb-4">
            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider flex items-center gap-2">
                <MessageCircle size={22} /> MEMBER CHATS
            </h2>

            <AnimatePresence mode="wait">
                {!selectedMember ? (
                    /* Conversation List */
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {conversations.length === 0 ? (
                            <div className="glass-card rounded-2xl p-8 border border-white/[0.06] text-center">
                                <MessageCircle className="mx-auto text-gray-600 mb-3" size={40} />
                                <h3 className="text-sm font-tech text-gray-400 tracking-wider mb-1">NO CONVERSATIONS YET</h3>
                                <p className="text-xs font-tech text-gray-600">Members can start chatting from their portal</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {conversations.map((conv, i) => (
                                    <motion.button
                                        key={conv.member_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedMember(conv)}
                                        className="w-full glass-card rounded-2xl p-4 border border-white/[0.06] text-left hover:border-gold-400/20 transition-all flex items-center gap-4"
                                    >
                                        {conv.photo ? (
                                            <img src={conv.photo} alt="" className="w-12 h-12 rounded-full object-cover border border-gold-400/20" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400/20 to-amber-600/10 flex items-center justify-center border border-gold-400/20">
                                                <User size={20} className="text-gold-400/50" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-tech font-bold text-white text-sm tracking-wider">{conv.name}</span>
                                                <span className="text-[9px] font-tech text-gray-500">{formatTime(conv.last_time)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs font-tech text-gray-400 truncate pr-4">
                                                    {conv.sender === 'owner' ? 'You: ' : ''}{conv.last_message}
                                                </p>
                                                <span className="text-[9px] font-tech text-gray-600 whitespace-nowrap">{conv.total_messages} msgs</span>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    /* Chat View */
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col h-[calc(100vh-170px)]">
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 mb-4 py-2">
                            <button onClick={() => setSelectedMember(null)}
                                className="p-2 rounded-xl border border-white/[0.06] text-gray-400 hover:text-white hover:border-gold-400/20 transition-all">
                                <ArrowLeft size={18} />
                            </button>
                            {selectedMember.photo ? (
                                <img src={selectedMember.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-gold-400/20" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400/20 to-amber-600/10 flex items-center justify-center">
                                    <User size={16} className="text-gold-400/50" />
                                </div>
                            )}
                            <div>
                                <div className="font-tech font-bold text-white text-sm tracking-wider">{selectedMember.name}</div>
                                <div className="text-[10px] font-tech text-gray-500">Member #{selectedMember.member_id}</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <MessageCircle size={36} className="mb-2 text-gray-600" />
                                    <p className="text-sm font-tech">No messages yet</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'owner'
                                            ? 'bg-gold-400/10 border border-gold-400/20 rounded-br-md'
                                            : 'bg-white/[0.05] border border-white/[0.08] rounded-bl-md'
                                            }`}>
                                            <p className="text-sm font-tech text-gray-200 leading-relaxed">{msg.message}</p>
                                            <div className="flex items-center justify-between mt-1.5 gap-3">
                                                <span className={`text-[9px] font-tech tracking-wider ${msg.sender === 'owner' ? 'text-gold-400/50' : 'text-gray-500'}`}>
                                                    {msg.sender === 'owner' ? 'YOU' : selectedMember.name?.toUpperCase()}
                                                </span>
                                                <span className="text-[9px] font-tech text-gray-600">{formatTime(msg.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a reply..."
                                className="flex-1 bg-[#050816]/50 border border-gold-400/20 rounded-2xl py-3.5 px-5 text-sm font-tech text-white placeholder-gray-600 focus:outline-none focus:border-gold-400/40 transition-all"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={!newMessage.trim() || sending}
                                className={`px-5 rounded-2xl flex items-center justify-center transition-all ${newMessage.trim()
                                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-black'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminChat;
