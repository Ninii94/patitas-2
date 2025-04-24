import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === import.meta.env.VITE_APP_USERNAME && 
        password === import.meta.env.VITE_APP_PASSWORD) {
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="overlay">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="con">
          <header className="head-form">
            <h3>🐾 Bienvenido a Patitas sin hogar 🐾</h3>
            <p>Ingresa tus datos para acceder</p>
          </header>
          <br />
          <div className="field-set">
            <span className="input-item">
              <i className="fa fa-user-circle"></i>
            </span>
            <input
              className="form-input"
              id="username"
              type="text"
              placeholder="@usuario"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            <br />
            <span className="input-item">
              <i className="fa fa-key"></i>
            </span>
            <input
              className="form-input"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <span className="emojis" onClick={togglePasswordVisibility}>
              {showPassword ? '🙈 Ocultar' : '👀 Mostrar'}
            </span>
            <br />
            <button type="submit" className="log-in">
              Ingresar
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default Login;