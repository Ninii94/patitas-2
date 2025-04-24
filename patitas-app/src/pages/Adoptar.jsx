import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import PatitaLoading from '../components/PatitaLoading';
import './adoptar.css';

const MascotaCard = ({ id, nombre, especie, sexo, imagen_url }) => (
  <Link to={`/mascota/${id}`} className="mascota-card">
    {imagen_url && <img src={imagen_url} alt={nombre} className="mascota-imagen" />}
    <h3>{nombre}</h3>
    <p>{`${especie} (${sexo})`}</p>
  </Link>
);

const Adoptar = () => {
  const [mascotas, setMascotas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determinar si estamos en desarrollo o producción
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiBaseUrl = isDevelopment ? 'http://localhost:5000' : '';

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        console.log(`Fetcheando datos desde: ${apiBaseUrl}/api/mascotas`);
        const response = await axios.get(`${apiBaseUrl}/api/mascotas`);

        console.log('Datos recibidos:', response.data);
        setMascotas(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener mascotas:', error);
        
        // Mensaje de error más detallado
        if (error.code === 'ERR_NETWORK') {
          setError('Error de conexión. Verifica que el servidor esté funcionando.');
        } else if (error.response) {
          setError(`Error ${error.response.status}: ${error.response.statusText}`);
        } else {
          setError('Error al cargar las mascotas. Por favor, intente nuevamente más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMascotas();
  }, [apiBaseUrl]);

  const mascotasFiltradas = mascotas && mascotas.length > 0 
    ? (filtro === 'todos'
        ? mascotas
        : mascotas.filter(mascota => {
            const tipo = `${mascota.especie?.toLowerCase()}_${mascota.sexo?.toLowerCase()}`;
            return tipo === filtro;
          }))
    : [];

  return (
    <div className="adoptar-page">
      <Navbar />
      <div className="filtro-container">
        <button className="filtro-btn" onClick={() => setFiltro('todos')}>
          <FaFilter /> Todos
        </button>
        <button className="filtro-btn" onClick={() => setFiltro('canina_macho')}>Perrito</button>
        <button className="filtro-btn" onClick={() => setFiltro('canina_hembra')}>Perrita</button>
        <button className="filtro-btn" onClick={() => setFiltro('felina_macho')}>Gatito</button>
        <button className="filtro-btn" onClick={() => setFiltro('felina_hembra')}>Gatita</button>
      </div>
      
      {loading ? (
        <PatitaLoading />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Intentar nuevamente
          </button>
        </div>
      ) : mascotasFiltradas.length === 0 ? (
        <div className="no-mascotas-message">
          <p>No hay animales disponibles que coincidan con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="mascotas-grid">
          {mascotasFiltradas.map(mascota => (
            <MascotaCard
              key={mascota.id}
              id={mascota.id}
              nombre={mascota.nombre}
              especie={mascota.especie}
              sexo={mascota.sexo}
              imagen_url={mascota.imagen_url}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Adoptar;