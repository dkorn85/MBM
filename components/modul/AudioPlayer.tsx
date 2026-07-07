"use client";

import { useEffect, useRef, useState } from "react";

function formatZeit(sek: number): string {
  if (!Number.isFinite(sek) || sek < 0) return "0:00";
  const m = Math.floor(sek / 60);
  const s = Math.floor(sek % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AudioFolgt() {
  return (
    <p className="rounded-xl border border-linie bg-flaeche px-4 py-3 text-sm text-tinte-sanft">
      Das Audio zu diesem Schritt folgt bald. Du kannst den Text in Ruhe lesen.
    </p>
  );
}

export default function AudioPlayer({
  src,
  schrittTitel,
  modulTitel,
}: {
  src?: string;
  schrittTitel: string;
  modulTitel: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [spielt, setSpielt] = useState(false);
  const [position, setPosition] = useState(0);
  const [dauer, setDauer] = useState(0);
  const [fehler, setFehler] = useState(false);

  // MediaSession für Hintergrund-/Lockscreen-Steuerung.
  useEffect(() => {
    if (!src || typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${modulTitel} — ${schrittTitel}`,
        artist: "YipYip",
      });
      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
      });
    } catch {
      // MediaSession nicht verfügbar — kein Problem.
    }
    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      } catch {
        // ignorieren
      }
    };
  }, [src, modulTitel, schrittTitel]);

  // Beim Verlassen des Schritts pausieren.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  if (!src) {
    return <AudioFolgt />;
  }

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const wert = Number(e.target.value);
    audio.currentTime = wert;
    setPosition(wert);
  };

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- geführte Audio-Übung, kein Dialog; Text steht mitlesbar daneben */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(e) => setDauer(e.currentTarget.duration)}
        onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
        onPlay={() => setSpielt(true)}
        onPause={() => setSpielt(false)}
        onEnded={() => setSpielt(false)}
        onError={() => setFehler(true)}
      />

      {fehler ? (
        <AudioFolgt />
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-linie bg-flaeche px-4 py-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={spielt ? "Pausieren" : "Abspielen"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-salbei-tief text-grund transition-colors duration-200 ease-out hover:bg-salbei"
          >
            {spielt ? (
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
                <rect x="4" y="3" width="4" height="14" rx="1" />
                <rect x="12" y="3" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
                <path d="M5 3.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 5 3.5Z" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={dauer || 0}
            step={0.1}
            value={position}
            onChange={onSeek}
            aria-label="Audio-Position"
            className="h-2 flex-1 cursor-pointer accent-salbei-tief"
          />

          <span className="shrink-0 text-sm tabular-nums text-tinte-sanft">
            {formatZeit(position)} / {formatZeit(dauer)}
          </span>
        </div>
      )}
    </div>
  );
}
