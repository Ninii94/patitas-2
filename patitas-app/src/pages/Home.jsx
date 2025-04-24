import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Deslizable from '../components/Deslizable';
import Footer from '../components/Footer';
import portada from '../assets/images/portada.gif';
import cuidadosImg from '../assets/images/cuidados.jpg';
import SecundarioFooter from '../components/SecundarioFooter';
import bannerImg from '../assets/images/banner.png';
import './home.css'

const Home = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const bannerContainerRef = useRef(null);
  
  const bannerImages = [
    {
      src: cuidadosImg,
      alt: "Cuidados veterinarios",
      title: "Servicios de cuidado animal"
    },
    {
      src: bannerImg,
      alt: "Campaña de vacunación",
      title: "Vacunación y servicios preventivos"
    }
  ];
  
  // Función para manejar el cambio de banner
  const changeBanner = (direction) => {
    setCurrentBanner(prev => {
      if (direction === 'next') {
        return (prev + 1) % bannerImages.length;
      } else {
        return prev === 0 ? bannerImages.length - 1 : prev - 1;
      }
    });
  };
  
  // Manejadores de eventos táctiles
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    const difference = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Mínima distancia para considerar como swipe
    
    if (Math.abs(difference) > minSwipeDistance) {
      if (difference > 0) {
        // Deslizar hacia la izquierda (siguiente)
        changeBanner('next');
      } else {
        // Deslizar hacia la derecha (anterior)
        changeBanner('prev');
      }
    }
  };
  
  // Rotación automática
  useEffect(() => {
    const timer = setInterval(() => {
      changeBanner('next');
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="home">
      <Navbar />
      <div className="home-image-container">
        <img src={portada} alt="Veterinaria" className="home-responsive-image" />
      </div>
      <Deslizable />
      <div 
        className="home-banner-container"
        ref={bannerContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {bannerImages.map((img, index) => (
          <div
            key={index}
            className={`home-banner-slide ${index === currentBanner ? 'active' : ''}`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="home-banner-image"
              style={{
                objectFit: 'contain',
                backgroundColor: '#f0f0f0'
              }}
            />
          </div>
        ))}
        <div className="home-banner-dots">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              className={`home-dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
      <Footer className="home-footer" />
      <SecundarioFooter />
    </div>
  );
};

export default Home;