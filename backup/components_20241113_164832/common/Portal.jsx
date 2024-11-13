import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function Portal({ children, containerId = 'portal-root' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let element = document.getElementById(containerId);
    if (!element) {
      element = document.createElement('div');
      element.setAttribute('id', containerId);
      document.body.appendChild(element);
    }
    return () => {
      if (element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [containerId]);

  if (!mounted) return null;
  return createPortal(children, document.getElementById(containerId));
} 