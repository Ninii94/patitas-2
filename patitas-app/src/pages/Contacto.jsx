import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import contactanosflyer from '../assets/images/contactanosflyer.png';
import SecundarioFooter from '../components/SecundarioFooter';
import './contacto.css';

const Contacto = () => {
  return (
    <div className="contacto-page">
      <Navbar />
      <div className="contacto-content">
        <div className="content-wrapper">
          <img src={contactanosflyer} alt="flyer" className="flyer" />

          <div className="contact-info">
            <h2>Centro Integral Animal Municipal</h2>
            <p>Teléfono: (381) 223-0564</p>
            <p>Dirección: Avenida Francisco de Aguirre 1465</p>
            <p>Horario de adopciones: Martes y jueves de 14 a 17 h</p>
          </div>
        </div>
      </div>
      
      <SecundarioFooter ></SecundarioFooter>
    </div>
  );
};

export default Contacto;