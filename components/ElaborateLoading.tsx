import React, { useState, useEffect, useMemo } from 'react';

interface ElaborateLoadingProps {
  studentName: string;
}

const ElaborateLoading: React.FC<ElaborateLoadingProps> = ({ studentName }) => {
  const messages = useMemo(() => [
    "Consultando a las musas de la creatividad...",
    "Tejiendo palabras para una historia mágica...",
    `Añadiendo a ${studentName} como protagonista...`,
    "Diseñando desafíos divertidos y educativos...",
    "¡Los últimos toques! Tu aventura está por comenzar."
  ], [studentName]);

  const [messageIndex, setMessageIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const currentMessage = messages[messageIndex];
    let charIndex = 0;
    
    let timeoutId: ReturnType<typeof setTimeout>;

    const typingInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setTypedText((prev) => prev + currentMessage.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        timeoutId = setTimeout(() => {
          setTypedText('');
          setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 2000); // Pause before next message
      }
    }, 50); // Typing speed

    return () => {
      clearInterval(typingInterval);
      clearTimeout(timeoutId);
    };
  }, [messageIndex, messages]);

  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-4 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg">
        <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full text-purple-500" viewBox="0 0 100 100">
                {/* Wand */}
                <g transform="rotate(-45 50 50)">
                    <rect x="47" y="20" width="6" height="60" rx="3" fill="currentColor" />
                    <circle cx="50" cy="15" r="8" fill="currentColor" />
                </g>
                {/* Sparkles */}
                <circle cx="20" cy="20" r="3" className="animate-ping opacity-75" style={{ animationDelay: '0s', color: '#fcd34d' }} fill="currentColor" />
                <circle cx="80" cy="30" r="4" className="animate-ping opacity-75" style={{ animationDelay: '0.5s', color: '#a78bfa' }} fill="currentColor" />
                <circle cx="30" cy="75" r="5" className="animate-ping opacity-75" style={{ animationDelay: '1s', color: '#f472b6' }} fill="currentColor" />
                <circle cx="70" cy="80" r="3" className="animate-ping opacity-75" style={{ animationDelay: '1.5s', color: '#60a5fa' }} fill="currentColor" />
            </svg>
        </div>

        <p className="text-xl font-semibold text-slate-700 min-h-[56px] w-full max-w-md">
            {typedText}
            <span className="blinking-cursor">|</span>
        </p>
        <p className="text-slate-500 mt-2">Creando una aventura de aprendizaje única...</p>
    </div>
  );
};

export default ElaborateLoading;
