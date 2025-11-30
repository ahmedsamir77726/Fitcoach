
import React, { useState, useRef, useEffect } from 'react';
import { chatWithCoach, searchFitnessTrends } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';

interface ChatAssistantProps {
    profile: UserProfile;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: `Hi ${profile.name}! I'm your Gemini coach. How can I help you reach your goal to ${profile.goal.replace('_', ' ')} today?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const historyRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        let responseText = '';
        
        if (input.toLowerCase().includes('news') || input.toLowerCase().includes('trend') || input.toLowerCase().includes('study')) {
            const searchRes = await searchFitnessTrends(input);
            responseText = searchRes.text;
            if (searchRes.sources.length > 0) {
                responseText += `\n\nSources:\n` + searchRes.sources.map((s: any) => `- ${s.web.title}: ${s.web.uri}`).join('\n');
            }
        } else {
            responseText = await chatWithCoach(historyRef.current, input, profile);
        }

        const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
        
        setMessages(prev => [...prev, botMsg]);
        historyRef.current.push({ role: 'user', parts: [{ text: userMsg.text }] });
        historyRef.current.push({ role: 'model', parts: [{ text: botMsg.text }] });

    } catch (e) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I had trouble connecting to the gym server.", timestamp: Date.now(), isError: true }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Coach Gemini
            </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-700 text-slate-200 rounded-bl-none'
                    } ${msg.isError ? 'bg-red-900/50 border border-red-500' : ''}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-slate-700 rounded-2xl p-3 rounded-bl-none flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-700">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about workouts, form, or trends..."
                    className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-full border border-slate-600 focus:border-blue-500 outline-none text-sm"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || !input}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50 w-10 h-10 flex items-center justify-center"
                >
                    &uarr;
                </button>
            </div>
        </div>
    </div>
  );
};

export default ChatAssistant;
