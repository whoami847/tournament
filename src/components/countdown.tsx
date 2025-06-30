'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const calculateTimeLeft = () => {
    const target = new Date(targetDate);
    const now = new Date();
    
    if (isNaN(target.getTime()) || target <= now) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const duration = intervalToDuration({ start: now, end: target });
    const totalSeconds = differenceInSeconds(target, now);
    
    return {
      total: totalSeconds,
      days: duration.days || 0,
      hours: duration.hours || 0,
      minutes: duration.minutes || 0,
      seconds: duration.seconds || 0,
    };
  };

  const [timeLeft, setTimeLeft] = useState({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
  }, []);


  useEffect(() => {
    if (timeLeft.total <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, timeLeft.total]);

  const formatCountdown = () => {
    if (timeLeft.total <= 0) {
      return "Starting soon";
    }

    const parts: string[] = [];
    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}d`);
      if (timeLeft.hours > 0) {
        parts.push(`${timeLeft.hours}h`);
      }
    } else if (timeLeft.hours > 0) {
      parts.push(`${timeLeft.hours}h`);
      if (timeLeft.minutes > 0) {
        parts.push(`${timeLeft.minutes}m`);
      }
    } else if (timeLeft.minutes > 0) {
      parts.push(`${timeLeft.minutes}m`);
      if (timeLeft.seconds > 0) {
        parts.push(`${timeLeft.seconds}s`);
      }
    } else {
      parts.push(`${timeLeft.seconds}s`);
    }

    return `Starting in ${parts.join(' ')}`;
  };

  const displayString = formatCountdown();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2.5 w-2.5 rounded-full bg-blue-500 ${
          timeLeft.total <= 0 ? '' : 'animate-pulse'
        }`}
      ></div>
      <span className="text-sm font-medium capitalize">{displayString}</span>
    </div>
  );
};

export default Countdown;
