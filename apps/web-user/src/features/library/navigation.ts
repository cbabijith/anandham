import {
  BookOpen,
  Building2,
  GraduationCap,
  Home,
  Landmark,
  Megaphone,
  Newspaper,
  Quote,
  Users,
} from 'lucide-react';

export const readingSections = [
  { href: '/krithis', title: 'കൃതികൾ', english: 'Krithis', icon: BookOpen },
  { href: '/dharmam', title: 'ധർമ്മം', english: 'Dharmam', icon: BookOpen },
  { href: '/guru-arul', title: 'ഗുരു അരുൾ', english: 'Guru Arul', icon: Quote },
] as const;

// Add a route when a collection has published content. Until then it stays in Explore's roadmap.
export const upcomingSections = [
  {
    id: 'news',
    title: 'News & updates',
    description: 'News and events from the community.',
    icon: Newspaper,
  },
  {
    id: 'institutions',
    title: 'Gurudeva institutions',
    description: 'Education, learning and service.',
    icon: Building2,
  },
  {
    id: 'temples',
    title: 'Temples',
    description: 'Temples and places associated with Guru.',
    icon: Landmark,
  },
  {
    id: 'people',
    title: 'Related people',
    description: 'People connected to Guru’s life and work.',
    icon: Users,
  },
  {
    id: 'students',
    title: 'Guru’s students',
    description: 'Disciples and their contributions.',
    icon: GraduationCap,
  },
  {
    id: 'pracharakar',
    title: 'Gurudeva Pracharakar',
    description: 'Those sharing Guru’s teachings.',
    icon: Megaphone,
  },
  {
    id: 'organizations',
    title: 'Organizations',
    description: 'Organizations carrying Guru’s work forward.',
    icon: Home,
  },
] as const;
