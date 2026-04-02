import React, { useEffect, useState } from "react";

interface TypedTextProps {
  text: string;
  delay?: number;
}

export const TypedText: React.FC<TypedTextProps> = ({ text, delay = 50 }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="inline-block w-[2px] h-[1em] bg-indigo-400 ml-0.5 align-middle animate-blink" />
    </span>
  );
};
