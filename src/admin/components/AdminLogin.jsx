// src/admin/components/AdminLogin.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Área Restrita</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
          {error && <p className="error-message">{error}</p>}
        </form>

        <button type="button" className="btn-back" onClick={() => navigate('/')}>
          ← Voltar ao site
        </button>

        <p className="login-info-text">
          Você está acessando uma área restrita da empresa. Caso não tenha usuário e senha, clique em "Voltar". Se pertencer à empresa, envie um e-mail para{' '}
          <a href="mailto:snacksdichris@gmail.com">snacksdichris@gmail.com</a>{' '}
          solicitando seus dados de acesso.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;