
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home'
import Adoptar from './pages/Adoptar';
import PrePagina from './pages/PrePagina';
import Contacto from './pages/Contacto';
import HogarTransito from './pages/HogarTransito';
import Login from './pages/Login';
import MascotaDetalle from './pages/Descripcion';
import AdminPanel from './pages/AdminPanel';
import Estadisticas from './pages/Estadisticas';
import Bienvenida from './pages/Bienvenida';
import { SnackbarProvider } from 'notistack';
import GestionReactivacion from './pages/GestionReactivacion';
import GestionAdopciones from './pages/GestionMascotas';
import Estado from './pages/Estado';

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prepagina" element={<PrePagina />} />
        <Route path="/adoptar" element={<Adoptar />} /> 
        <Route path="/mascota/:id" element={<MascotaDetalle />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/hogar-de-transito" element={<HogarTransito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Bienvenida />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/adopciones" element={<GestionAdopciones />} />
        <Route path="/gestion-activar" element={<GestionReactivacion />} />
        <Route path='estado' element={<Estado/>} />
        
        </Routes>
    </Router>
    </SnackbarProvider>
  );
}
    
export default App;
