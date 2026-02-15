import React, { useState, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';
import { Message, Specialist } from './types';
import { SPECIALISTS, DISCLAIMER_TEXT } from './constants';
import { sendMessageToGemini, initializeChat } from './services/gemini';

const App: React.FC = () => {
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist>(SPECIALISTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat(currentSpecialist);
  }, []); 

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, selectedImages]);

  const handleSpecialistChange = (specialist: Specialist) => {
    setCurrentSpecialist(specialist);
    setMessages([]);
    setSelectedImages([]);
    initializeChat(specialist);
  };

  const handleReset = () => {
    if (window.confirm("Hapus percakapan dan mulai sesi baru?")) {
        setMessages([]);
        setSelectedImages([]);
        initializeChat(currentSpecialist);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const MAX_IMAGES = 4;
      const promises: Promise<string>[] = [];
      for (let i = 0; i < Math.min(files.length, MAX_IMAGES); i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        promises.push(new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }));
      }
      const newImages = await Promise.all(promises);
      setSelectedImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES));
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && selectedImages.length === 0) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    const currentImages = [...selectedImages];
    setSelectedImages([]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(
        userMsg.text || "Lakukan analisis pada gambar yang dilampirkan.", 
        currentSpecialist,
        currentImages
      );
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Terjadi gangguan koneksi. Mohon ulangi pertanyaan Anda.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Layout>
      <Header 
          currentSpecialist={currentSpecialist} 
          onSpecialistChange={handleSpecialistChange}
          onReset={handleReset}
      />

      {/* Main Chat Viewport */}
      <main 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto chat-scrollbar pt-20 sm:pt-28 pb-40 px-4"
      >
        <div className="max-w-4xl mx-auto space-y-2">
            
            {/* Welcome Area - Only shown when no messages */}
            {messages.length === 0 && !isLoading && (
                <div className="py-12 sm:py-20 text-center animate-slide-up">
                    <div className="inline-flex p-4 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 mb-6 shadow-sm">
                        <span className="text-4xl">{currentSpecialist.icon}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">
                        Halo, saya {currentSpecialist.name}
                    </h2>
                    <p className="text-slate-500 max-w-lg mx-auto leading-relaxed px-4">
                        {currentSpecialist.description}. Silakan jelaskan keluhan Anda sedetail mungkin untuk diagnosis yang lebih akurat.
                    </p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto px-4">
                        {['Jelaskan gejala saya...', 'Analisis foto hasil lab...', 'Cek riwayat kesehatan...', 'Butuh saran tindakan...'].map((hint, i) => (
                            <button 
                                key={i}
                                onClick={() => setInputValue(hint)}
                                className="p-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left flex items-center gap-3 group"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></div>
                                {hint}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Content */}
            {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
            ))}

            {isLoading && (
                <ChatBubble 
                    message={{
                        id: 'thinking',
                        role: 'model',
                        text: '...',
                        timestamp: new Date(),
                        isThinking: true
                    }} 
                />
            )}
            
            <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating UI Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-8 pointer-events-none">
        <div className="max-w-4xl mx-auto">
            
            {/* Alert Disclaimer */}
            <div className="mb-4 text-center pointer-events-auto">
                <span className="inline-block px-4 py-1.5 bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md">
                   ⚠️ Simulasi AI • Bukan Pengganti Dokter Fisik
                </span>
            </div>

            {/* Input Dashboard */}
            <div className="pointer-events-auto glass rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-white/50 p-2 sm:p-3 overflow-hidden">
                
                {/* Image Previews */}
                {selectedImages.length > 0 && (
                    <div className="flex gap-2 p-3 border-b border-slate-100 mb-2 overflow-x-auto">
                        {selectedImages.map((img, idx) => (
                            <div key={idx} className="relative group flex-shrink-0">
                                <img src={img} className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200" />
                                <button 
                                    onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageSelect} 
                    />
                    
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none text-slate-800 text-base focus:ring-0 placeholder-slate-400 font-medium px-2 py-3"
                        placeholder={`Ketik keluhan Anda di sini...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    
                    <button
                        type="submit"
                        disabled={isLoading || (!inputValue.trim() && selectedImages.length === 0)}
                        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg transition-all transform active:scale-90 ${
                            isLoading || (!inputValue.trim() && selectedImages.length === 0)
                            ? 'bg-slate-200 shadow-none'
                            : 'gradient-medical shadow-blue-200 hover:shadow-blue-300'
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
      </footer>
    </Layout>
  );
};

export default App;