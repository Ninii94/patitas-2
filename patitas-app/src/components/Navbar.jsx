import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logonav2.png';
import './navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Inicio</Link>
        <Link to="/prepagina" className="navbar-link">Adoptar</Link>
        <Link to="/Contacto" className="navbar-link">Contacto</Link>
        <Link to="/hogar-de-transito" className="navbar-link">Hogar de Tránsito</Link>
      </div>
    </nav>
  );
};

export default Navbar;