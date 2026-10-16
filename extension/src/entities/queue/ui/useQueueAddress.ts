import { useEffect, useRef, useState } from 'react';
import { type QueueState, queueStateOfHash, writeQueueState } from '../model/address';

/**
 * Queue filters and page live in the section address (`#downloads?…`): a change is a new browser
 * history entry, "Back" restores the previous one (docs/extension/queues.md, section 5).
 */
export function useQueueAddress(section: string): [QueueState, (next: QueueState) => void] {
  const [state, setState] = useState(() => queueStateOfHash(location.hash));
  useEffect(() => {
    const onPop = () => location.hash.startsWith(`#${section}`) && setState(queueStateOfHash(location.hash));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [section]);
  const push = (next: QueueState) => {
    const hash = `#${section}${writeQueueState(next)}`;
    if (location.hash !== hash) history.pushState(null, '', hash);
    setState(next);
  };
  return [state, push];
}

/** Counter click: id of the video to scroll to once it appears on the page. */
export function useScrollTarget(ids: readonly number[]): { setTarget: (id: number) => void; target: number | null } {
  const [target, setTarget] = useState<number | null>(null);
  const done = useRef<number | null>(null);
  useEffect(() => {
    if (target === null || done.current === target || !ids.includes(target)) return;
    done.current = target;
    document.getElementById(`queue-item-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [target, ids]);
  return {
    target,
    setTarget: (id) => {
      done.current = null;
      setTarget(id);
    },
  };
}
