'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Send, Loader } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  text: string;
  type: 'user' | 'response';
}

interface InputBarFormValues {
  message: string;
}

const InputBar: React.FC<{ onChatResponse: (response: string) => void; baseFileUrl: string; code: string }> = ({
  onChatResponse,
  baseFileUrl,
  code
}) => {
  useEffect(() => {
    if (code) {
      console.log("Code content updated in InputBar:", code);
    }
  }, [code]);

  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);

  const form = useForm<InputBarFormValues>({
    defaultValues: {
      message: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, reset, setValue } = form;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputBarRef.current) {
      inputBarRef.current.classList.add('w-3/4');
    }
  }, []);

  const onSubmit: SubmitHandler<InputBarFormValues> = async (data) => {
    if (data.message.trim() === '') return;
    setLoading(true);

    try {
      const codebaseUrl = baseFileUrl.substring(0, baseFileUrl.lastIndexOf('/')) + '/codebase_analysis.json';
      const chatMessage = code
        ? `with this code in context: ${code}, ${data.message}.`
        : data.message;

      const chatResponse = await fetch('http://localhost:4000/chatProject', {
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
        { text: data.message, type: 'user' },
        { text: aiResponse, type: 'response' },
      ]);

      reset();
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const prompts = [
    "How can I help you?",
    "How to start the project?",
    "How to create a Turing machine?",
    "Why did the programmer quit his job?",
    "How many programmers does it take to change a light bulb?",
    "What's a pirate's favorite programming language?",
  ];

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPromptIndex((prevIndex) => (prevIndex + 1) % prompts.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handlePromptClick = (prompt: string) => {
    setValue('message', prompt);
    handleSubmit(onSubmit)();
  };

  return (
    <div ref={inputBarRef} className="flex flex-col h-full w-full mx-auto max-w-3xl">
      <div id="messages-container" className="flex-grow overflow-y-auto overflow-x-hidden p-4">
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
                    ? 'bg-blue-500 text-white self-end'
                    : 'bg-gray-200 text-black self-start'
                }`}
                style={{ maxWidth: '100%' }}
              >
                <ReactMarkdown children={msg.text} remarkPlugins={[remarkGfm]} />
              </div>
            ))}
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin" size={48} />
          </div>
        )}
      </div>
      <div className="flex-shrink-0 border-t bg-white p-4 flex justify-center">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="relative flex w-full">
            <textarea
              {...register('message')}
              className={`h-12 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-auto ${
                theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-black border-gray-200'
              }`}
              placeholder="Type your message..."
              disabled={loading}
              rows={1}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              disabled={loading}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center p-2 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">This chatbot always knows which code you are currently viewing.</p>
        </form>
      </div>
    </div>
  );
};

export default InputBar;
