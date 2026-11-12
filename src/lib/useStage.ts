import { useEffect, useState } from 'react';
import { stage } from './stage';

/** Index of the sheet in front of the visitor; re-renders only when it changes. */
export function useSheetIndex(): number {
  const [index, setIndex] = useState(stage.index);
  useEffect(() => {
    setIndex(stage.index);
    return stage.onIndex(setIndex);
  }, []);
  return index;
}
