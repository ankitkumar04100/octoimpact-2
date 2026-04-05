import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Focus the OCTOMIND chat FAB
        const fab = document.querySelector('[aria-label="Open OCTOMIND"]') as HTMLElement;
        fab?.click();
      }
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        navigate('/dao');
      }
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        navigate('/dashboard');
      }
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        navigate('/actions');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
