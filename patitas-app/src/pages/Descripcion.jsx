import Navbar from '../components/Navbar';
import './descripcion.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const MascotaDetalle = () => {
  const [mascota, setMascota] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Determinar si estamos en desarrollo o producción
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiBaseUrl = isDevelopment ? 'http://localhost:5000' : '';
  
  useEffect(() => {
    const fetchMascota = async () => {
      try {
        console.log(`Fetcheando datos desde: ${apiBaseUrl}/api/mascotas/${id}`);
        const response = await axios.get(`${apiBaseUrl}/api/mascotas/${id}`);
        setMascota(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener detalles del animal:', error);
        setError('Error al cargar la información del animal. Por favor, intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMascota();
  }, [id, apiBaseUrl]);
  
  const parseDescription = (fullDescription) => {
    if (!fullDescription) return { mainDescription: '', vaccinated: '', neutered: '' };
    
    const vaccinationMatch = fullDescription.match(/¿Tengo mis vacunas al día\? (Sí|No)/);
    const neuteredMatch = fullDescription.match(/¿Estoy castrado\/a\? (Sí|No)/);
    
    let mainDescription = fullDescription
      .replace(/¿Tengo mis vacunas al día\? (Sí|No)/g, '')
      .replace(/¿Estoy castrado\/a\? (Sí|No)/g, '')
      .trim();
    
    return {
      mainDescription,
      vaccinated: vaccinationMatch ? vaccinationMatch[0] : '',
      neutered: neuteredMatch ? neuteredMatch[0] : ''
    };
  };
  
  // Función para manejar el clic en el botón Volver
  const handleVolverClick = (e) => {
    e.preventDefault();
    console.log("Botón Volver clickeado");
    navigate('/adoptar');
  };
  
  if (error) return <div className="error-message">{error}</div>;
  if (loading) return <div className="loading-message">Cargando información del animal...</div>;
  if (!mascota) return <div className="error-message">No se encontró información para este animal.</div>;
  
  const { mainDescription, vaccinated, neutered } = parseDescription(mascota.descripcion || '');
  
  return (
    <div className="pagina-contenedor">
      <Navbar />
      <div className="mascota-detalle-pagina">
        <div className="mascota-detalle-contenedor">
          <div className="mascota-imagenes-contenedor">
            {mascota.imagen_url ? (
              <img src={mascota.imagen_url} alt={mascota.nombre} className="mascota-imagen-principal" />
            ) : (
              <p>No hay imagen disponible</p>
            )}
          </div>
          <div className="mascota-info-contenedor">
            <h1 className="mascota-nombre">{mascota.nombre}</h1>
            <h5 className='mascota-codigo'>Cod: {mascota.cod_refugio}</h5>
            <div className="mascota-detalles">
              <p><strong>Especie:</strong> {mascota.especie}</p>
              <p><strong>Edad:</strong> {mascota.edad}</p>
              <p><strong>Sexo:</strong> {mascota.sexo}</p>
              <div className="mascota-descripcion">
                <p><strong>Más sobre mí:</strong> {mainDescription}</p>
                {vaccinated && <p><strong>{vaccinated}</strong></p>}
                {neutered && <p><strong>{neutered}</strong></p>}
              </div>
            </div>
            <p className="whatsapp">
              Envía un WhatsApp al {mascota.numero_contacto} preguntando por {mascota.nombre}!
            </p>
            <div className="button-container">
              <button 
                className="volver-btn" 
                onClick={handleVolverClick}
                onTouchEnd={(e) => { e.preventDefault(); handleVolverClick(e); }}
              >
                Volver al listado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MascotaDetalle;