import React, { useEffect, useRef, useState } from 'react';

const AnimatedCounter = ({ value, decimals = 0, duration = 600, style = {} }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to   = value;
    prevRef.current = to;
    if (from === to) return;

    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p  = Math.min((ts - start) / duration, 1);
      const e  = 1 - Math.pow(1 - p, 3); // ease-out-cubic
      setDisplay(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
      else setDisplay(to);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {typeof display === 'number' ? display.toFixed(decimals) : display}
    </span>
  );
};

export default AnimatedCounter;
