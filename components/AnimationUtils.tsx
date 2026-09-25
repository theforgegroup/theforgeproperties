import React, { useEffect, useRef, useState } from 'react';

/**
 * 1. Scroll-triggered fade-in block
 * Initial state: opacity: 0; transform: translateY(30px)
 * Animated state: opacity: 1; transform: translateY(0)
 * Duration: 0.6s
 * Easing: cubic-bezier(0.4, 0, 0.2, 1)
 * Delay: stagger children by 0.1s each
 */
interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in seconds (e.g. 0.1, 0.2)
  id?: string;
}

export const ScrollFade: React.FC<ScrollFadeProps> = ({
  children,
  className = '',
  delay = 0,
  id
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={domRef}
      id={id}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDelay: delay > 0 ? `${delay}s` : undefined
      }}
      className={className}
    >
      {children}
    </div>
  );
};

/**
 * 3. Stats bar — number count-up animation
 * When the stats section scrolls into view, all numbers should count up from 0 to their final value over 1.5 seconds using a smooth easing function.
 */
interface CountUpProps {
  value: string | number;
  durationMs?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  durationMs = 1500,
  className = ''
}) => {
  // Extract numeric prefix and non-numeric suffix, e.g. "50+" -> 50, "+" or "100%" -> 100, "%"
  const str = String(value).trim();
  const match = str.match(/^([\d.,]+)(.*)$/);
  const rawNum = match ? parseFloat(match[1].replace(/,/g, '')) : NaN;
  const suffix = match ? match[2] : '';

  const [displayValue, setDisplayValue] = useState<string>(() => (isNaN(rawNum) ? str : '0'));
  const domRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = domRef.current;
    if (!el || isNaN(rawNum)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const startTime = performance.now();

          const update = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Smooth easeOutCubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(rawNum * ease);
            setDisplayValue(`${current.toLocaleString()}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              setDisplayValue(`${rawNum.toLocaleString()}${suffix}`);
            }
          };

          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rawNum, suffix, str, durationMs]);

  return (
    <span ref={domRef} className={className}>
      {displayValue}
    </span>
  );
};

/**
 * 7. Section dividers — animated gold/accent line to purple #774DFF
 * When they scroll into view, animate their width from 0% to 100% over 0.8s.
 */
interface AnimatedDividerProps {
  className?: string;
}

export const AnimatedDivider: React.FC<AnimatedDividerProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={domRef} className={`w-full overflow-hidden flex justify-center py-2 ${className}`}>
      <div
        className="h-[2px] bg-gradient-to-r from-transparent via-[#774DFF] to-transparent transition-all ease-out"
        style={{
          width: isVisible ? '100%' : '0%',
          transitionDuration: '800ms'
        }}
      />
    </div>
  );
};

/**
 * 9. Image sections — parallax effect
 * Background image moves at 0.5x scroll speed.
 */
interface ParallaxBackgroundProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  overlayClassName?: string;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  imageUrl,
  alt = 'Background image',
  className = '',
  overlayClassName = 'bg-[#0F172A]/85'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Relative scroll distance from center of viewport * 0.5
            const scrollOffset = (rect.top - window.innerHeight * 0.3) * 0.5;
            setOffsetY(scrollOffset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-[125%] object-cover object-center absolute -top-[12%] left-0 transition-transform duration-75 will-change-transform"
        style={{
          transform: `translate3d(0, ${offsetY}px, 0)`
        }}
      />
      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
    </div>
  );
};
