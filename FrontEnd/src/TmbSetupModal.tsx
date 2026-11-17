import { useEffect, useState, type FormEvent } from 'react';
import {
  AuthApiError,
  getRequestErrorMessage,
  updateCurrentUserTmbProfile,
  type TmbGender,
  type TmbProfileUpdatePayload,
  type UpdatedTmbProfile,
} from './api/auth';
import './tmb-setup.css';

const activityLevels = [
  {
    id: 'sedentary',
    code: 1,
    name: 'Sedentário',
    description: 'Passa a maior parte do dia sentado e quase não se exercita.',
  },
  {
    id: 'light',
    code: 2,
    name: 'Levemente ativo',
    description: 'Faz caminhadas ou exercícios leves algumas vezes na semana.',
  },
  {
    id: 'moderate',
    code: 3,
    name: 'Moderadamente ativo',
    description: 'Pratica exercícios moderados com regularidade na semana.',
  },
  {
    id: 'very',
    code: 4,
    name: 'Muito ativo',
    description: 'Treina intensamente na maioria dos dias da semana.',
  },
  {
    id: 'extreme',
    code: 5,
    name: 'Extremamente ativo',
    description:
      'Combina treinos intensos com uma rotina de trabalho fisicamente exigente.',
  },
] as const;

function TmbSetupModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (profile: UpdatedTmbProfile) => void;
}) {
  const [step, setStep] = useState<'profile' | 'activity'>('profile');
  const [gender, setGender] = useState<TmbGender | ''>('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightLb, setWeightLb] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [activityLevel, setActivityLevel] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const selectedActivity = activityLevels.find((level) => level.id === activityLevel);

  function changeHeightUnit(unit: 'cm' | 'ft') {
    if (unit === heightUnit) {
      return;
    }

    if (unit === 'ft' && heightCm) {
      const centimeters = Number(heightCm);
      if (Number.isFinite(centimeters)) {
        const totalInches = centimeters / 2.54;
        let feet = Math.floor(totalInches / 12);
        let inches = Number((totalInches - feet * 12).toFixed(1));
        if (inches >= 12) {
          feet += 1;
          inches = 0;
        }
        setHeightFeet(String(feet));
        setHeightInches(String(inches));
      }
    } else if (unit === 'cm' && (heightFeet || heightInches)) {
      const totalInches = Number(heightFeet || 0) * 12 + Number(heightInches || 0);
      if (Number.isFinite(totalInches)) {
        setHeightCm((totalInches * 2.54).toFixed(1));
      }
    }

    setHeightUnit(unit);
  }

  function changeWeightUnit(unit: 'kg' | 'lb') {
    if (unit === weightUnit) {
      return;
    }

    if (unit === 'lb' && weightKg) {
      const kilograms = Number(weightKg);
      if (Number.isFinite(kilograms)) {
        setWeightLb((kilograms * 2.2046226218).toFixed(1));
      }
    } else if (unit === 'kg' && weightLb) {
      const pounds = Number(weightLb);
      if (Number.isFinite(pounds)) {
        setWeightKg((pounds / 2.2046226218).toFixed(1));
      }
    }

    setWeightUnit(unit);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');

    if (!gender) {
      setNotice('Selecione seu gênero para continuar.');
      return;
    }

    if (!selectedActivity) {
      setNotice('Selecione seu nível de atividade para continuar.');
      return;
    }

    const payload: TmbProfileUpdatePayload = {
      gender,
      ageYears: Number(age),
      activityLevel: selectedActivity.code,
      height:
        heightUnit === 'cm'
          ? { unit: 'CM', value: Number(heightCm) }
          : {
              unit: 'FT_IN',
              feet: Number(heightFeet),
              inches: Number(heightInches),
            },
      weight:
        weightUnit === 'kg'
          ? { unit: 'KG', value: Number(weightKg) }
          : { unit: 'LB', value: Number(weightLb) },
    };

    setIsSaving(true);
    try {
      const updatedProfile = await updateCurrentUserTmbProfile(payload);
      onSaved(updatedProfile);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        window.location.replace('/login');
        return;
      }

      const fieldMessages =
        error instanceof AuthApiError ? Object.values(error.fields).join(' ') : '';
      setNotice(
        fieldMessages
          ? `${getRequestErrorMessage(error)} ${fieldMessages}`
          : getRequestErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="tmb-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby={step === 'profile' ? 'tmb-title' : 'tmb-activity-title'}
        aria-modal="true"
        className={`tmb-dialog${step === 'activity' ? ' tmb-dialog--activity' : ''}`}
        role="dialog"
      >
        {step === 'profile' ? (
          <>
            <header className="tmb-header">
              <span className="tmb-mark" aria-hidden="true">
                ◆
              </span>
              <button
                aria-label="Fechar configuração do perfil"
                autoFocus
                className="tmb-close"
                onClick={onClose}
                type="button"
              >
                ×
              </button>
            </header>

            <div className="tmb-content">
              <p className="tmb-eyebrow">UM CONVITE PARA CUIDAR DO SEU PERFIL</p>
              <h2 id="tmb-title">Vamos completar suas informações?</h2>
              <p className="tmb-intro">
                Com alguns dados, calculamos sua taxa metabólica basal e uma estimativa de
                gasto energético diário, considerando seu nível de atividade.
              </p>
            </div>
            <form className="tmb-profile-form" onSubmit={handleSubmit}>
              <div className="tmb-form-content">
                <fieldset className="tmb-gender">
                  <legend>GÊNERO</legend>
                  {([
                    ['FEMALE', 'Feminino'],
                    ['MALE', 'Masculino'],
                  ] as const).map(([value, label]) => (
                    <button
                      aria-pressed={gender === value}
                      className={`tmb-choice${gender === value ? ' is-selected' : ''}`}
                      key={value}
                      onClick={() => setGender(value)}
                      type="button"
                    >
                      <span className="tmb-radio" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </fieldset>

                <div className="tmb-measurements">
                  <div className="tmb-field">
                    <label htmlFor={heightUnit === 'cm' ? 'tmb-height-cm' : 'tmb-height-feet'}>
                      ALTURA
                    </label>
                    <span className="tmb-input">
                      {heightUnit === 'cm' ? (
                        <input
                          aria-label="Altura em centímetros"
                          id="tmb-height-cm"
                          max="250"
                          min="50"
                          onChange={(event) => setHeightCm(event.currentTarget.value)}
                          placeholder="Sua altura"
                          required
                          step="any"
                          type="number"
                          value={heightCm}
                        />
                      ) : (
                        <span className="tmb-imperial-height">
                          <input
                            aria-label="Altura em pés"
                            id="tmb-height-feet"
                            min="0"
                            onChange={(event) => setHeightFeet(event.currentTarget.value)}
                            placeholder="pés"
                            required
                            type="number"
                            value={heightFeet}
                          />
                          <input
                            aria-label="Altura em polegadas"
                            id="tmb-height-inches"
                            min="0"
                            max="11"
                            onChange={(event) => setHeightInches(event.currentTarget.value)}
                            placeholder="pol"
                            required
                            step="any"
                            type="number"
                            value={heightInches}
                          />
                        </span>
                      )}
                      <span
                        aria-label="Unidade de altura"
                        className="tmb-unit-switch"
                        role="group"
                      >
                        <button
                          aria-pressed={heightUnit === 'cm'}
                          className={heightUnit === 'cm' ? 'is-selected' : ''}
                          onClick={() => changeHeightUnit('cm')}
                          type="button"
                        >
                          cm
                        </button>
                        <button
                          aria-pressed={heightUnit === 'ft'}
                          className={heightUnit === 'ft' ? 'is-selected' : ''}
                          onClick={() => changeHeightUnit('ft')}
                          type="button"
                        >
                          pés / pol
                        </button>
                      </span>
                    </span>
                  </div>

                  <div className="tmb-field">
                    <label htmlFor="tmb-weight">PESO</label>
                    <span className="tmb-input">
                      <input
                        aria-label={`Peso em ${weightUnit === 'kg' ? 'quilogramas' : 'libras'}`}
                        id="tmb-weight"
                        max={weightUnit === 'kg' ? 300 : undefined}
                        min={weightUnit === 'kg' ? 20 : undefined}
                        onChange={(event) =>
                          weightUnit === 'kg'
                            ? setWeightKg(event.currentTarget.value)
                            : setWeightLb(event.currentTarget.value)
                        }
                        placeholder="Seu peso"
                        required
                        step="any"
                        type="number"
                        value={weightUnit === 'kg' ? weightKg : weightLb}
                      />
                      <span
                        aria-label="Unidade de peso"
                        className="tmb-unit-switch"
                        role="group"
                      >
                        <button
                          aria-pressed={weightUnit === 'kg'}
                          className={weightUnit === 'kg' ? 'is-selected' : ''}
                          onClick={() => changeWeightUnit('kg')}
                          type="button"
                        >
                          kg
                        </button>
                        <button
                          aria-pressed={weightUnit === 'lb'}
                          className={weightUnit === 'lb' ? 'is-selected' : ''}
                          onClick={() => changeWeightUnit('lb')}
                          type="button"
                        >
                          lb
                        </button>
                      </span>
                    </span>
                  </div>

                  <div className="tmb-field">
                    <label htmlFor="tmb-age">IDADE</label>
                    <span className="tmb-input">
                      <input
                        aria-label="Idade em anos"
                        id="tmb-age"
                        max="120"
                        min="1"
                        onChange={(event) => setAge(event.currentTarget.value)}
                        placeholder="Sua idade"
                        required
                        type="number"
                        value={age}
                      />
                      <span className="tmb-input-unit">anos</span>
                    </span>
                  </div>
                </div>

                <div className="tmb-field tmb-activity-field">
                  <span className="tmb-field-label">NÍVEL DE ATIVIDADE</span>
                  <button
                    className="tmb-activity-trigger"
                    onClick={() => {
                      setNotice('');
                      setStep('activity');
                    }}
                    type="button"
                  >
                    <span>{selectedActivity?.name ?? 'Selecione uma opção'}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>

                <p className="tmb-note">
                  <span aria-hidden="true">↗</span> Você pode atualizar essas informações
                  depois.
                </p>
                {notice && (
                  <p className="tmb-notice" role="alert">
                    {notice}
                  </p>
                )}
              </div>

              <footer className="tmb-footer">
                <button className="tmb-later" onClick={onClose} type="button">
                  AGORA NÃO
                </button>
                <button className="tmb-primary" disabled={isSaving} type="submit">
                  {isSaving ? 'SALVANDO…' : 'CONTINUAR'} <span aria-hidden="true">→</span>
                </button>
              </footer>
            </form>
          </>
        ) : (
          <div className="tmb-activity-screen">
            <header className="tmb-activity-header">
              <button
                className="tmb-back"
                onClick={() => setStep('profile')}
                type="button"
              >
                <span aria-hidden="true">←</span> VOLTAR
              </button>
              <p>SEU PERFIL · 2 DE 2</p>
            </header>

            <div className="tmb-activity-content">
              <p className="tmb-eyebrow">NÍVEL DE ATIVIDADE</p>
              <h2 id="tmb-activity-title">Como é sua rotina?</h2>
              <p className="tmb-intro">
                Escolha a opção que mais se aproxima do seu nível de atividade hoje.
              </p>

              <div className="tmb-activity-options">
                {activityLevels.map((level) => (
                  <button
                    aria-pressed={activityLevel === level.id}
                    className={`tmb-activity-option${activityLevel === level.id ? ' is-selected' : ''}`}
                    key={level.id}
                    onClick={() => setActivityLevel(level.id)}
                    type="button"
                  >
                    <span className="tmb-radio" aria-hidden="true" />
                    <span className="tmb-activity-copy">
                      <strong>{level.name}</strong>
                      <span>{level.description}</span>
                    </span>
                    <span className="tmb-activity-check" aria-hidden="true">
                      {activityLevel === level.id ? '✓' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <footer className="tmb-activity-footer">
              <span>Você poderá alterar essa informação depois.</span>
              <button
                className="tmb-primary"
                disabled={!activityLevel}
                onClick={() => setStep('profile')}
                type="button"
              >
                CONFIRMAR NÍVEL <span aria-hidden="true">→</span>
              </button>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}

export default TmbSetupModal;
