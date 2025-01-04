import React, { useEffect, useState } from "react";
import "./CurrentTimeLine.css"; // CSS for the line

const CurrentTimeLine = () => {
  const [positionTop, setPositionTop] = useState(calculatePosition());

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionTop(calculatePosition());
    }, 60000); // Update every minute

    return () => clearInterval(interval); // Clean up the interval
  }, []);

  function calculatePosition() {
    const now = new Date();
    const minutesSinceStartOfDay = now.getHours() * 60 + now.getMinutes();
    return (minutesSinceStartOfDay / (24 * 60)) * 100; // Calculate percentage position
  }

  return <div className="current-time-line" style={{ top: `${positionTop}%` }} />;
};

export default CurrentTimeLine;
