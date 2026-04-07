import { useEffect, useState } from 'react';

declare global {
  interface Window {
    snap: any;
  }
}

export const useMidtrans = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const pay = (token: string, callbacks: {
    onSuccess: (result: any) => void;
    onPending: (result: any) => void;
    onError: (result: any) => void;
    onClose: () => void;
  }) => {
    if (window.snap) {
      window.snap.pay(token, callbacks);
    } else {
      console.error('Midtrans Snap is not loaded');
    }
  };

  return { isLoaded, pay };
};
