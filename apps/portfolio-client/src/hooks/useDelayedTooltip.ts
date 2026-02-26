import { useState, useRef, useEffect, useCallback } from 'react';

export function useDelayedTooltip(delayMs = 300, tooltipId = "tooltip") {
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Centralized timer cleanup
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const showTooltip = useCallback(() => {
        clearTimer();
        timerRef.current = setTimeout(() => setIsVisible(true), delayMs);
    }, [delayMs, clearTimer]);

    const hideTooltip = useCallback(() => {
        clearTimer();
        setIsVisible(false);
    }, [clearTimer]);

    // Cleanup: Clear timer if component unmounts
    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    // Accessibility: Close tooltip on Escape key press
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') hideTooltip();
        };
        // Only attach listener when tooltip is visible
        if (isVisible) window.addEventListener('keydown', handleEsc);

        return () => window.removeEventListener('keydown', handleEsc);
    }, [isVisible, hideTooltip]);

    return {
        isVisible,
        // Props to spread onto the triggering button
        triggerProps: {
            onMouseEnter: showTooltip,
            onMouseLeave: hideTooltip,
            onFocus: showTooltip, // For keyboard navigation
            onBlur: hideTooltip,  // For keyboard navigation
            "aria-describedby": isVisible ? tooltipId : undefined,
        },
        // Props to spread onto the tooltip div itself
        tooltipProps: {
            id: tooltipId,
            role: "tooltip",
        }
    };
}
