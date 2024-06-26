import React, { useEffect, useRef } from 'react';
import './bounce.css';

const Bounce = ({ src, width }) => {
  const gifRef = useRef(null); // Create a reference for the GIF element

  useEffect(() => {
      const bounce = () => {
      const gif = gifRef.current;
      if (gif) {
        const { innerWidth, innerHeight } = window;
        const gifWidth = gif.clientWidth;
        const gifHeight = gif.clientHeight;
        
        // Ensure the GIF stays within the viewport
        const randomX = Math.random() * (innerWidth - gifWidth);
        const randomY = Math.random() * (innerHeight - gifHeight);
        
        gif.style.left = `${randomX}px`;
        gif.style.top = `${randomY}px`;
      }
      };

    // Initial call to position the GIF when the component mounts
    bounce();

    // Set interval to call bounce every second
    const intervalId = setInterval(bounce, 2500); // Change direction every second

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="Bounce">
      <img
        ref={gifRef} // Attach the reference to the img element
        src={src}
        alt="Moving GIF"
        width={width}
        className="moving-gif"
      />
    </div>
  );
};

export default Bounce;
