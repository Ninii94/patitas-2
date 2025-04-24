import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPaw } from 'react-icons/fa';
import './panel.css';
import { useSnackbar } from 'notistack';

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

const CLOUDINARY_CONFIG = {
  cloudName: 'dukljwnwm',
  uploadPreset: 'Mascotas'
};


// Modales
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

// Diálogo de confirmación simplificado (sin contraseña)
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="modal-header">
      <h2>{title}</h2>
    </div>
    <div className="modal-body">
      <p>{message}</p>
    </div>
    <div className="modal-footer">
      <button className="modal-button secondary" onClick={onClose}>
        Cancelar
      </button>
      <button className="modal-button primary" onClick={onConfirm}>
        Confirmar
      </button>
    </div>
  </Modal>
);

const AdoptionDialog = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="modal-header">
      <h2>🐱Confirmar Adopción🐶</h2>
    </div>
    <div className="modal-body">
      <p>Al presionar "SI" sera movido a "GESTION DE ADOPCIONES"  </p> 
    </div>
    <div className="modal-footer">
      <button 
        className="modal-button secondary" 
        onClick={onClose} 
      >
        Cancelar
      </button>
      <button 
        className="modal-button primary" 
        onClick={() => onConfirm(true)}
      >
        Sí
      </button>
    </div>
  </Modal>
);

