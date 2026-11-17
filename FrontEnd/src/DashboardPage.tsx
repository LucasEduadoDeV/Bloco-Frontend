import { useEffect, useState } from 'react';
import {
  getCurrentUser,
  getRequestErrorMessage,
  logout,
  type CurrentUserProfile,
} from './api/auth';
import TmbSetupModal from './TmbSetupModal';
import './dashboard.css';

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

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatFirstName(name: string) {
  const firstName = name.trim().split(/\s+/)[0] ?? '';

  if (!firstName) {
    return '';
  }

  return `${firstName.charAt(0).toLocaleUpperCase('pt-BR')}${firstName.slice(1).toLocaleLowerCase('pt-BR')}`;
}

function formatWater(valueMl: number) {
  if (valueMl >= 1000) {
    return `${new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 1,
    }).format(valueMl / 1000)} L`;
  }

  return `${formatNumber(valueMl)} ml`;
}

function hasTmbProfileData(profile: CurrentUserProfile) {
  return (
    profile.age !== null &&
    profile.age > 0 &&
    profile.gender !== null &&
    profile.heightCm !== null &&
    profile.heightCm > 0 &&
    profile.weightKg !== null &&
    profile.weightKg > 0 &&
    profile.activityLevel !== null &&
    profile.activityLevel >= 1 &&
    profile.activityLevel <= 5
  );
}

