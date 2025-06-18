import { useState, useRef, useCallback } from 'react';
import { findNodeHandle, UIManager, Platform } from 'react-native';

const useTooltip = () => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [measurements, setMeasurements] = useState(null);
    const targetRef = useRef(null);

    // Show tooltip and measure the target element position
    const showTooltip = useCallback(() => {
        measureElement();
        setTooltipVisible(true);
    }, []);

    // Hide tooltip
    const hideTooltip = useCallback(() => {
        setTooltipVisible(false);
    }, []);

    // Toggle tooltip visibility
    const toggleTooltip = useCallback(() => {
        if (tooltipVisible) {
            hideTooltip();
        } else {
            showTooltip();
        }
    }, [tooltipVisible, showTooltip, hideTooltip]);

    // Measure the position and dimensions of the target element
    const measureElement = useCallback(() => {
        if (!targetRef.current) return;

        const handle = findNodeHandle(targetRef.current);

        if (!handle) return;

        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
            setMeasurements({
                x: pageX,
                y: pageY,
                width,
                height
            });
        });
    }, [targetRef]);

    return {
        targetRef,
        tooltipVisible,
        measurements,
        showTooltip,
        hideTooltip,
        toggleTooltip
    };
};

export default useTooltip;