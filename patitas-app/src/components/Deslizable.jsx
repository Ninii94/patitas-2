import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import AvisoAdopcion from './AvisoAdopcion';
import './deslizable.css';

const Deslizable = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAviso, setShowAviso] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Determinar URL base según el entorno
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiBaseUrl = isDevelopment ? 'http://localhost:5000' : '';

  // Prevenir comportamiento predeterminado en scroll
  const handleScroll = (event) => {
    event.preventDefault();
  }; 
  
  useEffect(() => {
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll, { passive: false });
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []); 
  
  useEffect(() => {
    const fetchMascotasRecientes = async () => {
      try {
        setLoading(true);
        const url = `${apiBaseUrl}/api/mascotas/recientes`;
        console.log('Fetcheando datos desde:', url);
        
        const response = await axios.get(url);
        console.log('Datos recibidos:', response.data);
        
        if (Array.isArray(response.data)) {
          setMascotas(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // Si es un objeto, intentar encontrar el array dentro de él
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            setMascotas(possibleArrays[0]);
          } else {
            console.error('No se encontró un array en la respuesta:', response.data);
            setError('Formato de datos no válido');
            setMascotas([]);
          }
        } else {
          console.error('Formato de respuesta inesperado:', response.data);
          setError('Formato de datos no válido');
          setMascotas([]);
        }
      } catch (error) {
        console.error('Error al obtener mascotas recientes:', error);
        
        // Mensaje de error más detallado
        if (error.code === 'ERR_NETWORK') {
          setError('Error de conexión. Verifica que el servidor esté funcionando.');
        } else if (error.response) {
          setError(`Error ${error.response.status}: ${error.response.statusText}`);
        } else {
          setError('Error al cargar las mascotas');
        }
        
        setMascotas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotasRecientes();
  }, [apiBaseUrl]);

  const nextSlide = () => {
    if (!Array.isArray(mascotas) || mascotas.length <= 4) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (mascotas.length - 3));
  };

  const prevSlide = () => {
    if (!Array.isArray(mascotas) || mascotas.length <= 4) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (mascotas.length - 3)) % (mascotas.length - 3));
  };

  useEffect(() => {
    if (!Array.isArray(mascotas) || mascotas.length <= 4) return;
    
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [mascotas]);

  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    
    const startX = e.pageX - carouselRef.current.offsetLeft;
    const scrollLeft = carouselRef.current.scrollLeft;

    const handleMouseMove = (e) => {
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMascotaClick = (mascota) => {
    setSelectedMascota(mascota);
    setShowAviso(true);
  };

  const closeAviso = () => {
    setShowAviso(false);
  };

  // Esta función será llamada cuando el usuario haga clic en "Quiero adoptarlo"
  const handleAdoptar = () => {
    if (selectedMascota && selectedMascota.id) {
      navigate(`/mascota/${selectedMascota.id}`);
    }
  };

  if (loading) {
    return (
      <div className="carousel-container">
        <h2>Ultimos amigos añadidos</h2>
        <p>Cargando mascotas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-container">
        <h2>Ultimos amigos añadidos</h2>
        <p>Error: {error}</p>
        <p>Por favor, intenta más tarde o contacta al administrador.</p>
      </div>
    );
  }

  // Si no hay mascotas o no es un array, mostrar mensaje
  if (!Array.isArray(mascotas) || mascotas.length === 0) {
    return (
      <div className="carousel-container">
        <h2>Ultimos amigos añadidos</h2>
        <p>No hay mascotas disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <h2>Ultimos amigos añadidos</h2>
      <div className="carousel-wrapper">
        <button 
          className="carousel-button prev" 
          onClick={prevSlide}
          disabled={mascotas.length <= 4}
        >
          &#10094;
        </button>
        <div
          className="carousel"
          ref={carouselRef}
          onMouseDown={handleMouseDown}
        >
          {/* Asegurarse de que mascotas es un array y usar slice seguro */}
          {mascotas.slice(
            currentIndex, 
            Math.min(currentIndex + 4, mascotas.length)
          ).map((mascota) => (
            <div 
              key={mascota.id || Math.random().toString()} 
              className="carousel-item"
              onClick={() => handleMascotaClick(mascota)}
            >
              <img src={mascota.imagen_url} alt={mascota.nombre || 'Mascota'} />
              <p>{mascota.nombre || 'Sin nombre'}</p>
            </div>
          ))}
        </div>
        <button 
          className="carousel-button next" 
          onClick={nextSlide}
          disabled={mascotas.length <= 4}
        >
          &#10095;
        </button>
      </div>
      <Link to="/prepagina" className="ver-mas-btn">
        Ver más <FaPaw className="pata" />
      </Link>
      {showAviso && selectedMascota && (
        <AvisoAdopcion 
          isOpen={showAviso} 
          onClose={closeAviso}
          onAdoptar={handleAdoptar}
        />
      )}
    </div>
  );
};

export default Deslizable;