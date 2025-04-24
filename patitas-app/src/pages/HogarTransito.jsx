import React from 'react';
import Navbar from '../components/Navbar';
import { FaPaw } from 'react-icons/fa';
import perrito from '../assets/images/perrito.png';
import gato from '../assets/images/gato.png';
import './transito.css';




const HogarTransito = () => {
  return (
    <div className="hogar-de-transito">
      
       <Navbar />
      
      
      <main>
        <section className="participa">
          <h1>¡Participa!

          </h1>
          <div className="contenido-participa">
            <img src={perrito} alt="Perrito" className="imagen-perrito" />
            <p className='h1participa'>
              Abrí las puertas de tu hogar temporalmente para un animal en recuperación o acoger a tiernos cachorros
              mientras aguardan ser adoptados definitivamente. Es una forma práctica y compasiva de marcar una
              diferencia positiva en la vida de estos animales.
            </p>
          </div>
        </section>

        <section className="requisitos">
          <h2>¿Que necesitas para ser hogar de transito?</h2>
          <ul>
            <li><strong>Amor y compromiso:</strong> Los hogares de tránsito deben tener un profundo amor y cuidado por los animales, así como un compromiso firme para brindarles un entorno seguro y afectuoso.</li>
            <li><strong>Disponibilidad de tiempo:</strong> Deben estar dispuestos a dedicar tiempo para el cuidado, socialización y atención de los animales a su cargo.</li>
            <li><strong>Espacio y ambiente adecuados:</strong> Deben tener un espacio en su hogar que sea seguro y apropiado para el animal según sus necesidades.</li>
            <li><strong>Comunicación:</strong> Deben mantener una comunicación constante y seguir sus directrices en cuanto a cuidados y procedimientos.</li>
            <li><strong>Flexibilidad:</strong> Deben ser flexibles y comprensivos con los cambios en su rutina que pudieran surgir relacionados al cuidado del animal a su cargo.</li>
          </ul>
          <div className="requisitos-especificos">
            <p><strong>Requisitos específicos:</strong></p>
            <p>Residir en Tucuman</p>
            <p>Tiempo mínimo requerido: 1 mes.</p>
          </div>
          <img src={gato} alt="Gato" className="imagen-gato" />
        </section>
        <a 
        href="https://docs.google.com/forms/d/e/1FAIpQLScb0BvJ6CU05ZPs_w5LgR461Y7cbAG0kH7IKjXVnsXuwgvDyw/viewform?usp=pp_url" 
        className="postulate-btn" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <FaPaw className="pata" /> Postulate <FaPaw className="pata" />
      </a>

      </main>
      
    </div>
 
    
    
  );
};

export default HogarTransito;