const ImageUploader = ({ onImageUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    try {
      console.log("Subiendo imagen a Cloudinary...");
      console.log("Configuración Cloudinary:", CLOUDINARY_CONFIG);
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        formData
      );
      
      console.log("Respuesta de Cloudinary:", response.data);
      
      if (response.data && response.data.secure_url) {
        console.log("URL obtenida:", response.data.secure_url);
        onImageUpload(response.data.secure_url);
        setUploadError(null);
      } else {
        console.error("No se recibió una URL segura de Cloudinary");
        setUploadError("Error al procesar la imagen subida");
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setUploadError("Error al subir la imagen: " + (error.response?.data?.error?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-uploader-container">
      <input 
        type="file" 
        onChange={handleFileChange} 
        accept="image/*" 
        disabled={isUploading}
        className="image-upload-input"
      />
      {isUploading && <p className="upload-status">Subiendo imagen...</p>}
      {uploadError && <p className="upload-error">{uploadError}</p>}
    </div>
  );
};

const PetListItem = ({ mascota, onEdit, onDelete, onDeactivate  }) => (
  <div className="panel-mascota-item">
    {mascota.imagen_url && (
      <img 
        src={mascota.imagen_url} 
        alt={mascota.nombre} 
        className="panel-mascota-thumbnail" 
      />
    )}
    <div className="panel-mascota-info">
      <p><strong>Cod:</strong> {mascota.cod_refugio || 'No disponible'}</p>
      <p><strong>Nombre:</strong> {mascota.nombre || 'No disponible'}</p>
      <p><strong>Edad:</strong> {mascota.edad || 'No disponible'}</p>
      <p><strong>Sexo:</strong> {mascota.sexo || 'No disponible'}</p>
      <p><strong>Especie:</strong> {mascota.especie || 'No disponible'}</p>
    </div>
    <div className="panel-button-group">
      <button 
        className="panel-edit-button" 
        onClick={() => onEdit(mascota)}
      >
        Editar
      </button>
      <button 
        className="panel-delete-button" 
        onClick={() => onDelete(mascota)}
      >
        ¡Adoptado!​ 
       </button>
      <button 
        className="panel-deactivate-button" 
        onClick={() => onDeactivate(mascota)}
      >
        Desactivar
      </button>
    </div>
  </div>
);

// MAIN
const AdminPanel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const initialFormState = {
    Nombre: '',
    Especie: '',
    Edad: '',
    Sexo: '',
    Descripcion: '',
    Telefono: '',
    CodRefugio: '',
    ImagenUrl: ''
  };
  const [mascotas, setMascotas] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [adoptionDialogOpen, setAdoptionDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deactivateConfirmationOpen, setDeactivateConfirmationOpen] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codigosRefugio, setCodigosRefugio] = useState([]);
  const [filtroRefugio, setFiltroRefugio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered] = useState(false);
 
  
 
  const fetchCodigosRefugio = () => {
    api.get("/api/refugios/codigos")
      .then((response) => {
        setCodigosRefugio(response.data);
      })
      .catch((error) =>
        console.error("Error al obtener códigos de refugio:", error)
      );
  };
  useEffect(() => {
    fetchMascotas();
    fetchCodigosRefugio();
  }, []);
  const handleNavigation = (path) => {
    navigate(path); 
  };

  const handleBack = () => {
    handleNavigation('/dashboard');
  };

  const handleSaveAndLogout = () => {
    handleNavigation('/');
  };
 
  const validateEdad = (edad) => {
    const edadRegex = /^(\d+)\s*(años?|meses?|días?)$/i;
    return edadRegex.test(edad);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImageUrl('');
    setEditingId(null);
    setError(null);
    setMessage(null);
    setIsVaccinated(false);
    setIsNeutered(false);
  };

  const handleDeactivationProcess = async () => {
    if (!selectedMascota) {
      setDeactivateConfirmationOpen(false);
      return;
    }

    try {
      const response = await api.put(`/api/mascotas/${selectedMascota.id}/desactivar`, {
        id_estado: 2 
      });

      if (response.status === 200) {
        enqueueSnackbar("Animal desactivado exitosamente", {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
        await fetchMascotas(); 
        setDeactivateConfirmationOpen(false);
      }
    } catch (error) {
      enqueueSnackbar("Error al desactivar el animal", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
      console.error('Error:', error);
    }
  };

  const fetchMascotas = async () => {
    try {
      setLoading(true);
      console.log(`Fetcheando datos desde: ${baseURL}/api/mascotas?estado=disponible`);
      const response = await api.get('/api/mascotas?estado=disponible');
      setMascotas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al obtener mascotas:', error);
      setError('Error al cargar. Por favor, intente nuevamente.');
      setMascotas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptionProcess = async (confirmed) => {
    if (!confirmed || !selectedMascota) {
      setAdoptionDialogOpen(false);
      return;
    }

    try {
      const response = await api.put(`/api/mascotas/${selectedMascota.id}/adoptar`, {
        id_estado: 3 
      });

      if (response.status === 200) {
        enqueueSnackbar("Animal marcado como adoptado exitosamente", {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
        await fetchMascotas(); 
        setAdoptionDialogOpen(false);
        
      }
    } catch (error) {
      enqueueSnackbar("Error al procesar la adopción", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setMessage(null);
  };
  const handleImageUpload = (url) => {
    console.log("URL de imagen recibida:", url);
    setImageUrl(url);
    setFormData(prev => {
      const updatedForm = { ...prev, ImagenUrl: url };
      console.log("Estado del formulario actualizado:", updatedForm);
      return updatedForm;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEdad(formData.Edad)) {
      setError('Formato de edad inválido. Use por ejemplo "2 años" o "9 meses".');
      return;
    } 
    const descriptionWithMarkers = `${formData.Descripcion} ¿Tengo mis vacunas al día? ${isVaccinated ? 'Sí' : 'No'} ¿Estoy castrado/a? ${isNeutered ? 'Sí' : 'No'}`;
    const imagenUrl = formData.ImagenUrl && formData.ImagenUrl.trim() !== '' 
    ? formData.ImagenUrl 
    : null;
    console.log("URL de imagen a enviar:", imagenUrl); 

    const dataToSend = {
      nombre: formData.Nombre,
      especie: formData.Especie,
      edad: formData.Edad,
      sexo: formData.Sexo,
      descripcion:  descriptionWithMarkers,
      numero_contacto: formData.Telefono,
      cod_refugio: formData.CodRefugio,
      imagen_url: formData.ImagenUrl || null,
      estado: 'disponible'
    };
    console.log("Datos a enviar al servidor:", dataToSend);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  try {
    if (editingId) {
      // Mostrar mensaje de carga
      enqueueSnackbar("Actualizando información...", {
        variant: 'info',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });

      console.log(`Actualizando mascota con ID: ${editingId}`, dataToSend);
      
      const response = await api.put(`/api/mascotas/${editingId}`, dataToSend);
      
      console.log("Respuesta de actualización:", response.data);
      
      if (response.status === 200) {
        enqueueSnackbar("Actualizado exitosamente", {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
        resetForm();
        await fetchMascotas();
      }
    } else {

      enqueueSnackbar("Agregando nuevo amigo/a...", {
        variant: 'info',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
      
      console.log("Agregando nueva mascota:", dataToSend);
      
      const response = await api.post('/api/mascotas', dataToSend);
      
      console.log("Respuesta de creación:", response.data);
      
      if (response.status === 201) {
        enqueueSnackbar("Animal agregado exitosamente", {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
        resetForm();
        await fetchMascotas();
      }
    }
  } catch (error) {
    console.error('Error al guardar el animal:', error);
    
    if (error.response) {
   
      console.error('Error de respuesta:', error.response.data);
      
      if (error.response.status === 404) {
        enqueueSnackbar(`No se encontró la mascota con ID: ${editingId}`, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      } else if (error.response.status === 400) {
        enqueueSnackbar(`Error en los datos enviados: ${error.response.data.message || 'Verifique los campos requeridos'}`, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      } else {
        enqueueSnackbar(`Error del servidor: ${error.response.status} - ${error.response.data.message || 'Ocurrió un error al procesar la solicitud'}`, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      }
    } else if (error.request) {
      
      console.error('Error de solicitud:', error.request);
      enqueueSnackbar('No se pudo conectar con el servidor. Verifique su conexión a internet.', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    } else {
    
      console.error('Error general:', error.message);
      enqueueSnackbar(`Error: ${error.message}`, {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    }
  }
};

 
const handleEdit = (mascota) => {
  const description = mascota.descripcion || '';
  const hasVaccines = description.includes('¿Tengo mis vacunas al día? Sí');
  const isNeuteredPet = description.includes('¿Estoy castrado/a? Sí');

  const cleanDescription = description
    .replace(/¿Tengo mis vacunas al día\? (Sí|No)/g, '')
    .replace(/¿Estoy castrado\/a\? (Sí|No)/g, '')
    .trim();

  setFormData({
    Nombre: mascota.nombre,
    Especie: mascota.especie,
    Edad: mascota.edad,
    Sexo: mascota.sexo,
    Descripcion: cleanDescription,
    Telefono: mascota.numero_contacto || '',
    CodRefugio: mascota.cod_refugio,
    ImagenUrl: mascota.imagen_url || ''
  });

  setIsVaccinated(hasVaccines);
  setIsNeutered(isNeuteredPet);
  setImageUrl(mascota.imagen_url || '');
  setEditingId(mascota.id);
  setError(null);
  setMessage(null);
  
  // Destacar que estamos en modo edición
  setIsEditing(true);
  
  // Scroll hacia el formulario - usando un ID específico para mayor precisión
  const formElement = document.getElementById('pet-edit-form');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Opcional: Resaltar el formulario brevemente
    formElement.classList.add('highlight-form');
    setTimeout(() => {
      formElement.classList.remove('highlight-form');
    }, 1500);
    
    // Opcional: Enfocar el primer campo
    const firstInput = formElement.querySelector('input, select');
    if (firstInput) {
      setTimeout(() => {
        firstInput.focus();
      }, 600); // Esperar a que el scroll termine
    }
  } else {
    // Fallback al método original si no se encuentra el elemento
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  // Mostrar mensaje informativo
  enqueueSnackbar(`Editando información de ${mascota.nombre}`, {
    variant: 'info',
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right',
    },
  });
};

const handleDeactivationClick = (mascota) => {
  setSelectedMascota(mascota);
  setDeactivateConfirmationOpen(true);
};

const handleDeleteClick = (mascota) => {
  setSelectedMascota(mascota);
  setDeleteConfirmationOpen(true);
};

  if (loading) {
    return <div className="panel-container">Cargando...</div>;
  }
 
  const mascotasFiltradas = mascotas.filter(
    (mascota) => filtroRefugio === "" || mascota.cod_refugio === filtroRefugio
  );

  return (
    <div className="panel-container">
      <div id="top"></div>
      <div className="navigation-buttons">
        <button onClick={handleBack} className="back-button">
          Volver atrás
        </button>
        <button onClick={handleSaveAndLogout} className="back-button">
          Guardar cambios y cerrar sesión
        </button>
      </div>
      <div className="panel-titulo-container">
        <FaPaw className="panel-patita" />
        <h2>Administración de Animales</h2>
        <FaPaw className="panel-patita2" />
      </div>
  
      <div className="panel-titulo2">
        <h3>{editingId ? 'Modificar' : 'Añadir'} </h3>
      </div>
      <form id="pet-edit-form" className="panel-form" onSubmit={handleSubmit}>
        <select 
          className="panel-input" 
          name="CodRefugio" 
          value={formData.CodRefugio} 
          onChange={handleInputChange} 
          required
        >
          <option value="">Seleccione su codigo</option>
          {codigosRefugio.map((codigo) => (
            <option key={codigo} value={codigo}>
              {codigo}
            </option>
          ))}
        </select>
        <input 
          className="panel-input" 
          name="Nombre" 
          value={formData.Nombre} 
          onChange={handleInputChange} 
          placeholder="Nombre" 
          required 
        />
        <select 
          className="panel-input" 
          name="Especie" 
          value={formData.Especie} 
          onChange={handleInputChange} 
          required
        >
          <option value="">Seleccione especie</option>
          <option value="Canina">Canino</option>
          <option value="Felina">Felino</option>
        </select>
        <input 
          className="panel-input" 
          name="Edad" 
          value={formData.Edad} 
          onChange={handleInputChange} 
          placeholder="Edad (ej. 2 años, 9 meses)" 
          required 
        />
        <select 
          className="panel-input" 
          name="Sexo" 
          value={formData.Sexo} 
          onChange={handleInputChange} 
          required
        >
          <option value="">Seleccione sexo</option>
          <option value="Hembra">Hembra</option>
          <option value="Macho">Macho</option>
        </select>
  
        <div className="descripcion-container">
          <div className="checkboxes-container">
            <label>
              <input
                type="checkbox"
                checked={isVaccinated}
                onChange={(e) => setIsVaccinated(e.target.checked)}
              /> Vacunas al día
            </label>
            <label>
              <input
                type="checkbox"
                checked={isNeutered}
                onChange={(e) => setIsNeutered(e.target.checked)}
              /> Castrado/a
            </label>
          </div>
          <textarea 
            className="panel-textarea" 
            name="Descripcion" 
            value={formData.Descripcion} 
            onChange={handleInputChange} 
            placeholder="Descripción" 
            required 
          />
        </div>
  
        <input 
          className="panel-input" 
          name="Telefono" 
          value={formData.Telefono} 
          onChange={handleInputChange} 
          placeholder="Número de contacto" 
        />
        <ImageUploader onImageUpload={handleImageUpload} />
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Preview" 
            style={{width: '100px', height: '100px', objectFit: 'cover'}} 
          />
        )}
        <button className="panel-submit-button" type="submit">
          {editingId ? 'Actualizar' : 'Añadir'} 
        </button>
        {editingId && (
          <button 
            className="panel-cancel-button" 
            type="button" 
            onClick={resetForm}
          >
            Cancelar Edición
          </button>
        )}
      </form>
  
      <div className="panel-mascotas-list">
        <div className="panel-filter-container">
          <h3>Listado de animales disponibles para su adopcion</h3>
          <select
            className="panel-filter-select"
            value={filtroRefugio}
            onChange={(e) => setFiltroRefugio(e.target.value)}
          >
            <option value="">Todos</option>
            {codigosRefugio.map((codigo) => (
              <option key={codigo} value={codigo}>
                {codigo}
              </option>
            ))}
          </select>
        </div>
  
        {mascotasFiltradas.length > 0 ? (
          mascotasFiltradas.map((mascota) => (
            <PetListItem
              key={mascota.id}
              mascota={mascota}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onDeactivate={handleDeactivationClick}
            />
          ))
        ) : (
          <p className="panel-no-mascotas">No hay animales disponibles</p>
        )}
      </div>
  
      {/* Diálogo de confirmación para eliminar/marcar como adoptado */}
      <ConfirmationDialog
        isOpen={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={() => {
          setDeleteConfirmationOpen(false);
          setAdoptionDialogOpen(true); 
        }}
        title="Confirmar acción"
        message="¿Está seguro que desea marcar esta mascota como adoptada?"
      />
      
      {/* Diálogo de adopción */}
      <AdoptionDialog
        isOpen={adoptionDialogOpen}
        onClose={() => setAdoptionDialogOpen(false)}
        onConfirm={handleAdoptionProcess}
      />
      
      {/* Diálogo de confirmación para desactivar */}
      <ConfirmationDialog
        isOpen={deactivateConfirmationOpen}
        onClose={() => setDeactivateConfirmationOpen(false)}
        onConfirm={handleDeactivationProcess}
        title="Confirmar desactivación"
        message="Al confirmar sera movido a 'Patitas Inactivas'"
      />
    </div>
  );
};

export default AdminPanel;