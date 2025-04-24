import React, { useState, useEffect } from 'react';

const DesactivarMascota = ({ mascotaId, onDesactivacionExitosa }) => {
  const [codRefugio, setCodRefugio] = useState('');
  const [password, setPassword] = useState('');
  const [refugios, setRefugios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar códigos de refugios
  useEffect(() => {
    const fetchRefugios = async () => {
      try {
        const response = await fetch('/api/refugios/codigos');
        const data = await response.json();
        setRefugios(data);
      } catch (error) {
        console.error('Error al cargar refugios:', error);
        setError('Error al cargar lista de refugios');
      }
    };

    fetchRefugios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mascotaId) {
      setError('ID de animal no proporcionado');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Primero verificar la contraseña
      const verifyResponse = await fetch('/api/verificar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codRefugio,
          password
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.verified) {
        throw new Error('Contraseña incorrecta');
      }

      // Si la contraseña es correcta, proceder con la desactivación
      const desactivarResponse = await fetch(`/api/mascotas/${mascotaId}/desactivar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codRefugio,
          password
        }),
      });

      const desactivarData = await desactivarResponse.json();

      if (!desactivarResponse.ok) {
        throw new Error(desactivarData.message || 'Error al desactivar el animal');
      }

      if (onDesactivacionExitosa) {
        onDesactivacionExitosa();
      }
      setPassword('');
      setCodRefugio('');
      alert('Animal desactivado exitosamente');
    } catch (error) {
      setError(error.message || 'Error al desactivar el animal');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxWidth: '300px',
      margin: '1rem 0'
    },
    select: {
      padding: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '4px'
    },
    input: {
      padding: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '4px'
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    buttonDisabled: {
      backgroundColor: '#999',
      cursor: 'not-allowed'
    },
    error: {
      color: 'red',
      fontSize: '0.875rem'
    }
  };

  return (
    <div>
      <h3>Desactivar Animal #{mascotaId}</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <select
          value={codRefugio}
          onChange={(e) => setCodRefugio(e.target.value)}
          style={styles.select}
          required
        >
          <option value="">Seleccionar Refugio</option>
          {refugios.map((codigo) => (
            <option key={codigo} value={codigo}>
              {codigo}
            </option>
          ))}
        </select>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña del refugio"
          style={styles.input}
          required
        />
        
        <button 
          type="submit" 
          disabled={loading || !password || !codRefugio}
          style={{
            ...styles.button,
            ...(loading || !password || !codRefugio ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'Desactivando...' : 'Desactivar Animal'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

// Ejemplo de uso en el AdminPanel
const AdminPanel = () => {
  const [mascotas, setMascotas] = useState([]);
  const [selectedMascota, setSelectedMascota] = useState(null);

  const fetchMascotas = async () => {
    try {
      const response = await fetch('/api/mascotas');
      const data = await response.json();
      setMascotas(data);
    } catch (error) {
      console.error('Error al obtener mascotas:', error);
    }
  };

  const handleDesactivacionExitosa = () => {
    setSelectedMascota(null);
    fetchMascotas();
  };

  return (
    <div>
      <h2>Panel de Administración</h2>
      
      {/* Lista de mascotas */}
      <div>
        {mascotas.map(mascota => (
          <div key={mascota.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
            <h3>{mascota.nombre}</h3>
            <button 
  onClick={() => setSelectedMascota(mascota)}
  
>
  Desactivar
</button>
          </div>
        ))}
      </div>

      {selectedMascota && (
        <DesactivarMascota 
          mascotaId={selectedMascota.id}
          onDesactivacionExitosa={handleDesactivacionExitosa}
        />
      )}
    </div>
  );
};

export default AdminPanel;