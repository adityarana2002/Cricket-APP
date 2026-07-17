import React, { useEffect, useRef, useState } from 'react';
import { localMatchService, LocalMatch } from '../services/localMatchService';
import '../pages/LocalMatchPage.css';

interface JoinLiveMatchModalProps {
  onClose: () => void;
  /** Called with the match once a code resolves to a watchable match. */
  onMatchFound: (match: LocalMatch) => void;
}

/** Match codes are 7 chars of A–Z / 0–9, generated server-side on match creation. */
const CODE_LENGTH = 7;
const CODE_PATTERN = /^[A-Z0-9]{7}$/;

/** Strip anything a user might paste around the code (spaces, dashes, #). */
const sanitize = (raw: string): string =>
  raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);

/**
 * Asks the spectator for a match code and resolves it to a match. A match is
 * only watchable once it has started, so UPCOMING matches are rejected here
 * rather than opening a viewer with an empty scoreboard.
 */
const JoinLiveMatchModal: React.FC<JoinLiveMatchModalProps> = ({ onClose, onMatchFound }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(sanitize(e.target.value));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = sanitize(code);

    if (!trimmed) {
      setError('Please enter a match code.');
      return;
    }
    if (!CODE_PATTERN.test(trimmed)) {
      setError(`A match code is ${CODE_LENGTH} characters (letters and numbers).`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const match = await localMatchService.getLocalMatchByCode(trimmed);

      if (match.status === 'UPCOMING') {
        setError('This match has not started yet. Try again once it goes live.');
        return;
      }

      onMatchFound(match);
    } catch (err: any) {
      setError(
        err?.response?.status === 404
          ? 'No match found with that code. Please check and try again.'
          : err?.response?.data?.message || 'Could not load that match. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lm-modal-overlay" onClick={onClose}>
      <div className="lm-modal jlm-modal" onClick={e => e.stopPropagation()}>
        <div className="lm-modal-header">
          <div>
            <h2 className="lm-modal-title">🔑 Watch a Live Match</h2>
            <p className="lm-modal-sub">Enter the match code shared by the scorer</p>
          </div>
          <button className="lm-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="jlm-body" onSubmit={handleSubmit}>
          <label className="jlm-label" htmlFor="jlm-code">Match Code</label>
          <input
            id="jlm-code"
            ref={inputRef}
            className={`jlm-input ${error ? 'jlm-input-err' : ''}`}
            value={code}
            onChange={handleChange}
            placeholder="ABC1234"
            maxLength={CODE_LENGTH}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!error}
            aria-describedby={error ? 'jlm-error' : 'jlm-hint'}
            disabled={loading}
          />

          {error
            ? <p className="jlm-error" id="jlm-error" role="alert">⚠ {error}</p>
            : <p className="jlm-hint" id="jlm-hint">
                The {CODE_LENGTH}-character code appears on the match card when a match is created.
              </p>}

          <div className="jlm-actions">
            <button type="button" className="lm-btn lm-btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="lm-btn lm-btn-primary"
              disabled={loading || code.length !== CODE_LENGTH}
            >
              {loading ? 'Finding…' : 'Watch Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinLiveMatchModal;
