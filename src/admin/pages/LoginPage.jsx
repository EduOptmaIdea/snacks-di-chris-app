import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import '../styles/LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirecione para o dashboard após login bem-sucedido
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError('Credenciais inválidas.');
    }
  };

    // Função para montar o mailto com assunto e corpo
  const handleEmailClick = () => {
    const subject = 'Solicitação de acesso';
    const body = `Olá.\n\n
    Solicito dados para acessar a área administrativa da SNACKS di Chris, por fazer parte time ou colaborar de alguma forma com a empresa.\n
    Entendo que a resposta e os dados para acesso provisório serão enviados somente por esse e-mail.\n
    Estou ciente de que os dados enviados são de minha total responsabilidade e concordo em prestar informações necessárias para obter os dados de acesso.\n
    Declaro desde já que assumo todas as responsabilidades sobre minhas atividades, enquanto logado, entendendo que não posso contribuir de forma alguma para o mal funcionamento do aplicativo ou expor os dados que são confidenciais.\n
    Todas as dúvidas que surgirem serão sanadas por esse canal ou outro que a SNACKS di Chris determinar.\n
    \nAtenciosamente,\n\n[NOME COMPLETO]`;
    
    const mailtoLink = `mailto:snacksdichris@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin}>
        <h2 className='titulo'>Área Restrita</h2>
        {error && <p className="login-error">{error}</p>}
        <input
          className='input-email'
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className='input-password'  
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="botoes">
            <button className="entrar" type="submit">Entrar</button>
            <button className="voltar-ao-site" type="button" onClick={() => window.location.href = '/'}>
            ← Voltar ao site
            </button>
        </div>
        <p className="login-info">
          Você está tentando acessar uma área restrita da empresa. 
          Entre com seus dados de login ou clique em Voltar ao site. 
          Se for colaborador da empresa e não tiver os dados de acesso solicite através do e-mail {' '}
          <span className="mailto-link" onClick={handleEmailClick}>
            snacksdichris@gmail.com
          </span>{'.'}
        </p>
      </form>
    </div>
  );
}

export default LoginPage;