'use client';

import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { authService } from '@/services/auth.service';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getUser();
    setUsername(user?.username ?? null);
  }, []);

  const initials = username ? username.slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1">
        {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        {username && (
          <span className="text-sm text-gray-500 hidden sm:block">{username}</span>
        )}
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
        <button
          onClick={() => authService.logout()}
          title="Sair"
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
