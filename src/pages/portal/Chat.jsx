import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchMessages = () => {
        fetch('/api/portal/chat').then(r => r.json()).then(setMessages).catch(console.error);
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            await fetch('/api/portal/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage.trim() })
            });
            setNewMessage('');
            fetchMessages();
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
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider mb-4">CHAT WITH OWNER</h2>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageCircle size={40} className="mb-3 text-gray-600" />
                        <p className="text-sm font-tech tracking-wider">No messages yet</p>
                        <p className="text-[10px] font-tech text-gray-600 mt-1">Send a message to your gym owner</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'member' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'member'
                                ? 'bg-gold-400/10 border border-gold-400/20 rounded-br-md'
                                : 'bg-white/[0.05] border border-white/[0.08] rounded-bl-md'
                                }`}>
                                <p className="text-sm font-tech text-gray-200 leading-relaxed">{msg.message}</p>
                                <div className="flex items-center justify-between mt-1.5 gap-3">
                                    <span className={`text-[9px] font-tech tracking-wider ${msg.sender === 'member' ? 'text-gold-400/50' : 'text-gray-500'}`}>
                                        {msg.sender === 'owner' ? 'OWNER' : 'YOU'}
                                    </span>
                                    <span className="text-[9px] font-tech text-gray-600">{formatTime(msg.created_at)}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
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
        </div>
    );
};

export default Chat;
