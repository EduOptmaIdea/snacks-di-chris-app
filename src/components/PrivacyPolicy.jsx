import React from 'react';
import '../styles/PrivacyPolicy.css';
import { WHATSAPP_PRIVACY_URL } from '../constants';
import zap from '../assets/imgs/icons/whatsapp-logo-branca.webp';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Política de Privacidade</h1>
        <p className="last-updated">Última atualização: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Informações que Coletamos</h2>
          <p>Nós coletamos informações que você nos fornece diretamente quando:</p>
          <ul>
            <li>Realiza cadastro em nosso site</li>
            <li>Preenche formulários de contato</li>
            <li>Efetua compras em nossa loja</li>
            <li>Interage com nossos serviços</li>
          </ul>
          <p>Também coletamos dados automaticamente através de cookies e tecnologias similares.</p>
        </section>

        <section>
          <h2>2. Uso das Informações</h2>
          <p>Utilizamos suas informações para:</p>
          <ul>
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Personalizar sua experiência</li>
            <li>Processar transações</li>
            <li>Enviar comunicações importantes</li>
            <li>Garantir a segurança do site</li>
          </ul>
        </section>

        <section>
          <h2>3. Compartilhamento de Dados</h2>
          <p>Não vendemos suas informações pessoais. Podemos compartilhar dados com:</p>
          <ul>
            <li>Prestadores de serviços essenciais</li>
            <li>Autoridades legais quando exigido por lei</li>
            <li>Parceiros comerciais confiáveis (apenas com seu consentimento)</li>
          </ul>
        </section>

        <section>
          <h2>4. Cookies e Tecnologias Similares</h2>
          <p>Utilizamos cookies para:</p>
          <ul>
            <li>Lembrar suas preferências</li>
            <li>Analisar tráfego do site</li>
            <li>Otimizar a experiência do usuário</li>
          </ul>
          <p>Você pode gerenciar suas preferências de cookies através das configurações do navegador.</p>
        </section>

        <section>
          <h2>5. Seus Direitos</h2>
          <p>Você tem o direito de:</p>
          <ul>
            <li>Acessar seus dados pessoais</li>
            <li>Solicitar correção de informações</li>
            <li>Pedir a exclusão de seus dados</li>
            <li>Revogar consentimentos dados</li>
            <li>Opor-se a determinados processamentos</li>
          </ul>
        </section>

        <section>
          <h2>6. Segurança de Dados</h2>
          <p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado e perda acidental.</p>
        </section>

        <section>
          <h2>7. Alterações nesta Política</h2>
          <p>Podemos atualizar esta política periodicamente. A versão mais recente estará sempre disponível em nosso site.</p>
        </section>

        <section className="contact-section">
          <h2>8. Contato</h2>
          <p>Para dúvidas sobre esta política ou seus dados pessoais, entre em contato:</p>
          <p>Email: snacksdichris@gmail.com</p>
          <p>
            WhatsApp: {' '}
            <a
              href={WHATSAPP_PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-contact-link"
            >
              <img
                src={zap}
                alt="WhatsApp"
                className="zap-icon"
              />
              Enviar mensagem sobre Privacidade
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;