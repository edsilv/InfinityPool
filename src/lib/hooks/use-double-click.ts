import { useCallback, useRef } from 'react';

const useDoubleClick = (doubleClick: (e: MouseEvent) => void, timeout: number = 500) => {
  type Timeout = /*unresolved*/ any;

  const clickTimeout = useRef<string | number | Timeout | undefined>();

  const clearClickTimeout = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
  };

  return useCallback(
    (event: any) => {
      if (event.button !== 0) {
        return;
      }

      clearClickTimeout();
      if (event.detail % 2 === 0) {
        doubleClick(event);
      }
    },
    [doubleClick, timeout]
  );
};

export default useDoubleClick;
