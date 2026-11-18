import React, { useLayoutEffect, useRef } from "react";

interface AutoShrinkTextProps {
  text: string;
  maxFontSize?: number;
  minFontSize?: number;
  step?: number;
  className?: string;
}

/**
 * Shrinks font size down to `minFontSize` when text overflows horizontally,
 * and falls back to tight multi-line wrapping instead of truncating with "...".
 */
const AutoShrinkText: React.FC<AutoShrinkTextProps> = ({
  text,
  maxFontSize = 11,
  minFontSize = 8.5,
  step = 0.5,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fitText = () => {
      el.style.whiteSpace = "nowrap";
      el.style.lineHeight = "";
      el.style.wordBreak = "";

      let currentSize = maxFontSize;
      el.style.fontSize = `${currentSize}px`;

      while (el.scrollWidth > el.clientWidth + 0.5 && currentSize > minFontSize) {
        currentSize = Math.max(minFontSize, currentSize - step);
        el.style.fontSize = `${currentSize}px`;
      }

      if (el.scrollWidth > el.clientWidth + 0.5) {
        el.style.whiteSpace = "normal";
        el.style.lineHeight = "1.1";
        el.style.wordBreak = "break-word";
      }
    };

    fitText();
    window.addEventListener("beforeprint", fitText);
    return () => window.removeEventListener("beforeprint", fitText);
  }, [text, maxFontSize, minFontSize, step]);

  return (
    <span ref={ref} className={`block w-full ${className}`}>
      {text}
    </span>
  );
};

export default AutoShrinkText;
