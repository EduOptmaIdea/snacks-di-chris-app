import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../../../src/firebase.ts';
import '../../styles/LoginPage.css'; // Importar o CSS original

const LoginPage: React.FC = () => {
    console.log('[LoginPage.tsx] Rendering...');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        console.log(`[LoginPage.tsx] Tentando login com email: ${email}`);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('[LoginPage.tsx] Login bem-sucedido, redirecionando para /admin/dashboard');
            // Usar navigate em vez de window.location.href para navegação interna do React Router
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('[LoginPage.tsx] Erro no login:', err);
            if (err instanceof FirebaseError || (err && typeof err === 'object' && 'code' in err)) {
                switch ((err as FirebaseError).code) {
                    case 'auth/invalid-email':
                        setError('Formato de email inválido.');
                        break;
                    case 'auth/user-disabled':
                        setError('Este usuário foi desabilitado.');
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        setError('Email ou senha incorretos.');
                        break;
                    default:
                        setError((err as FirebaseError).message || 'Falha ao fazer login. Verifique suas credenciais.');
                }
            } else if (err instanceof Error) {
                setError(err.message || 'Ocorreu um erro inesperado.');
            } else {
                setError('Ocorreu um erro inesperado.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Função para montar o mailto com assunto e corpo (do JSX original)
    const handleEmailClick = () => {
        const subject = 'Solicitação de acesso';
        const body = `Olá.\n\n\n    Solicito dados para acessar a área administrativa da SNACKS di Chris, por fazer parte time ou colaborar de alguma forma com a empresa.\n\n    Entendo que a resposta e os dados para acesso provisório serão enviados somente por esse e-mail.\n
    Estou ciente de que os dados enviados são de minha total responsabilidade e concordo em prestar informações necessárias para obter os dados de acesso.\n
    Declaro desde já que assumo todas as responsabilidades sobre minhas atividades, enquanto logado, entendendo que não posso contribuir de forma alguma para o mal funcionamento do aplicativo ou expor os dados que são confidenciais.\n
    Todas as dúvidas que surgirem serão sanadas por esse canal ou outro que a SNACKS di Chris determinar.\n
    \nAtenciosamente,\n\n[NOME COMPLETO]`;

        const mailtoLink = `mailto:snacksdichris@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    return (
        // Aplicar a classe principal do CSS original
        <div className="login-page">
            <form onSubmit={handleLogin}>
                <h2 className='titulo'>Área Restrita</h2>
                {error && <p className="login-error">{error}</p>}
                <input
                    className='input-email' // Usar classe do CSS
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <input
                    className='input-password' // Usar classe do CSS
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                <div className="botoes"> {/* Manter estrutura de botões do CSS */}
                    <button className="entrar" type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                    {/* Botão Voltar ao site */}
                    <button className="voltar-ao-site" type="button" onClick={() => navigate('/')} disabled={loading}>
                        ← Voltar ao site
                    </button>
                </div>
                {/* Texto informativo e link de recuperação */}
                <p className="login-info">
                    Você está tentando acessar uma área restrita da empresa.
                    Entre com seus dados de login ou clique em Voltar ao site.
                    Se for colaborador da empresa e não tiver os dados de acesso solicite através do e-mail{' '}
                    <span className="mailto-link" onClick={handleEmailClick} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        snacksdichris@gmail.com
                    </span>.
                </p>
            </form>
        </div>
    );
};

export default LoginPage;

