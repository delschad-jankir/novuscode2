import { NavItem } from '@/types';
import { Prompts } from '@/types';
import { logout } from '@/lib/auth';

export type Project = {
  id: number;
  name: string;
  description: string;
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: 'Code',
    label: 'projects'
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: 'FileText',
    label: 'documents'
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: 'profile',
    label: 'profile'
  },
  {
    title: 'Logout',
    href: '/',
    icon: 'login',
    label: 'login',
    onClick: async (e) => {
      e.preventDefault();
      await logout();
    }
  }
];

export const prompts: Prompts[] = [
  [
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
  ]
]