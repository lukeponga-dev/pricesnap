import React from 'react';
import { useAppState } from '../store';
import { Home, Camera, ClipboardList, Settings } from 'lucide-react';
import { Screen } from '../types';

const links: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'scanner', label: 'Scan', icon: Camera },
  { id: 'history', label: 'History', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const { screen, setScreen } = useAppState();

  // Only show on primary navigation screens
  if (screen === 'analyzing' || screen === 'result') return null;

  return (
    <nav className="pw-bottom-nav">
      {links.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setScreen(id)}
          className={`pw-nav-link ${
            screen === id ? 'pw-nav-link-active' : ''
          }`}
        >
          <Icon className="w-5 h-5 mb-0.5" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
