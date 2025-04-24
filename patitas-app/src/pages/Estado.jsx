import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import './estado.css';

// Determinar si estamos en desarrollo o producción
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isDevelopment ? 'http://localhost:5000' : '';

const Estado = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRefugio, setSelectedRefugio] = useState('all');
  const [codigosRefugio, setCodigosRefugio] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(`${baseURL}/api/mascotas/estado`);
        if (!response.ok) {
          throw new Error(`Error al cargar los datos de los animales (${response.status})`);
        }
        const data = await response.json();
        setPets(data);
      } catch (err) {
        console.error("Error al obtener mascotas:", err);
        setError(err.message);
        return [];
      }
    };

    const fetchCodigosRefugio = async () => {
      try {
        const response = await fetch(`${baseURL}/api/refugios/codigos`);
        if (!response.ok) {
          throw new Error(`Error al obtener códigos de refugio (${response.status})`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("La respuesta no es un JSON válido");
        }
        
        const data = await response.json();
        setCodigosRefugio(data);
        return data;
      } catch (error) {
        console.error("Error al obtener códigos de refugio:", error);
        // No establecemos error global para no interrumpir la carga de mascotas
        return [];
      }
    };

    const loadData = async () => {
      setLoading(true);
      try {
        const [petsData, _] = await Promise.all([
          fetchPets(),
          fetchCodigosRefugio()
        ]);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'No disponible';
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  const getStatusClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'adoptado':
        return 'estdo-status-adoptado';
      case 'disponible':
        return 'estdo-status-disponible';
      case 'devuelto':
        return 'estdo-status-devuelto';
      case 'inactivo':
        return 'estdo-status-inactivo';
      case 'reservado':
        return 'estdo-status-reservado';
      case 'en tránsito':
        return 'estdo-status-en-transito';
      default:
        return 'estdo-status-disponible';
    }
  };
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const filteredPets = pets
    .filter(pet => selectedStatus === 'all' || pet.estado === selectedStatus)
    .filter(pet => selectedRefugio === 'all' || pet.cod_refugio === selectedRefugio);

  const uniqueStatuses = ['all', ...new Set(pets.map(pet => pet.estado))];

  if (loading) {
    return (
      <div className="estdo-loading-container">
        <div className="estdo-spinner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="estdo-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="estdo-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="estdo-error">
        <p>Error: {error}</p>
        <button 
          onClick={() => handleNavigation('/dashboard')} 
          className="estdo-back-button"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="estdo-container">
        <button 
          onClick={() => handleNavigation('/dashboard')} 
          className="estdo-back-button"
        >
          Volver atrás
        </button>
      <div className="estdo-controls">
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="estdo-select"
        >
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'Todos los estados' : status}
            </option>
          ))}
        </select>

        <select
          value={selectedRefugio}
          onChange={(e) => setSelectedRefugio(e.target.value)}
          className="estdo-select"
        >
          <option value="all">Todos</option>
          {codigosRefugio.map(codigo => (
            <option key={codigo} value={codigo}>
              {codigo}
            </option>
          ))}
        </select>
      </div>

      <div className="estdo-cards-grid">
        {filteredPets.length > 0 ? (
          filteredPets.map((pet) => (
            <div key={pet.id} className="estdo-card">
              {pet.imagen_url && (
                <div className="estdo-card-image-container">
                  <img 
                    src={pet.imagen_url} 
                    alt={pet.nombre}
                    className="estdo-card-image"
                  />
                </div>
              )}
              <div className="estdo-card-content">
                <div className="estdo-card-header">
                  <h3 className="estdo-card-title">{pet.nombre}</h3>
                  <span className={`estdo-status-tag ${getStatusClass(pet.estado)}`}>
                    {pet.estado}
                  </span>
                </div>
                
                <div className="estdo-info-grid">
                  <div>
                    <span className="estdo-info-label">Especie:</span>
                    <span className="estdo-info-value">{pet.especie}</span>
                  </div>
                  <div>
                    <span className="estdo-info-label">Edad:</span>
                    <span className="estdo-info-value">{pet.edad}</span>
                  </div>
                  <div>
                    <span className="estdo-info-label">Sexo:</span>
                    <span className="estdo-info-value">{pet.sexo}</span>
                  </div>
                  <div>
                    <span className="estdo-info-label">Cuidado por:</span>
                    <span className="estdo-info-value">{pet.nombre_refugio}</span>
                  </div>
                </div>

                <div className="estdo-card-dates">
                  <div>
                    <span className="estdo-info-label">Subido el:</span>
                    <span className="estdo-info-value">{formatDate(pet.fecha_subida)}</span>
                  </div>

                  {pet.fecha_adopcion && (
                    <div>
                      <span className="estdo-info-label">Adoptado el:</span>
                      <span className="estdo-info-value">{formatDate(pet.fecha_adopcion)}</span>
                    </div>
                  )}

                  {pet.fecha_devolucion && (
                    <div>
                      <span className="estdo-info-label">Devuelto el:</span>
                      <span className="estdo-info-value">{formatDate(pet.fecha_devolucion)}</span>
                    </div>
                  )}
                </div>

                {pet.motivo_devolucion && (
                  <div className="estdo-card-section">
                    <p className="estdo-info-label">Motivo de su devolución:</p>
                    <p className="estdo-info-value">{pet.motivo_devolucion}</p>
                  </div>
                )}

                {pet.descripcion && (
                  <div className="estdo-card-section">
                    <p className="estdo-info-label">Descripción:</p>
                    <p className="estdo-info-value">{pet.descripcion}</p>
                  </div>
                )}

                {pet.numero_contacto && (
                  <div className="estdo-card-section">
                    <p className="estdo-info-label">Contacto:</p>
                    <p className="estdo-info-value">{pet.numero_contacto}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="estdo-no-results">
            <p>No se encontraron animales con los filtros seleccionados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estado;