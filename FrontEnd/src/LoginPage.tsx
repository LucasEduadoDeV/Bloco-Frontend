import { useState, type FormEvent } from 'react';
import { getRequestErrorMessage, login } from './api/auth';
import './login.css';

function LoginPage() {
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const profile = await login({
        email: String(formData.get('email') ?? '').trim(),
        password: String(formData.get('password') ?? ''),
      });
      if (!profile.id) {
        throw new Error('A API não confirmou o início da sessão.');
      }
      window.location.assign('/dashboard');
    } catch (error) {
      setMessage(getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePasswordRecovery() {
    setMessage('A recuperação de senha ainda não está disponível.');
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="login-brand" href="/" aria-label="BLOCO, página inicial">
          <span className="login-brand__mark" aria-hidden="true" />
          BLOCO
        </a>
      </header>

      <section className="login-content" aria-labelledby="login-title">
        <p className="login-eyebrow">BEM-VINDO DE VOLTA</p>
        <h1 id="login-title">
          Que bom ter
          <br />
          você de volta.
        </h1>
        <p className="login-intro">Entre para continuar sua evolução.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">EMAIL</label>
            <input
              autoComplete="email"
              id="login-email"
              maxLength={320}
              name="email"
              placeholder="seu@email.com"
              required
              type="email"
            />
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label htmlFor="login-password">SENHA</label>
              <button type="button" onClick={handlePasswordRecovery}>
                Esqueci a senha
              </button>
            </div>
            <input
              autoComplete="current-password"
              id="login-password"
              name="password"
              placeholder="Sua senha"
              required
              type="password"
            />
          </div>

          <button className="login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'ENTRANDO…' : 'ENTRAR'}
          </button>
          <p className="login-message" aria-live="polite" role="status">
            {message}
          </p>
        </form>

        <p className="login-register">
          Ainda não tem uma conta? <a href="/register">Criar conta</a>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
