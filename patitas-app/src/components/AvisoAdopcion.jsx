import React, { useEffect, useRef } from 'react';
import { FaPaw, FaTimes } from 'react-icons/fa';
import cachorros from "../assets/images/Cachorros.png"; // Importamos la imagen
import './avisoAdopcion.css';

const AvisoAdopcion = ({ isOpen, onClose, onAdoptar }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    // Bloquear scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    // Prevenir que el scroll del modal afecte a la página
    const handleModalScroll = (e) => {
      e.stopPropagation();
    };

    const modalElement = modalRef.current;
    if (modalElement && isOpen) {
      modalElement.addEventListener('scroll', handleModalScroll);
      return () => {
        modalElement.removeEventListener('scroll', handleModalScroll);
      };
    }
  }, [isOpen]);

  // Función que maneja el clic en el botón "Entendido"
  const handleAdoptarClick = () => {
    // Primero cerramos el modal
    onClose();
    // Luego ejecutamos la función de adoptar, si existe
    if (onAdoptar) {
      onAdoptar();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="aviso-fullscreen" onClick={onClose}>
      <div 
        className="aviso-content" 
        ref={modalRef} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="aviso-title">ANTES DE ADOPTAR</h2>

        <div className="aviso-header">
          <p className="aviso-description">
            Adoptar no es solo darles un techo, sino brindarles un verdadero hogar, 
            con los cuidados y el amor que merecen. Es una decisión que no debe 
            tomarse a la ligera, sino con plena conciencia de la responsabilidad 
            que conlleva. Sin embargo, la recompensa de ofrecerles una segunda 
            oportunidad es invaluable.
          </p>
          <div className="image-container">
            <img src={cachorros} alt="Cachorros" className="cachorros-image" />
          </div>
        </div>

        <h3 className="requisitos-title">REQUISITOS DE ADOPCIÓN</h3>

        <div className="requisitos-container">
          <div className="requisitos-column">
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>
                El hogar debe contar con los recursos económicos para cubrir los 
                gastos de alimentación, atención médica y otros cuidados necesarios.
              </p>
            </div>

            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>
                No se entregarán animales a menores de edad sin el consentimiento 
                y supervisión de un adulto responsable.
              </p>
            </div>
          </div>

          <div className="requisitos-column">
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>
                Se realizará un seguimiento post-adopción para asegurarnos de que 
                el animal se encuentra en buenas condiciones.
              </p>
            </div>
            
            <div className="requisito-item">
              <FaPaw className="paw-icon" />
              <p>
                Es necesario contar con un espacio adecuado para la mascota según 
                su tamaño y características.
              </p>
            </div>
          </div>
        </div>

        <div className="aviso-footer">
          <p>
            Al adoptar, te comprometes a brindar cuidados de por vida a tu nuevo 
            compañero, proporcionándole alimentación, atención veterinaria, 
            ejercicio y mucho amor.
          </p>
        </div>

        <button className="conocelos-btn" onClick={handleAdoptarClick}>
          <FaPaw /> ¡Adoptar!
        </button>
      </div>
    </div>
  );
};

export default AvisoAdopcion;