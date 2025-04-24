import React from 'react';
import { Link } from 'react-router-dom';
import './sefooter.css'
//contacto para amanecer software
const SecundarioFooter = () => {
  return (
    <footer className="secondary-footer">
      <div className="secondary-footer-content">
        <span>Desarrollado con ♡ por Amanecer Software  </span>
        <Link to="https://amanecersoftware.com/" className="footer-contact">
          Contacto
        </Link>
      </div>
    </footer>
  );
};

export default SecundarioFooter;