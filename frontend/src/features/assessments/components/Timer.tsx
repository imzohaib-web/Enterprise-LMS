import React, { useEffect, useState, useRef, memo } from 'react';

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  onTick?: (elapsedSeconds: number) => void;
}

/**
 * Ticking countdown timer component for timed quiz attempts.
 * Triggers `onTimeUp` callback upon reaching 0:00.
 */
export const Timer: React.FC<TimerProps> = memo(({ initialMinutes, onTimeUp, onTick }) => {
  const totalSeconds = initialMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUpRef.current();
          return 0;
        }
        const nextSeconds = prev - 1;
        if (onTick) {
          onTick(totalSeconds - nextSeconds);
        }
        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [totalSeconds, onTick]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsLeft < 120; // less than 2 minutes warning

  return (
    <div
      className={`inline-flex items-center px-3.5 py-1.5 rounded-lg border font-mono font-semibold text-sm transition-all duration-300 ${
        isWarning
          ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50 animate-pulse'
          : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
      }`}
      aria-label={`Time remaining: ${formattedTime}`}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{formattedTime}</span>
    </div>
  );
});

Timer.displayName = 'Timer';