function DashboardPage() {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isTmbModalOpen, setIsTmbModalOpen] = useState(false);
  const [today] = useState(() => new Date());
  const weekDays = getWeekDays(today);
  const waterGoal = profile?.waterConsumptionGoalMl ?? 0;
  const waterConsumed = profile?.dailyWaterConsumptionMl ?? 0;
  const waterProgress =
    waterGoal > 0 ? Math.min(Math.round((waterConsumed / waterGoal) * 100), 100) : 0;
  const waterRemaining = Math.max(waterGoal - waterConsumed, 0);
  const firstName = formatFirstName(profile?.name ?? '');

  useEffect(() => {
    const controller = new AbortController();

    getCurrentUser(controller.signal)
      .then((currentProfile) => {
        setProfile(currentProfile);
        setIsTmbModalOpen(
          currentProfile.basalMetabolicRateKcal === 0 && !hasTmbProfileData(currentProfile),
        );
      })
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
          <a href="#semana">Sua semana</a>
          <a href="#perfil">Seu perfil</a>
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
              {formatDate(today, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).toLocaleUpperCase('pt-BR')}
            </p>
            <h1>Bom dia, {firstName}.</h1>
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
              {formatDate(weekDays[6], {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).toLocaleUpperCase('pt-BR')}
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
                  <span className="dashboard-day__name">
                    {isToday
                      ? `HOJE · ${formatDate(date, { weekday: 'long' }).toLocaleUpperCase('pt-BR')}`
                      : formatDate(date, { weekday: 'long' }).toLocaleUpperCase('pt-BR')}
                  </span>
                  <span className="dashboard-day__number">{formatDate(date, { day: '2-digit' })}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
          <article className="dashboard-hero__feature">
            <p className="dashboard-eyebrow">SEU DIA · NO SEU RITMO</p>
            <h2 id="dashboard-hero-title">Mais clareza para cuidar da rotina.</h2>
            <p>
              Acompanhe suas referências de alimentação e hidratação em um só lugar.
              Sem pressa, um dia de cada vez.
            </p>
            <a className="dashboard-button" href="#alimentacao">
              VER MEU EQUILÍBRIO <span aria-hidden="true">↓</span>
            </a>
            <div className="dashboard-hero__meta">
              <span>BLOCO</span>
              <span>SEU ESPAÇO</span>
              <span>SEU RITMO</span>
            </div>
          </article>
          <article className="dashboard-hero__aside" id="perfil">
            <p className="dashboard-panel-heading__eyebrow">SEU PERFIL</p>
            <h2>Um passo de cada vez.</h2>
            <p>
              Suas metas e referências ficam reunidas aqui para você acompanhar
              sua rotina com mais tranquilidade.
            </p>
            <a href="#hidratacao">
              ACOMPANHAR HIDRATAÇÃO <span aria-hidden="true">↗</span>
            </a>
          </article>
        </section>

        <section className="dashboard-cards" aria-label="Alimentação e hidratação">
          <section
            className="dashboard-panel dashboard-nutrition"
            id="alimentacao"
            aria-labelledby="dashboard-nutrition-title"
          >
            <div className="dashboard-panel-heading">
              <h2 id="dashboard-nutrition-title">ALIMENTAÇÃO · PERFIL</h2>
              <p>REFERÊNCIAS DO SEU PERFIL</p>
            </div>
            <div className="dashboard-nutrition-summary">
              <div className="dashboard-calorie-emblem">
                <span>GASTO ESTIMADO</span>
                <strong>{formatNumber(profile.estimatedDailyEnergyExpenditureKcal)}</strong>
                <small>kcal / dia</small>
              </div>
              <div className="dashboard-nutrition-detail">
                <p className="dashboard-nutrition-detail__eyebrow">TAXA METABÓLICA BASAL</p>
                <strong>
                  {formatNumber(profile.basalMetabolicRateKcal)} <small>kcal</small>
                </strong>
                <p>
                  Estimativa de energia que seu corpo utiliza em repouso.
                </p>
              </div>
            </div>
            <div className="dashboard-data-note">
              <div className="dashboard-data-note__row">
                <span>CONSUMO REGISTRADO HOJE</span>
                <strong>{formatNumber(profile.dailyCalorieConsumptionKcal)} kcal</strong>
              </div>
              <small>
                O gasto estimado é uma referência de manutenção, não uma meta de consumo.
              </small>
            </div>
          </section>

          <section
            className="dashboard-panel dashboard-hydration"
            id="hidratacao"
            aria-labelledby="dashboard-hydration-title"
          >
            <div className="dashboard-panel-heading">
              <h2 id="dashboard-hydration-title">HIDRATAÇÃO · HOJE</h2>
              <p>{waterGoal > 0 ? `META · ${formatWater(waterGoal)}` : 'META NÃO DEFINIDA'}</p>
            </div>
            <div className="dashboard-water-summary">
              <div
                className="dashboard-circle dashboard-circle--water"
                style={{
                  background: `conic-gradient(var(--color-accent) ${waterProgress}%, var(--color-muted) ${waterProgress}% 100%)`,
                }}
              >
                <span className="dashboard-circle__inner">
                  <strong>{waterGoal > 0 ? `${waterProgress}%` : '—'}</strong>
                  <small>{formatWater(waterConsumed)}</small>
                </span>
              </div>
              <div className="dashboard-water-stats">
                <strong>{formatWater(waterConsumed)}</strong>
                <span>
                  {waterGoal > 0 ? `de ${formatWater(waterGoal)}` : 'consumo registrado hoje'}
                </span>
                <small>
                  {waterGoal > 0
                    ? waterRemaining > 0
                      ? `Faltam ${formatWater(waterRemaining)} para sua meta`
                      : 'Meta diária atingida'
                    : 'Defina uma meta de hidratação no seu perfil'}
                </small>
              </div>
            </div>
            <div className="dashboard-water-progress">
              <div className="dashboard-water-progress__label">
                <span>PROGRESSO DA META</span>
                <strong>{waterGoal > 0 ? `${waterProgress}%` : '—'}</strong>
              </div>
              <div
                aria-label={
                  waterGoal > 0
                    ? `${waterProgress}% da meta de hidratação`
                    : 'Meta de hidratação não definida'
                }
                className="dashboard-water-progress__track"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={waterProgress}
              >
                <span style={{ width: `${waterProgress}%` }} />
              </div>
            </div>
            <p className="dashboard-water-caption">
              Consumo de água registrado hoje no seu perfil.
            </p>
          </section>
        </section>

        <footer className="dashboard-footer">
          <span>BLOCO · SEU ESPAÇO</span>
          <span>Consistência, um dia de cada vez.</span>
        </footer>
      </div>
      {isTmbModalOpen && (
        <TmbSetupModal
          onClose={() => setIsTmbModalOpen(false)}
          onSaved={(tmbProfile) => {
            setProfile((currentProfile) =>
              currentProfile ? { ...currentProfile, ...tmbProfile } : currentProfile,
            );
            setIsTmbModalOpen(false);
          }}
        />
      )}
    </main>
  );
}

export default DashboardPage;
