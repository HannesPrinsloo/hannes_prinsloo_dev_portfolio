import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 50, startDelay: number = 0) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        let intervalId: ReturnType<typeof setInterval>;

        setDisplayedText('');
        setIsTyping(false);

        const startTyping = () => {
            setIsTyping(true);
            let currentIndex = 0;

            intervalId = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText((prev) => prev + text.charAt(currentIndex));
                    currentIndex++;
                } else {
                    setIsTyping(false);
                    clearInterval(intervalId);
                }
            }, speed);
        };

        timeoutId = setTimeout(startTyping, startDelay);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [text, speed, startDelay]);

    return { displayedText, isTyping };
};
