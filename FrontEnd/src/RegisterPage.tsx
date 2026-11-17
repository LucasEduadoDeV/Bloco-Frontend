import { useState, type FormEvent } from 'react';
import { AuthApiError, getRequestErrorMessage, register } from './api/auth';
import './register.css';

function RegisterPage() {
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmationError, setConfirmationError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const passwordConfirmation = String(formData.get('passwordConfirmation') ?? '');
    const phone = String(formData.get('phone') ?? '').trim();

    if (password !== passwordConfirmation) {
      setConfirmationError('As senhas não coincidem.');
      return;
    }

    setConfirmationError('');
    setIsSubmitting(true);

    try {
      await register({
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        password,
        phone: phone || null,
      });
      setIsRegistered(true);
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
            <div className="register-password-input">
              <input
                autoComplete="new-password"
                id="register-password"
                minLength={8}
                name="password"
                onChange={(event) => {
                  if (!confirmationError) {
                    return;
                  }

                  const confirmation = new FormData(event.currentTarget.form ?? undefined).get(
                    'passwordConfirmation',
                  );
                  if (event.currentTarget.value === confirmation) {
                    setConfirmationError('');
                  }
                }}
                placeholder="Crie uma senha"
                required
                type={isPasswordVisible ? 'text' : 'password'}
              />
              <button
                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={isPasswordVisible}
                className="register-password-toggle"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                type="button"
              >
                {isPasswordVisible ? 'OCULTAR' : 'MOSTRAR'}
              </button>
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-password-confirmation">CONFIRMAR SENHA</label>
            <div className="register-password-input">
              <input
                autoComplete="new-password"
                aria-describedby={
                  confirmationError ? 'register-password-confirmation-error' : undefined
                }
                aria-invalid={confirmationError ? true : undefined}
                id="register-password-confirmation"
                minLength={8}
                name="passwordConfirmation"
                onChange={(event) => {
                  if (!confirmationError) {
                    return;
                  }

                  const form = event.currentTarget.form;
                  const password = new FormData(form ?? undefined).get('password');
                  if (event.currentTarget.value === password) {
                    setConfirmationError('');
                  }
                }}
                placeholder="Digite sua senha novamente"
                required
                type={isConfirmationVisible ? 'text' : 'password'}
              />
              <button
                aria-label={isConfirmationVisible ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                aria-pressed={isConfirmationVisible}
                className="register-password-toggle"
                onClick={() => setIsConfirmationVisible((visible) => !visible)}
                type="button"
              >
                {isConfirmationVisible ? 'OCULTAR' : 'MOSTRAR'}
              </button>
            </div>
            {confirmationError && (
              <span
                className="register-field-error"
                id="register-password-confirmation-error"
                role="alert"
              >
                {confirmationError}
              </span>
            )}
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
            className={`register-message${message ? ' register-message--error' : ''}`}
            aria-live="polite"
            role="status"
          >
            {message}
          </p>
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

      {isRegistered && (
        <div className="register-success-backdrop">
          <section
            aria-labelledby="register-success-title"
            aria-modal="true"
            className="register-success-dialog"
            role="dialog"
          >
            <span className="register-success-icon" aria-hidden="true">
              ✓
            </span>
            <p className="register-eyebrow">CADASTRO CONCLUÍDO</p>
            <h2 id="register-success-title">Conta criada com sucesso.</h2>
            <p className="register-success-copy">
              Seu cadastro está pronto. Agora você já pode acessar sua conta.
            </p>
            <button
              autoFocus
              className="register-submit"
              onClick={() => window.location.assign('/login')}
              type="button"
            >
              IR PARA LOGIN
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default RegisterPage;
