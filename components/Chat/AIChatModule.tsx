
import React, { useState, useRef, useEffect } from 'react';
import { useSalesStore } from '../../store.ts';
import { aiService } from '../../services/aiService.ts';
import { AIProviderId, ChatMessage } from '../../types.ts';

const AIChatModule: React.FC = () => {
  const { chatSession, setChatSession, aiProviders } = useSalesStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatSession.history]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      providerId: chatSession.activeProviderId
    };

    // Update UI immediately
    const newHistory = [...(chatSession.history || []), userMsg];
    setChatSession({ history: newHistory });
    setInput('');
    setIsTyping(true);

    try {
      // Call AI Service
      const responseText = await aiService.runChat(
        chatSession.activeProviderId, 
        newHistory, 
        userMsg.content
      );

      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        providerId: chatSession.activeProviderId
      };

      setChatSession({ history: [...newHistory, aiMsg] });
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'system',
        content: "Wystąpił błąd podczas komunikacji z modelem AI.",
        timestamp: Date.now()
      };
      setChatSession({ history: [...newHistory, errorMsg] });
    } finally {
      setIsTyping(false);
    }
  };

  const activeProvider = aiProviders.find(p => p.id === chatSession.activeProviderId) || aiProviders[0];

  const getProviderColor = (id: AIProviderId) => {
    switch (id) {
      case 'openai': return 'text-green-500 bg-green-50 border-green-200';
      case 'anthropic': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'google': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'perplexity': return 'text-teal-500 bg-teal-50 border-teal-200';
      case 'grok': return 'text-slate-900 bg-slate-100 border-slate-300';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const getProviderIcon = (id: AIProviderId) => {
    switch (id) {
        case 'openai': return 'fa-microchip';
        case 'anthropic': return 'fa-robot';
        case 'google': return 'fa-google';
        case 'perplexity': return 'fa-search';
        case 'grok': return 'fa-rocket';
        default: return 'fa-brain';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner">
              <i className="fas fa-comments text-xl"></i>
           </div>
           <div>
              <h2 className="text-xl font-black text-white tracking-tight">AI Chat Studio</h2>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Multi-Model Interface</p>
           </div>
        </div>

        {/* Model Selector */}
        <div className="flex bg-white/10 p-1.5 rounded-xl border border-white/10">
           {aiProviders.filter(p => p.enabled).map(provider => (
              <button
                key={provider.id}
                onClick={() => setChatSession({ activeProviderId: provider.id })}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
                   chatSession.activeProviderId === provider.id 
                   ? 'bg-white text-slate-900 shadow-md' 
                   : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                 <i className={`fas ${getProviderIcon(provider.id)}`}></i>
                 <span className="hidden md:inline">{provider.name}</span>
              </button>
           ))}
        </div>
      </div>

      {/* Chat History Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
         {(!chatSession.history || chatSession.history.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
               <i className={`fas ${getProviderIcon(activeProvider.id)} text-8xl mb-6`}></i>
               <p className="text-sm font-black uppercase tracking-widest">Rozpocznij czat z {activeProvider.name}</p>
            </div>
         )}
         
         {chatSession.history?.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[75%] rounded-[2rem] p-6 shadow-sm relative group ${
                  msg.role === 'user' 
                     ? 'bg-blue-600 text-white rounded-br-sm' 
                     : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
               }`}>
                  {msg.role === 'assistant' && (
                     <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getProviderColor(msg.providerId || 'google')}`}>
                        {aiProviders.find(p => p.id === msg.providerId)?.name || 'AI'}
                     </div>
                  )}
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[9px] font-bold mt-2 text-right opacity-40 uppercase tracking-widest ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
               </div>
            </div>
         ))}
         {isTyping && (
            <div className="flex justify-start">
               <div className="bg-white border border-slate-100 rounded-[2rem] rounded-bl-sm p-6 shadow-sm flex items-center space-x-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
               </div>
            </div>
         )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
         <div className="relative flex items-end gap-4">
            <div className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-6 py-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all flex items-center">
               <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                     }
                  }}
                  placeholder={`Napisz wiadomość do ${activeProvider.name}...`}
                  className="w-full bg-transparent border-none outline-none text-slate-900 font-medium resize-none max-h-32"
                  rows={1}
                  style={{ minHeight: '24px' }}
               />
            </div>
            <button 
               onClick={handleSend}
               disabled={!input.trim() || isTyping}
               className="w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <i className="fas fa-paper-plane text-lg"></i>
            </button>
         </div>
         <p className="text-center text-[9px] font-bold text-slate-300 mt-3 uppercase tracking-widest">
            AI może generować nieprecyzyjne informacje. Weryfikuj ważne dane.
         </p>
      </div>

    </div>
  );
};

export default AIChatModule;
