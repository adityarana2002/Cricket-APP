import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  /** Called once the splash has fully faded out. */
  onFinish: () => void;
}

/**
 * Cricket-themed launch animation shown when the app (PWA) is opened.
 * A leather ball flies in and bowls the stumps — bails fly off with a spark —
 * then the CricMax wordmark resolves before the splash fades into the app.
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 2600);
    const doneTimer = window.setTimeout(onFinish, 3150);
    return () => { window.clearTimeout(leaveTimer); window.clearTimeout(doneTimer); };
  }, [onFinish]);

  // Let impatient users skip straight into the app
  const skip = () => {
    setLeaving(true);
    window.setTimeout(onFinish, 450);
  };

  return (
    <div
      className={`splash ${leaving ? 'splash-leaving' : ''}`}
      onClick={skip}
      role="presentation"
    >
      {/* Ambient stadium light beams */}
      <div className="splash-beam splash-beam-1" />
      <div className="splash-beam splash-beam-2" />
      <div className="splash-glow" />

      <div className="splash-stage">
        <svg
          className="splash-svg"
          viewBox="0 0 260 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="ballGrad" cx="38%" cy="34%" r="70%">
              <stop offset="0%" stopColor="#ff6b5e" />
              <stop offset="45%" stopColor="#d8261c" />
              <stop offset="100%" stopColor="#7e120c" />
            </radialGradient>
            <linearGradient id="stumpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5e6c8" />
              <stop offset="100%" stopColor="#c89b54" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F7DF82" />
              <stop offset="55%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8940A" />
            </linearGradient>
            <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>

          {/* Pitch line + shadow */}
          <ellipse className="splash-pitch" cx="150" cy="176" rx="92" ry="9" />
          <line className="splash-crease" x1="78" y1="176" x2="222" y2="176" />

          {/* Stumps */}
          <g className="splash-stumps">
            <rect className="splash-stump" x="139" y="96" width="5.4" height="78" rx="2.7" fill="url(#stumpGrad)" />
            <rect className="splash-stump" x="150"  y="96" width="5.4" height="78" rx="2.7" fill="url(#stumpGrad)" />
            <rect className="splash-stump" x="161" y="96" width="5.4" height="78" rx="2.7" fill="url(#stumpGrad)" />
          </g>

          {/* Bails */}
          <rect className="splash-bail splash-bail-1" x="140" y="91.5" width="13" height="4" rx="2" fill="#e9c87a" />
          <rect className="splash-bail splash-bail-2" x="152" y="91.5" width="13" height="4" rx="2" fill="#e9c87a" />

          {/* Impact spark */}
          <g className="splash-spark">
            <path d="M138 104 L131 96 M138 110 L128 110 M140 116 L134 124 M146 102 L142 94" />
          </g>

          {/* Cricket ball */}
          <g className="splash-ball">
            <circle cx="0" cy="0" r="13" fill="url(#ballGrad)" />
            <circle cx="0" cy="0" r="13" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
            {/* seam */}
            <path className="splash-seam" d="M -9 -7 Q 0 0 -9 7" stroke="#fbe9c9" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path className="splash-seam" d="M 9 -7 Q 0 0 9 7" stroke="#fbe9c9" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <circle cx="0" cy="0" r="13" fill="#fff" opacity="0.10" filter="url(#soft)" />
          </g>
        </svg>
      </div>

      {/* Wordmark */}
      <div className="splash-brand">
        <h1 className="splash-name">CricMax</h1>
        <p className="splash-tag">Master the Game</p>
      </div>

      {/* Loader */}
      <div className="splash-dots" aria-label="Loading">
        <span /><span /><span />
      </div>
    </div>
  );
};

export default SplashScreen;
