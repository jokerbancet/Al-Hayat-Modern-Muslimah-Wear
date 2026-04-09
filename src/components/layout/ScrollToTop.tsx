import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // If the navigation type is 'POP', it means the user clicked the back/forward button.
    // In this case, we want to maintain the scroll position (browser default behavior).
    // Otherwise (PUSH or REPLACE), we scroll to the top.
    if (navType !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Instant jump as requested
      });
    }
  }, [pathname, navType]);

  return null;
}
