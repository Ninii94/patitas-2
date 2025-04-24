/*export const API_BASE_URL = 'http://localhost:5000/api';

export const obtenerMascotasAdoptadas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mascotas/adoptar`);
      if (!response.ok) {
        throw new Error('Error al obtener mascotas adoptadas');
      }
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  export const obtenerMascotasInactivas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mascotas/inactivas`);
      if (!response.ok) {
        throw new Error('Error al obtener mascotas inactivas');
      }
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  export const actualizarEstadoMascota = async (id, estado, motivo_devolucion = null) => {
    try {
        const response = await fetch(`${API_BASE_URL}/mascotas/${id}/estado`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado, motivo_devolucion }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar estado de mascota');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }; */