import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPaw } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import './gestion.css';
import crying from '../assets/images/crying.gif';

// Determinar si estamos en desarrollo o producción
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isDevelopment ? 'http://localhost:5000' : '';

const api = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Componente Modal de Devolución simplificado (sin contraseña)
const DevolucionModal = ({ isOpen, onClose, mascota, onConfirm }) => {
  const [error, setError] = useState(null);
  const [motivo, setMotivo] = useState('');

  const motivosDevolucion = [
    'Problemas de comportamiento',
    'Alergias',
    'Incompatibilidad con otros animales',
    'Problemas de salud del animal',
    'Restricciones de vivienda',
    'Otro'
  ];

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setMotivo('');
    }
  }, [isOpen]);

  const handleConfirmDevolucion = async () => {
    if (!motivo) {
      setError('Por favor selecciona un motivo');
      return;
    }

    try {
      await api.put(`/api/mascotas/${mascota.id}/devolver`, {
        motivo_devolucion: motivo,
        fecha_devolucion: new Date().toISOString().split('T')[0]
      });

      onConfirm();
      setError(null);
      onClose();
    } catch (error) {
      setError('Error al procesar la devolución');
      console.error('Error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="adop-modal-overlay">
      <div className="adop-modal-content">
        <h2>Lamentamos que devuelvan a {mascota?.nombre}</h2>
        
        <img src={crying} alt="Perro llorando" className="adop-crying-gif" />

        {error && <p className="adop-error-message">{error}</p>}
        
        <div className="adop-motivo-container">
          <p>Por favor selecciona un motivo de devolución:</p>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="adop-select-motivo"
          >
            <option value="">Selecciona un motivo</option>
            {motivosDevolucion.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="adop-modal-buttons">
            <button 
              onClick={onClose} 
              className="adop-button-cancel"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDevolucion}
              disabled={!motivo}
              className="adop-button-confirm"
            >
              Confirmar Devolución
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar cada mascota adoptada
const AdoptedPetItem = ({ mascota, onDevolver }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="adop-panel-mascota-item">
      {mascota.imagen_url && (
        <img 
          src={mascota.imagen_url} 
          alt={mascota.nombre} 
          className="adop-panel-mascota-thumbnail" 
        />
      )}
      <div className="adop-panel-mascota-info">
        <p><strong></strong> {mascota.cod_refugio || 'No disponible'}</p>
        <p><strong>Nombre:</strong> {mascota.nombre || 'No disponible'}</p>
        <p><strong>Edad:</strong> {mascota.edad || 'No disponible'}</p>
        <p><strong>Sexo:</strong> {mascota.sexo || 'No disponible'}</p>
        <p><strong>Especie:</strong> {mascota.especie || 'No disponible'}</p>
        <p><strong>Cuidado por:</strong> {mascota.nombre_refugio || 'No disponible'}</p>
        <p><strong>Fecha de adopción:</strong> {formatDate(mascota.fecha_adopcion)}</p>
        <button 
          className="adop-button-resubir"
          onClick={() => onDevolver(mascota)}
        >
          Resubir a {mascota.nombre}
        </button>
      </div>
    </div>
  );
};

// Componente de Filtros
const FiltrosSection = ({ filtroRefugio, codigosRefugio, onFiltroChange }) => (
  <div className="adop-filtro-container">
    <label htmlFor="filtroRefugio" className="adop-filtro-label">
      Filtrar por código:
    </label>
    <select
      id="filtroRefugio"
      value={filtroRefugio}
      onChange={onFiltroChange}
      className="adop-filtro-select"
    >
      <option value="">Todos</option>
      {codigosRefugio.map((codigo) => (
        <option key={codigo} value={codigo}>{codigo}</option>
      ))}
    </select>
  </div>
);

// Componente principal GestionAdopciones
const GestionAdopciones = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [mascotasAdoptadas, setMascotasAdoptadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroRefugio, setFiltroRefugio] = useState("");
  const [codigosRefugio, setCodigosRefugio] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);

  const fetchCodigosRefugio = async () => {
    try {
      const response = await api.get("/api/refugios/codigos");
      setCodigosRefugio(response.data);
    } catch (error) {
      console.error("Error al obtener códigos de refugio:", error);
      enqueueSnackbar("Error al cargar códigos de refugio", { variant: 'error' });
    }
  };

  const fetchMascotasAdoptadas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mascotas/adoptadas');
      setMascotasAdoptadas(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error al obtener mascotas adoptadas:', error);
      setError('Error al cargar mascotas adoptadas');
      enqueueSnackbar("Error al cargar mascotas adoptadas", { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMascotasAdoptadas();
    fetchCodigosRefugio();
  }, []);

  const handleFiltroChange = (e) => {
    setFiltroRefugio(e.target.value);
  };

  const handleDevolver = (mascota) => {
    setSelectedMascota(mascota);
    setModalOpen(true);
  };

  const handleDevolucionConfirmada = () => {
    fetchMascotasAdoptadas();
    enqueueSnackbar("Animal actualizado exitosamente", { variant: 'success' });
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="adop-loading-container">
        <FaPaw className="adop-loading-icon" />
        <p>Cargando...</p>
      </div>
    );
  }

  const mascotasFiltradas = mascotasAdoptadas.filter(
    (mascota) => filtroRefugio === "" || mascota.cod_refugio === filtroRefugio
  );

  return (
    <div className="adop-panel-container">
      <div className="adop-navigation-buttons">
        <button 
          onClick={() => handleNavigation('/dashboard')} 
          className="adop-back-button"
        >
          Volver atrás
        </button>
      </div>

      <div className="adop-panel-titulo-container">
        <FaPaw className="adop-panel-patita" />
        <h2>Gestión de Adopciones</h2>
        <FaPaw className="adop-panel-patita2" />
      </div>

      <FiltrosSection 
        filtroRefugio={filtroRefugio}
        codigosRefugio={codigosRefugio}
        onFiltroChange={handleFiltroChange}
      />

      {error && (
        <div className="adop-error-container">
          <p>{error}</p>
        </div>
      )}

      <div className="adop-panel-mascotas-list">
        {mascotasFiltradas.length === 0 ? (
          <div className="adop-no-results">
            <p>No se encontraron animales adoptados</p>
          </div>
        ) : (
          mascotasFiltradas.map((mascota) => (
            <AdoptedPetItem 
              key={mascota.id}
              mascota={mascota}
              onDevolver={handleDevolver}
            />
          ))
        )}
      </div>

      {modalOpen && (
        <DevolucionModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          mascota={selectedMascota} 
          onConfirm={handleDevolucionConfirmada}
        />
      )}
    </div>
  );
};

export default GestionAdopciones;