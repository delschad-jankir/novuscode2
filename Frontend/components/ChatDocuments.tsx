'use client';

import React, { useState, useEffect, KeyboardEvent } from 'react';
import { useTheme } from 'next-themes';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import 'highlight.js/styles/github.css';
import hljs from 'highlight.js';

import { useProjectData } from '@/context/ProjectDataContext';
import { useUserData } from '@/context/UserDataContext';
import { useChat } from '@/context/ChatContext';

interface Message {
  text: string;
  type: 'user' | 'response';
}

const ChatDocument: React.FC<{ onMessageSent: () => void }> = ({ onMessageSent }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const { user } = useUserData();
  const { projectData } = useProjectData();
  const fileUrl = projectData?.fileUrl ?? null;
  const { selectedChat, setSelectedChat } = useChat();

  if (!fileUrl) {
    return <div>File URL is missing. Please provide a valid project data.</div>;
  }

  useEffect(() => {
    if (!projectData) {
      // Trigger loading of project data, or show a loading indicator.
    }
  }, [projectData]);

  useEffect(() => {
    setSelectedChat(null);
    return () => {
      setSelectedChat(null);
    };
  }, [setSelectedChat]);

  const prompts = [
    "How can I help you?",
    "How to start the project?",
    "How to create a Turing machine?",
    "Why did the programmer quit his job?",
    "How many programmers does it take to change a light bulb?",
    "What's a pirate's favorite programming language?",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPromptIndex((prevIndex) => (prevIndex + 1) % prompts.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    console.log('selectedChat updated:', selectedChat);
  }, [selectedChat]);

  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat && selectedChat.messages) {
      const chatMessages = selectedChat.messages.map((msg) => ({
        text: msg.content,
        type: msg.role === 'user' ? 'user' : 'response'
      }));
      setMessages(chatMessages);
    }
  }, [selectedChat]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inputMessage.trim() === '') return;
    setLoading(true);
    onMessageSent();

    const currentMessage = inputMessage; // Store the current message
    setInputMessage(''); // Clear the input immediately after submission

    try {
      const baseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/'));
      const codebaseUrl = `${baseUrl}/codebase_analysis.json`;

      setMessages(prevMessages => [...prevMessages, { text: currentMessage, type: 'user' }]);

      const chatResponse = await fetch('https://novuscode-backend1-83223007958.us-central1.run.app/chatDocuments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          codebaseUrl: codebaseUrl,
          selectedChat: selectedChat ? selectedChat : null,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get response from chatDocuments');
      }

      const responseData = await chatResponse.json();
      const aiResponse = responseData.response;

      setMessages(prevMessages => [...prevMessages, { text: aiResponse, type: 'response' }]);

      if (selectedChat === null) {
        const saveChatResponse = await fetch('https://novuscode-backend1-83223007958.us-central1.run.app/saveChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            projectID: projectData.id,
            title: currentMessage,
            messages: [
              {
                "id": "msg1",
                "content": currentMessage,
                "role": "user",
                "timestamp": new Date().toISOString()
              },
              {
                "id": "msg2",
                "content": aiResponse,
                "role": "response",
                "timestamp": new Date().toISOString()
              }
            ],
          }),
        });
        const saveChatData = await saveChatResponse.json();
        setSelectedChat(saveChatData);
      } else {
        await fetch('https://novuscode-backend1-83223007958.us-central1.run.app/updateChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: selectedChat.id,
            newMessage: [
              {
                content: currentMessage,
                role: 'user',
                timestamp: new Date().toISOString()
              },
              {
                content: aiResponse,
                role: 'response',
                timestamp: new Date().toISOString()
              }
            ]
          }),
        });
      }
    } catch (error) {
      console.error('Error processing chat:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Error processing response', type: 'response' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as any);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    handleSubmit({ preventDefault: () => {} } as any);
  };

  const highlightCode = (code: string, language: string) => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(code, { language: validLanguage }).value;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[75%] mx-auto">
      <div id="messages-container" className="flex-grow overflow-y-auto overflow-x-hidden p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold mb-4">Hi Delschad</h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPromptIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xl text-gray-600 cursor-pointer hover:text-blue-500 transition-colors"
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
                    h1: ({node, ...props}) => <h1 className="mt-4 mb-2 text-xl font-semibold" {...props} />,
                    h2: ({node, ...props}) => <h2 className="mt-4 mb-2 text-lg font-semibold" {...props} />,
                    h3: ({node, ...props}) => <h3 className="mt-4 mb-2 text-base font-semibold" {...props} />,
                    h4: ({node, ...props}) => <h4 className="mt-4 mb-2 text-sm font-semibold" {...props} />,
                    h5: ({node, ...props}) => <h5 className="mt-4 mb-2 text-sm font-medium" {...props} />,
                    h6: ({node, ...props}) => <h6 className="mt-4 mb-2 text-xs font-medium" {...props} />,
                    code: ({node, inline, className, children, ...props}) => {
                      const language = className?.replace('language-', '') || 'plaintext';
                      return !inline ? (
                        <pre className={`language-${language}`} {...props}>
                          <code
                            dangerouslySetInnerHTML={{ __html: highlightCode(String(children).replace(/\n$/, ''), language) }}
                          />
                        </pre>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 border-t bg-background p-4 flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-[75%]">
          <div className="relative flex w-full mb-5">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className={`h-12 w-full rounded-md border px-3 py-2 text-sm shadow-sm resize-none transition-colors focus:border-blue-500 focus:ring-1 ${
                theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
              }`}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500"
            >
              <Send />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">This chatbot is connected to the full codebase and documents. Use with caution.</p>
        </form>
      </div>
    </div>
  );
};

export default ChatDocument;
