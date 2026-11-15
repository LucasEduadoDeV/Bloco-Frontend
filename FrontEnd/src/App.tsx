import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';

const steps = [
  {
    number: '01',
    label: 'OBJETIVO',
    title: 'Defina seu objetivo',
    description:
      'Escolha onde quer chegar e encontre um ponto de partida que faça sentido.',
  },
  {
    number: '02',
    label: 'ROTINA',
    title: 'Organize sua rotina',
    description:
      'Reúna suas metas e atividades em uma rotina que acompanhe seu dia a dia.',
  },
  {
    number: '03',
    label: 'EVOLUÇÃO',
    title: 'Acompanhe seu progresso',
    description:
      'Reconheça cada avanço e ajuste os próximos passos no seu ritmo.',
  },
];

const audiences = [
  {
    number: '01',
    label: 'QUEM TREINA',
    description: 'Seus objetivos, no seu ritmo. Mais clareza para cuidar da rotina.',
  },
  {
    number: '02',
    label: 'PROFISSIONAIS',
    description: 'Seu trabalho, mais conectado. Acompanhe pessoas e objetivos.',
  },
  {
    number: '03',
    label: 'ESPAÇOS FITNESS',
    description: 'Seu espaço, perto da comunidade. Conecte-se ao universo fitness.',
  },
];

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a
      className={`brand${footer ? ' brand--footer' : ''}`}
      href="/"
      aria-label="BLOCO, início"
    >
      {!footer && <span className="brand__mark" aria-hidden="true" />}
      BLOCO{footer && '.'}
    </a>
  );
}

function LandingPage() {
  return (
    <main id="inicio">
      <div className="page-shell">
        <header className="site-header">
          <Brand />
          <nav className="main-nav" aria-label="Navegação principal">
            <a href="#como-funciona">Como funciona</a>
            <a href="#para-quem">Para quem treina</a>
            <a href="#para-quem">Para profissionais</a>
          </nav>
          <a className="header-link" href="/login">
            ACESSAR PLATAFORMA <span aria-hidden="true">↗</span>
          </a>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-aside">
            <p className="eyebrow eyebrow--dark">SUA JORNADA FITNESS</p>
            <div className="hero-aside__message">
              <p className="hero-aside__title">
                TREINO,
                <br />
                ROTINA,
                <br />
                EVOLUÇÃO.
              </p>
              <p className="hero-aside__copy">
                Organize seu treino e acompanhe cada avanço.
              </p>
            </div>
            <div className="hero-aside__footer">CADA OBJETIVO CONTA</div>
          </div>

          <div className="hero-main">
            <div className="hero-main__content">
              <p className="eyebrow">TREINO · ROTINA · EVOLUÇÃO</p>
              <h1 id="hero-title">
                Treino com
                <br />
                mais foco e
                <br />
                constância.
              </h1>
              <p className="hero-main__copy">
                Organize seus treinos, acompanhe sua evolução e mantenha seus
                objetivos à vista — tudo em um só lugar.
              </p>
              <a className="button button--light" href="/register">
                COMECE AGORA <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="audience-strip" aria-label="Públicos do BLOCO">
          <p className="eyebrow">TUDO PARA A SUA ROTINA FITNESS</p>
          <p>
            Quem treina.
            <br />
            Para evoluir no seu ritmo.
          </p>
          <p>
            Quem orienta.
            <br />
            Para acompanhar melhor.
          </p>
          <p>
            Profissionais e espaços.
            <br />
            Para conectar o setor.
          </p>
        </section>

        <section className="info-section how-section" id="como-funciona">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMO FUNCIONA</p>
              <h2>
                Um caminho claro
                <br />
                para evoluir.
              </h2>
            </div>
            <p className="section-heading__description">
              Defina seu objetivo, organize sua rotina e acompanhe cada passo —
              sempre no seu ritmo.
            </p>
          </div>
          <div className="step-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <p className="eyebrow">
                  {step.number} / {step.label}
                </p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-section audience-section" id="para-quem">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PARA QUEM É</p>
              <h2>
                Feito para quem
                <br />
                vive o fitness.
              </h2>
            </div>
            <p className="section-heading__description">
              Da rotina de treino ao trabalho com movimento, cada pessoa encontra
              seu espaço para evoluir.
            </p>
          </div>
          <div className="step-grid">
            {audiences.map((audience) => (
              <article className="step-card" key={audience.number}>
                <p className="eyebrow">
                  {audience.number} / {audience.label}
                </p>
                <p className="audience-card__description">{audience.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta" id="comecar">
          <div>
            <p className="eyebrow eyebrow--dark">SEU PRÓXIMO PASSO</p>
            <h2>Sua jornada fitness começa aqui.</h2>
            <p>Encontre seu ritmo, mantenha o foco e siga em frente.</p>
          </div>
        </section>

        <footer className="site-footer">
          <Brand footer />
          <p className="eyebrow">FITNESS, EM MOVIMENTO.</p>
        </footer>
      </div>
    </main>
  );
}

function App() {
  const { pathname } = window.location;

  if (pathname === '/register') {
    return <RegisterPage />;
  }

  if (pathname === '/login') {
    return <LoginPage />;
  }

  if (pathname === '/dashboard') {
    return <DashboardPage />;
  }

  return <LandingPage />;
}

export default App;
