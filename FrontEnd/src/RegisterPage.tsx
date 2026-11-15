import { useState, type FormEvent } from 'react';
import { AuthApiError, getRequestErrorMessage, register } from './api/auth';
import './register.css';

function RegisterPage() {
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setFieldErrors({});
    setIsRegistered(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get('phone') ?? '').trim();

    try {
      await register({
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        password: String(formData.get('password') ?? ''),
        phone: phone || null,
      });
      setIsRegistered(true);
      setMessage('Conta criada com sucesso. Você já pode entrar.');
    } catch (error) {
      if (error instanceof AuthApiError) {
        setFieldErrors(error.fields);
      }
      setMessage(getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="register-page">
      <header className="register-header">
        <a className="register-brand" href="/" aria-label="BLOCO, página inicial">
          <span className="register-brand__mark" aria-hidden="true" />
          BLOCO
        </a>
      </header>

      <section className="register-content" aria-labelledby="register-title">
        <p className="register-eyebrow">O PRIMEIRO PASSO É SEU</p>
        <h1 id="register-title">
          Seu legado
          <br />
          começa aqui.
        </h1>
        <p className="register-intro">
          Organize seus treinos e acompanhe sua evolução.
        </p>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label htmlFor="register-name">NOME</label>
            <input
              autoComplete="name"
              id="register-name"
              maxLength={255}
              name="name"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="register-email">EMAIL</label>
            <input
              autoComplete="email"
              id="register-email"
              maxLength={320}
              name="email"
              placeholder="seu@email.com"
              required
              type="email"
            />
          </div>

          <div className="register-field">
            <label htmlFor="register-password">SENHA</label>
            <input
              autoComplete="new-password"
              id="register-password"
              minLength={8}
              name="password"
              placeholder="Crie uma senha"
              required
              type="password"
            />
          </div>

          <div className="register-field">
            <label htmlFor="register-phone">
              TELEFONE <span>(opcional)</span>
            </label>
            <input
              autoComplete="tel"
              id="register-phone"
              maxLength={50}
              name="phone"
              placeholder="(00) 00000-0000"
              type="tel"
            />
          </div>

          <button className="register-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'CRIANDO CONTA…' : 'CRIAR MINHA CONTA'}
          </button>
          <p
            className={`register-message${message && !isRegistered ? ' register-message--error' : ''}`}
            aria-live="polite"
            role="status"
          >
            {message}
          </p>
          {isRegistered && (
            <a className="register-success-link" href="/login">
              IR PARA O LOGIN
            </a>
          )}
        </form>

        <p className="register-login">
          Já tem uma conta? <a href="/login">Entrar</a>
        </p>
        {Object.keys(fieldErrors).length > 0 && (
          <ul className="register-field-errors" aria-label="Erros nos campos">
            {Object.entries(fieldErrors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default RegisterPage;
