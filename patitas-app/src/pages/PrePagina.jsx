import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaPaw } from 'react-icons/fa';
import './prepagina.css';
import cachorros from '../assets/images/Cachorros.png';

const PrePagina = () => {
  const navigate = useNavigate();
  
  // Manejar el problema de scrolling en Chrome móvil
  useEffect(() => {
    // Forzar reflujo para corregir problemas de renderizado en Chrome móvil
    window.scrollTo(0, 0);
    
    // Mejorar el manejo de eventos táctiles
    const handleTouchMove = (e) => {
      // Evitar que los elementos que no necesitan manejar eventos táctiles los intercepten
      if (!e.target.closest('.prepagina-btn')) {
        // Permitir el comportamiento normal para otros elementos
        e.stopPropagation();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleConocelosClick = () => {
    console.log("Botón de adoptar clickeado");
    navigate('/adoptar');
  };
  
  return (
    <div className="pre-pagina">
      <div className="advertencia">
        <FaExclamationTriangle className="icono-advertencia" />
        <h2>Antes de adoptar</h2>
      </div>
      <h1 className="titulo-requisitos">REQUISITOS DE ADOPCIÓN</h1>
      <div className="requisitos-container">
        <div className="requisitos-columna">
          <div className="requisito">
            <FaPaw className="icono-pata" />
            <p>El hogar debe contar con los recursos económicos para cubrir los gastos de alimentación, atención médica y otros cuidados necesarios.</p>
          </div>
          <div className="requisito">
            <FaPaw className="icono-pata" />
            <p>No se entregarán animales a menores de edad sin el consentimiento y supervisión de un adulto responsable.</p>
          </div>
          <div className="requisito">
            <FaPaw className="icono-pata" />
            <p>Se realizará un seguimiento post-adopción para asegurarnos de que el animal se encuentra en buenas condiciones.</p>
          </div>
        </div>
        <img src={cachorros} alt="Cachorros" className="imagen-cachorros" />
        <div className="requisitos-columna">
          <div className="requisito">
            <FaPaw className="icono-pata" />
            <p>Los animales mayores de 6 meses se entregarán castrados. En el caso de adoptar un cachorro más joven, el adoptante se compromete a castrarlo entre los 6 y 12 meses de edad, de manera obligatoria.</p>
          </div>
          <div className="requisito">
            <FaPaw className="icono-pata" />
            <p>La asociación que albergue al animal se reserva el derecho de aprobar o rechazar una postulación según sus valores y criterios.</p>
          </div>
          <div className="requisito">
            <FaPaw className="icono-pata" />
            <p>Los adoptantes deberán comprometerse a nunca abandonar al animal y devolverlo al refugio si no pueden seguir cuidándolo.</p>
          </div>
        </div>
      </div>
      <div className="requisito">
        <FaPaw className="icono-pata" />
        <p>Los animales serán entregados tras una entrevista, donde evaluaremos si el potencial hogar cumple con los requisitos necesarios.</p>
      </div>
      <p className="texto-info">
        Si estás preparado para asumir este desafío lleno de amor, es hora de dar el siguiente paso. 
        Juntos podremos hacer realidad el sueño de una segunda oportunidad para uno de nuestros
        residentes y darle la bienvenida a un compañero incondicional en tu vida.
      </p>
      <div className="boton-container">
        <button
          className="prepagina-btn"
          onClick={handleConocelosClick}
          // Cambiamos onTouchEnd por onClick ya que onClick maneja mejor los eventos táctiles en React
          type="button"
        >
          <span className="texto-boton">¡Adoptar!</span>
          <FaPaw className="icono-pata-boton" />
        </button>
      </div>
    </div>
  );
};

export default PrePagina;