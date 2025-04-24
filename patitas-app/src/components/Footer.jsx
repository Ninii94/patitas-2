import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import logoCompleto from '../assets/images/logocompleto.png';
import { FaFacebook, FaYoutube, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="foot-footer">
      <div className="foot-container">
        
        <div className="foot-section">
          <img
            src={logoCompleto}
            alt="Patitas Sin Hogar"
            className="foot-logo"
          />
          <h3 className="foot-title">
            Adopta un amigo, cambia una vida
          </h3>
          <h4 className="foot-subtitle">Un hogar para todos</h4>
          <Link
            to="/login"
            className="foot-admin-link"
          >
            Administrar
          </Link>
        </div>
        
        <div className="foot-section">
          <h3 className="foot-title">¡Navega por la web!</h3>
          <nav className="foot-nav">
            <ul className="foot-nav-list">
              <li>
                <Link to="/" className="foot-link">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/adoptar" className="foot-link">
                  Adoptar
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="foot-link">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/hogar-de-transito" className="foot-link">
                  Hogar de Tránsito
                </Link>
              </li>
              <li>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLScb0BvJ6CU05ZPs_w5LgR461Y7cbAG0kH7IKjXVnsXuwgvDyw/viewform" 
                  className="foot-link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Quiero ser hogar de tránsito
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="foot-section">
  <h3 className="foot-title">Redes Sociales</h3>
  <div className="foot-social-links">
    <a 
      href="https://www.facebook.com/poblacionanimalsmt/" 
      className="foot-social-link" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <FaFacebook /> Facebook
    </a>
    <a 
      href="https://www.youtube.com/@MuniSMTucuman" 
      className="foot-social-link" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <FaYoutube /> YouTube
    </a>
    <a 
      href="https://www.instagram.com/poblacionanimalsmt/" 
      className="foot-social-link" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <FaInstagram /> Instagram
    </a>
    <a 
      href="https://x.com/CiudadSMT" 
      className="foot-social-link" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <FaTwitter /> Twitter
    </a>
  </div>
</div>
</div>
</footer>
);
};

export default Footer;