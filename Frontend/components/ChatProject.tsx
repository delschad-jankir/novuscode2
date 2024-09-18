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

const ChatContent: React.FC<{ onMessageSent: () => void }> = ({ onMessageSent }) => {
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
    return <div></div>;
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
    "How can I help you today",
    "Give me a summary of this project's functionality.",
    "What are the main components of this project?",
    "How is the project structured?",
    "Describe the architecture of this project.",
    "What design patterns are used in this project?",
    "How are the modules in this project organized?",
    "Highlight the key classes and their responsibilities.",
    "What are the most frequently used functions or methods?",
    "Identify any major dependencies in the project.",
    "Check the codebase for adherence to coding standards.",
    "Identify any areas of the code that might need refactoring.",
    "Find potential security issues in the code.",
    "Generate a high-level documentation for this project.",
    "Create a summary of the key features and functionalities.",
    "List any missing documentation or comments.",
    "How are tests organized in this project?",
    "Identify areas of the code that are not covered by tests.",
    "Summarize the test cases and their purpose.",
    "Explain the build process for this project.",
    "What are the deployment steps?",
    "Identify any configuration files and their purposes.",
    "What should a new developer know before starting with this project?",
    "Provide an onboarding guide for new contributors.",
    "List the key areas a new developer should focus on."
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
  
      const chatResponse = await fetch('https://novuscode-backend1-83223007958.us-central1.run.app/chatProject', {
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
        throw new Error('Failed to get response from chatProject');
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
                      const language = className?.replace(/language-/, '') || 'plaintext';
                      if (inline) {
                        return <code className={className} {...props}>{children}</code>;
                      }
                      return (
                        <pre className="bg-gray-100 p-2 rounded">
                          <code
                            className={className}
                            dangerouslySetInnerHTML={{ __html: highlightCode(String(children).trim(), language) }}
                          />
                        </pre>
                      );
                    },
                    a: ({node, ...props}) => <a className="text-blue-500 underline" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                  }}
                />
              </div>
            ))}
            {loading && <div className="text-center mt-4">Loading...</div>}
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

export default ChatContent;