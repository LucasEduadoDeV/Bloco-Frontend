import { useEffect, useState } from 'react';
import { getCurrentUser, getRequestErrorMessage, logout, type PublicProfile } from './api/auth';
import './dashboard.css';

const meals = [
  { name: 'Café da manhã', time: '08:15', calories: 420 },
  { name: 'Almoço', time: '12:40', calories: 780 },
  { name: 'Lanche', time: '15:20', calories: 450 },
];

function getWeekDays(today: Date) {
  const monday = new Date(today);
  const dayOfWeek = monday.getDay();
  monday.setDate(monday.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', options).format(date);
}

function DashboardPage() {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [today] = useState(() => new Date());
  const weekDays = getWeekDays(today);

  useEffect(() => {
    const controller = new AbortController();

    getCurrentUser(controller.signal)
      .then(setProfile)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        if (
          requestError instanceof Error &&
          'status' in requestError &&
          requestError.status === 401
        ) {
          window.location.replace('/login');
          return;
        }

        setError(getRequestErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  async function handleLogout() {
    setError('');
    setIsLoggingOut(true);

    try {
      await logout();
      window.location.replace('/login');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <main className="dashboard-state">
        <p role="status">Carregando seu dashboard…</p>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="dashboard-state">
        <section className="dashboard-state__card" role="alert">
          <p className="dashboard-eyebrow">NÃO FOI POSSÍVEL ABRIR O DASHBOARD</p>
          <h1>Não conseguimos carregar seus dados.</h1>
          <p>{error}</p>
          <button className="dashboard-button" onClick={() => window.location.reload()}>
            TENTAR NOVAMENTE
          </button>
          <a className="dashboard-state__link" href="/login">
            Voltar para o login
          </a>
        </section>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="dashboard-app">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="/" aria-label="BLOCO, página inicial">
          <span aria-hidden="true">◆</span> BLOCO
        </a>
        <nav className="dashboard-nav" aria-label="Navegação do dashboard">
          <a className="is-active" href="#visao-geral">Visão geral</a>
          <a href="#alimentacao">Alimentação</a>
          <a href="#hidratacao">Hidratação</a>
          <a href="#refeicoes">Anotar treinos</a>
          <a href="#semana">Evolução</a>
        </nav>
        <button
          className="dashboard-logout"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          {isLoggingOut ? 'SAINDO…' : 'SAIR DA CONTA'}
        </button>
      </aside>

      <div className="dashboard-main" id="visao-geral">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              {formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' }).toLocaleUpperCase('pt-BR')}
            </p>
            <h1>Acompanhe seu dia.</h1>
          </div>
          <div className="dashboard-user">
            <span>{profile.name}</span>
            <span className="dashboard-avatar" aria-hidden="true">
              {profile.name.trim().charAt(0).toLocaleUpperCase('pt-BR')}
            </span>
          </div>
        </header>

        {error && (
          <p className="dashboard-inline-error" role="alert">
            {error}
          </p>
        )}

        <section className="dashboard-panel dashboard-week" id="semana">
          <div className="dashboard-panel-heading">
            <h2>SUA SEMANA</h2>
            <p>
              {formatDate(weekDays[0], { day: '2-digit' })} —{' '}
              {formatDate(weekDays[6], { day: '2-digit', month: 'short', year: 'numeric' }).toLocaleUpperCase('pt-BR')}
            </p>
          </div>
          <div className="dashboard-days">
            {weekDays.map((date) => {
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div
                  aria-current={isToday ? 'date' : undefined}
                  className={`dashboard-day${isToday ? ' is-today' : ''}`}
                  key={date.toISOString()}
                >
                  {isToday && <span className="dashboard-day__today">HOJE</span>}
                  <span className="dashboard-day__number">{formatDate(date, { day: '2-digit' })}</span>
                  <span className="dashboard-day__name">
                    {formatDate(date, { weekday: 'long' }).toLocaleUpperCase('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="dashboard-cards">
          <section className="dashboard-panel dashboard-nutrition" id="alimentacao">
            <div className="dashboard-panel-heading">
              <h2>ALIMENTAÇÃO · HOJE</h2>
              <p>META DIÁRIA&nbsp; 2.500 kcal</p>
            </div>
            <div className="dashboard-nutrition-summary">
              <div className="dashboard-circle dashboard-circle--food">
                <strong>66%</strong>
                <span>1.650 kcal</span>
              </div>
              <dl className="dashboard-stats">
                <div>
                  <dt>CONSUMIDO</dt>
                  <dd>1.650 <small>kcal</small></dd>
                </div>
                <div>
                  <dt>AINDA DISPONÍVEL</dt>
                  <dd className="is-accent">850 <small>kcal</small></dd>
                </div>
                <div>
                  <dt>REFEIÇÕES REGISTRADAS</dt>
                  <dd>03</dd>
                </div>
              </dl>
            </div>
            <div className="dashboard-meals-heading" id="refeicoes">
              <h3>REGISTRO DE HOJE</h3>
              <span>VALORES ILUSTRATIVOS</span>
            </div>
            <ul className="dashboard-meals">
              {meals.map((meal) => (
                <li className="dashboard-meal" key={meal.name}>
                  <div>
                    <span>{meal.name}</span>
                    <small>{meal.time}</small>
                  </div>
                  <strong>{meal.calories} kcal</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="dashboard-panel dashboard-hydration" id="hidratacao">
            <div className="dashboard-panel-heading">
              <h2>HIDRATAÇÃO · HOJE</h2>
              <p>META&nbsp; 2,5 L</p>
            </div>
            <div className="dashboard-water-summary">
              <div className="dashboard-circle dashboard-circle--water">
                <strong>60%</strong>
                <span>1,5 L</span>
              </div>
              <div className="dashboard-water-stats">
                <strong>1,5 <small>L</small></strong>
                <span>de 2,5 L</span>
                <small>Faltam 1,0 L</small>
              </div>
            </div>
            <div className="dashboard-cups-heading">COPOS DE 250 ML</div>
            <div className="dashboard-cups" aria-label="6 de 10 copos registrados">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  aria-label={index < 6 ? 'Copo registrado' : 'Copo não registrado'}
                  className={`dashboard-cup${index < 6 ? ' is-full' : ''}`}
                  key={index}
                >
                  {index < 6 ? '✓' : ''}
                </span>
              ))}
            </div>
            <div className="dashboard-cups-caption">
              <span>6 copos registrados</span>
              <span>10 para a meta</span>
            </div>
            <p className="dashboard-illustrative-note">
              Dados ilustrativos — acompanhamento ainda não conectado.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
