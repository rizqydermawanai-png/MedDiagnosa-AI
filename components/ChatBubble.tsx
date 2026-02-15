import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Custom Formatter for AI Responses
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text highlighting
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          // Highlight specific medical headers
          const isHeader = i === 0 || content.includes(':') || content.toUpperCase() === content;
          return (
            <strong key={j} className={`${isHeader ? 'text-slate-900 block mt-2 text-base' : 'text-blue-700 font-bold'}`}>
              {content}
            </strong>
          );
        }
        return part;
      });

      // List item styling
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={i} className="ml-4 mt-1.5 flex gap-2 text-slate-600">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span>{formattedLine.slice(1)}</span>
          </li>
        );
      }

      // Default paragraph
      return (
        <p key={i} className={`leading-relaxed ${line.trim() === '' ? 'h-3' : 'mb-2 text-slate-600'}`}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-2 animate-slide-up`}>
      <div className={`flex max-w-[95%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
        
        {/* Icon/Avatar Container */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border ${
          isUser 
            ? 'bg-blue-600 border-blue-500 text-white shadow-blue-200' 
            : 'bg-white border-slate-200 text-blue-600'
        }`}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 12 4.5 4.5"/><path d="m12 12 7.5 7.5"/><path d="m12 12 7.5-7.5"/><path d="M12 12 4.5 19.5"/></svg>
          )}
        </div>

        {/* Message Content Area */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Label */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
            {isUser ? 'Pasien' : 'Analisis Medis'}
          </span>

          <div className={`relative px-5 py-4 shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
              : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none ring-1 ring-black/5'
          }`}>
            {/* Thinking Overlay */}
            {message.isThinking ? (
              <div className="flex items-center gap-3 py-1">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
                <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Diagnosing...</span>
              </div>
            ) : (
              <div className="text-[15px]">
                {/* Image Attachments */}
                {message.images && message.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {message.images.map((img, idx) => (
                      <img key={idx} src={img} className="w-32 h-32 object-cover rounded-xl border-2 border-slate-100 shadow-sm" />
                    ))}
                  </div>
                )}
                {/* Formatted Text */}
                <div className="markdown-body">{formatText(message.text)}</div>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <span className="text-[9px] font-semibold text-slate-400 mt-2 px-1 uppercase">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;