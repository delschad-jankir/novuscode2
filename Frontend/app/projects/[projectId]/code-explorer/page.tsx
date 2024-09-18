'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TreeView from './TreeView';
import InputBar from '@/components/InputBar';
import PageContainer from '@/components/layout/page-container';
import axios from 'axios';
import { FileIcon, FolderIcon, DefaultIcon } from 'lucide-react';
import { useProjectData } from '@/context/ProjectDataContext';
import { useUserData } from '@/context/UserDataContext';
import { useChat } from '@/context/ChatContext';

const CodeExplorer: React.FC = () => {
  const [code, setCode] = useState<string>('// Select a file to view its content');
  const [theme, setTheme] = useState<'vs' | 'vs-dark' | 'hc-black' | 'hc-light'>('vs');
  const [filePath, setFilePath] = useState<string>('');
  const [language, setLanguage] = useState<string>('plaintext');
  const { projectData } = useProjectData();
  const { user } = useUserData();
  const { selectedChat, setSelectedChat } = useChat();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const baseFileUrl = projectData?.fileUrl?.replace('.zip', '') ?? '';

  const handleFileClick = async (filePath: string) => {
    setFilePath(filePath);
    console.log('Base File URL:', baseFileUrl);
    console.log('File Path:', filePath);

    try {
      // Ensure the file path is correctly formatted
      const cleanFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

      // Construct the full API URL by combining baseFileUrl and cleanFilePath
      const apiUrl = `${baseFileUrl}/${encodeURIComponent(cleanFilePath)}`;
      console.log('API URL to send to backend:', apiUrl);

      // Send request to our backend server
      const response = await axios.get('https://novuscode-backend1-83223007958.us-central1.run.app/api/fetch-file-content', {
        params: { url: apiUrl },
      });
      setCode(response.data);

      const fileExtension = cleanFilePath.split('.').pop()?.toLowerCase();
      setLanguage(getLanguageFromExtension(fileExtension));
    } catch (error) {
      console.error('An error occurred:', error);
      setCode(`// Error fetching file content: ${error.response?.data?.error || error.message}`);
    }
  };

  const getLanguageFromExtension = (extension: string | undefined): string => {
    switch (extension) {
      case 'js':
      case "jsx":
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'go':
        return 'go';
      case 'rb':
        return 'ruby';
      case 'php':
        return 'php';
      case 'sql':
        return 'sql';
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'xml':
        return 'xml';
      case 'sh':
        return 'shell';
      case 'dockerfile':
        return 'dockerfile';
      default:
        return 'plaintext';
    }
  };

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      setTheme(darkModeMediaQuery.matches ? 'vs-dark' : 'vs');
    };

    updateTheme();
    darkModeMediaQuery.addEventListener('change', updateTheme);

    return () => {
      darkModeMediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as 'vs' | 'vs-dark' | 'hc-black' | 'hc-light');
  };

  const FileTreeItem: React.FC<{ name: string; isFolder: boolean }> = ({
    name,
    isFolder,
  }) => {
    const extension = name.split('.').pop()?.toLowerCase();
    let Icon = DefaultIcon;

    if (isFolder) {
      Icon = FolderIcon;
    } else {
      switch (extension) {
        case 'js':
          Icon = () => <FileIcon color="#F0DB4F" />;
          break;
        case 'ts':
        case 'tsx':
          Icon = () => <FileIcon color="#007ACC" />;
          break;
        case 'html':
          Icon = () => <FileIcon color="#E34C26" />;
          break;
        case 'css':
          Icon = () => <FileIcon color="#264DE4" />;
          break;
        case 'json':
          Icon = () => <FileIcon color="#000000" />;
          break;
        case 'md':
          Icon = () => <FileIcon color="#083FA1" />;
          break;
        default:
          Icon = FileIcon;
      }
    }

    return (
      <div className="flex items-center">
        <Icon className="mr-2" size={16} />
        <span>{name}</span>
      </div>
    );
  };

  const handleChatResponse = async (response: string) => {
    if (selectedChat === null) {
      // New Chat start
      const saveChatResponse = await fetch('https://novuscode-backend1-83223007958.us-central1.run.app/saveChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          projectID: projectData.id,
          title: 'Codebase Question',
          messages: [
            {
              id: 'msg1',
              content: 'Codebase Question',
              role: 'user',
              timestamp: new Date().toISOString(),
            },
            {
              id: 'msg2',
              content: response,
              role: 'response',
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      const saveChatData = await saveChatResponse.json();
      console.log('Save chat response:', saveChatData);
      setSelectedChat(saveChatData);
    } else {
      // Update existing chat
      await fetch('https://novuscode-backend1-83223007958.us-central1.run.app/updateChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          newMessage: [
            {
              content: 'Codebase Question',
              role: 'user',
              timestamp: new Date().toISOString(),
            },
            {
              content: response,
              role: 'response',
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }
  };

  const onLayoutChange = useCallback((sizes) => {
    // Handle the layout change and ensure total width does not exceed starting width
    const totalWidth = sizes.reduce((acc, size) => acc + size, 0);
    if (totalWidth !== 100) {
      // Adjust the sizes to ensure total width is 100
      const adjustedSizes = sizes.map(size => (size / totalWidth) * 100);
      // Update the layout or handle accordingly
      // Example: setSizes(adjustedSizes);
    }
  }, []);

  return (
    <PageContainer scrollable>
      <div className="h-[calc(100vh-120px)] p-4">
        <PanelGroup
          direction="horizontal"
          autoSaveId="code-explorer"
          onLayout={onLayoutChange}
        >
          <Panel defaultSize={20} minSize={10} maxSize={50} id="panel1">
            <div className="h-full rounded-lg bg-white p-4 shadow-lg dark:bg-black">
              <h2 className="mb-4 text-lg font-semibold md:text-xl">File Explorer</h2>
              <div className="h-[calc(100%-2rem)] overflow-y-auto">
                <TreeView onFileClick={handleFileClick} renderItem={FileTreeItem} />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300" />

          <Panel defaultSize={50} minSize={20} maxSize={50} id="panel2">
            <div className="h-full rounded-lg bg-white p-4 shadow-lg dark:bg-black">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold md:text-xl">Code Editor</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={theme}
                    onChange={handleThemeChange}
                    className="rounded border border-gray-300 p-2 text-sm"
                  >
                    <option value="vs">Light</option>
                    <option value="vs-dark">Dark</option>
                    <option value="hc-black">High Contrast Black</option>
                    <option value="hc-light">High Contrast Light</option>
                  </select>
                </div>
              </div>
              <div className="h-[calc(100%-4rem)] w-full rounded-b-lg border border-gray-300 dark:border-gray-700">
                <Editor
                  height="100%"
                  defaultLanguage="plaintext"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme={theme}
                  language={language}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: 'on',
                    renderWhitespace: 'all',
                    tabSize: 2,
                  }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300" />

          <Panel defaultSize={30} minSize={10} maxSize={50} id="panel3">
            <div className="h-full rounded-lg bg-white p-4 shadow-lg dark:bg-black">
              <h2 className="text-lg font-semibold md:text-xl">Chat</h2>
              <InputBar code={code} baseFileUrl={baseFileUrl} onChatResponse={handleChatResponse} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </PageContainer>
  );
};

export default CodeExplorer;