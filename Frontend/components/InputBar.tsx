'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useTheme } from 'next-themes';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css'; // Import highlight.js CSS
import hljs from 'highlight.js';
import { AnimatePresence, motion } from 'framer-motion';
import SidebarModal from '@/app/projects/[projectId]/code-explorer/SidebarModal';

interface Message {
  text: string;
  type: 'user' | 'response';
}

const InputBar: React.FC<{ onChatResponse: (response: string) => void; baseFileUrl: string; code: string }> = ({ onChatResponse, baseFileUrl, code }) => {
  useEffect(() => {
    if (code) {
      console.log("Code content updated in InputBar:", code);
    }
  }, [code]);

  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCode, setSidebarCode] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (inputBarRef.current) {
      inputBarRef.current.classList.add('w-3/4');
    }
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inputMessage.trim() === '') return;

    setLoading(true);
    try {
      setInputMessage(''); // Clear the input
      const codebaseUrl = baseFileUrl.substring(0, baseFileUrl.lastIndexOf('/')) + '/codebase_analysis.json';
      const chatMessage = code ? `with this code in context: ${code}, ${inputMessage}.` : inputMessage;

      const chatResponse = await fetch('https://novuscode-backend1-83223007958.us-central1.run.app/chatProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage,
          codebaseUrl: codebaseUrl,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get response from chatProject');
      }

      const responseData = await chatResponse.json();
      const aiResponse = responseData.response;

      onChatResponse(aiResponse);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputMessage, type: 'user' },
        { text: aiResponse, type: 'response' },
      ]);
      
    } catch (error) {
      console.error('Error processing chat:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Error processing response', type: 'response' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event as any);
    }
  };

  const prompts = [
    "How can I help you?",
    "What does this code do?",
    "Refactor this code",
  ];
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPromptIndex((prevIndex) => (prevIndex + 1) % prompts.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    onSubmit({ preventDefault: () => {} } as any); // Trigger submit with prompt
  };

  const highlightCode = (code: string, language: string) => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(code, { language: validLanguage }).value;
  };

  const handleCodeClick = (code: string) => {
    setSidebarCode(code);
    setIsSidebarOpen(true);
  };

  return (
    <div  className="flex flex-col h-full w-full mx-auto max-w-3xl">
      <div id="messages-container" className="flex-grow overflow-y-auto overflow-x-auto p-4 bg-white">
  {messages.length === 0 && !loading ? (
    <div className="flex flex-col items-center justify-center h-full">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentPromptIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-xl text-gray-600 cursor-pointer hover:text-blue-500 transition-colors text-center"
          onClick={() => handlePromptClick(prompts[currentPromptIndex])}
        >
          {prompts[currentPromptIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  ) : (
    <div id="messages-container" className="flex-grow overflow-y-auto overflow-x-hidden p-4 bg-white">
  {messages.length === 0 && !loading ? (
    <div className="flex flex-col items-center justify-center h-full">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentPromptIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-xl text-gray-600 cursor-pointer hover:text-blue-500 transition-colors text-center"
          onClick={() => handlePromptClick(prompts[currentPromptIndex])}
        >
          {prompts[currentPromptIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg max-w-full break-words overflow-hidden ${
            msg.type === 'user'
              ? 'bg-gray-200 text-black self-end'
              : 'bg-transparent text-black self-start'
          }`}
          style={{ maxWidth: '100%' }}
        >
          <ReactMarkdown
            children={msg.text}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => <h1 className="mt-4 mb-2 text-xl font-semibold" {...props} />,
              h2: ({ node, ...props }) => <h2 className="mt-4 mb-2 text-lg font-semibold" {...props} />,
              code: ({ node, inline, className, children, ...props }) => {
                const language = className?.replace(/language-/, '') || 'plaintext';
                if (inline) {
                  return <code className={className} {...props}>{children}</code>;
                }
                const codeString = String(children).trim();
                const lines = codeString.split('\n').length;
                return lines > 3 ? (
                  <div>
                    <button
                      onClick={() => handleCodeClick(codeString)}
                      className="text-blue-500 underline"
                    >
                      View full code
                    </button>
                  </div>
                ) : (
                  <pre className={`language-${language}`}>
                    <code dangerouslySetInnerHTML={{ __html: highlightCode(codeString, language) }} />
                  </pre>
                );
              }
            }}
          />
        </div>
      ))}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )}
</div>
  )}
</div>

      <div className="flex-shrink-0 border-t p-4 flex justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-[75%]">
        <div className="relative flex w-full mb-5">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className={`h-12 w-full rounded-md border px-3 py-2 text-sm shadow-sm resize-none transition-colors focus:border-blue-500 focus:ring-1 ${
              theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
            }`}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            style={{ paddingBottom: '0.5rem' }} // Add bottom padding
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500"
            disabled={loading}
          >
            <Send />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
        This chatbot always know which code you are currently viewing.
        </p>
      </form>

      <SidebarModal isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} code={sidebarCode} />
    </div>
    </div>
  );
};

export default InputBar;
