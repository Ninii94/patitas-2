import React, { useEffect, useRef, useState } from 'react';
import patitaGif from './patita.gif'; 

const AnimatedPaw = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pawRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (pawRef.current) {
      observer.observe(pawRef.current);
    }

    return () => {
      if (pawRef.current) {
        observer.unobserve(pawRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={pawRef}
      className={`animated-paw ${isVisible ? 'visible' : ''}`}
    >
      <img 
        src={patitaGif}
        alt="Patita animada" 
        className="paw-gif"
      />
      <p className="paw-text">Buscando tu amigo/a ideal</p>
    </div>
  );
};


export default AnimatedPaw;