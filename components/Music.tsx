'use client';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { PortfolioScore } from '@/lib/score';

export default function Music() {
  const score = useRef<PortfolioScore | null>(null), wanted = useRef(false), busy = useRef(false);
  const [playing,setPlaying] = useState(false), [volume,setVolume] = useState(45), [error,setError] = useState('');
  useEffect(() => {
    const visibility = async () => {
      if (!score.current || busy.current) return;
      busy.current = true;
      try { if (document.hidden) await score.current.pause(); else if (wanted.current) await score.current.play(); }
      finally { busy.current = false; }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); score.current?.dispose(); };
  }, []);
  const toggle = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      score.current ??= new PortfolioScore();
      const next = !wanted.current;
      if (next) await score.current.play(); else await score.current.pause();
      wanted.current = next; setPlaying(next); setError('');
    } catch { setError('Audio unavailable on this browser.'); }
    finally { busy.current = false; }
  };
  return <div className="music-control">
    <button onClick={toggle} aria-pressed={playing} aria-label={playing?'Pause portfolio music':'Play portfolio music'}>
      {playing?<Volume2 size={15}/>:<VolumeX size={15}/>}<span>{playing?'SOUND ON':'PLAY SCORE'}</span>
    </button>
    {playing && <label><span className="sr-only">Music volume</span><input aria-label="Music volume" type="range" min="0" max="100" value={volume} onChange={event=>{const value=Number(event.target.value);setVolume(value);score.current?.setVolume(value/100);}}/></label>}
    {error && <span role="status">{error}</span>}
  </div>;
}
