export interface PublicProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export type TmbGender = 'FEMALE' | 'MALE';

export interface TmbProfileData {
  age: number | null;
  gender: TmbGender | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: number | null;
}

export interface UpdatedTmbProfile extends TmbProfileData {
  basalMetabolicRateKcal: number;
  estimatedDailyEnergyExpenditureKcal: number;
}

export interface CurrentUserProfile extends PublicProfile, TmbProfileData {
  basalMetabolicRateKcal: number;
  estimatedDailyEnergyExpenditureKcal: number;
  dailyCalorieConsumptionKcal: number;
  waterConsumptionGoalMl: number;
  dailyWaterConsumptionMl: number;
}

export interface TmbProfileUpdatePayload {
  gender: TmbGender;
  ageYears: number;
  activityLevel: number;
  height:
    | { unit: 'CM'; value: number }
    | { unit: 'FT_IN'; feet: number; inches: number };
  weight: { unit: 'KG' | 'LB'; value: number };
}

interface ApiErrorResponse {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

export class AuthApiError extends Error {
  code: string;
  fields: Record<string, string>;
  status: number;

  constructor(
    message: string,
    status: number,
    code = 'API_ERROR',
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.fields = fields;
    this.status = status;
  }
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch('/api/v1/csrf', {
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new AuthApiError(
      `Não foi possível iniciar a solicitação (${response.status}).`,
      response.status,
      'CSRF_TOKEN_ERROR',
    );
  }

  const csrfCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
  if (!csrfCookie) {
    throw new Error('A API não retornou o cookie de proteção CSRF.');
  }

  return decodeURIComponent(csrfCookie.slice('XSRF-TOKEN='.length));
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (responseText.length > 0) {
    try {
      return JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error('A API retornou uma resposta inválida.');
      }
    }
  }

  return undefined;
}

function throwApiError(response: Response, responseBody: unknown): never {
  const apiError = responseBody as ApiErrorResponse | undefined;
  throw new AuthApiError(
    apiError?.message ?? `Não foi possível concluir a solicitação (${response.status}).`,
    response.status,
    apiError?.code,
    apiError?.fields,
  );
}

function readPublicProfile(responseBody: unknown): PublicProfile {
  if (
    typeof responseBody !== 'object' ||
    responseBody === null ||
    !('id' in responseBody) ||
    typeof responseBody.id !== 'string' ||
    !('name' in responseBody) ||
    typeof responseBody.name !== 'string' ||
    !('email' in responseBody) ||
    typeof responseBody.email !== 'string' ||
    !('phone' in responseBody) ||
    (typeof responseBody.phone !== 'string' && responseBody.phone !== null)
  ) {
    throw new Error('A API retornou um perfil inválido.');
  }

  return {
    id: responseBody.id,
    name: responseBody.name,
    email: responseBody.email,
    phone: responseBody.phone,
  };
}

function readCurrentUserProfile(responseBody: unknown): CurrentUserProfile {
  const profile = readPublicProfile(responseBody);
  const body = responseBody as Record<string, unknown>;
  const metricFields = [
    'basalMetabolicRateKcal',
    'estimatedDailyEnergyExpenditureKcal',
    'dailyCalorieConsumptionKcal',
    'waterConsumptionGoalMl',
    'dailyWaterConsumptionMl',
  ] as const;

  for (const field of metricFields) {
    const value = body[field];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new Error('A API retornou dados de consumo inválidos.');
    }
  }

  const age = body.age;
  const gender = body.gender;
  const heightCm = body.heightCm;
  const weightKg = body.weightKg;
  const activityLevel = body.activityLevel;
  if (
    (age !== undefined && age !== null && (typeof age !== 'number' || !Number.isInteger(age))) ||
    (gender !== undefined &&
      gender !== null &&
      gender !== 'FEMALE' &&
      gender !== 'MALE') ||
    (heightCm !== undefined &&
      heightCm !== null &&
      (typeof heightCm !== 'number' || !Number.isFinite(heightCm))) ||
    (weightKg !== undefined &&
      weightKg !== null &&
      (typeof weightKg !== 'number' || !Number.isFinite(weightKg))) ||
    (activityLevel !== undefined &&
      activityLevel !== null &&
      (typeof activityLevel !== 'number' || !Number.isInteger(activityLevel)))
  ) {
    throw new Error('A API retornou dados de configuração do perfil inválidos.');
  }

  return {
    ...profile,
    age: typeof age === 'number' ? age : null,
    gender: gender === 'FEMALE' || gender === 'MALE' ? gender : null,
    heightCm: typeof heightCm === 'number' ? heightCm : null,
    weightKg: typeof weightKg === 'number' ? weightKg : null,
    activityLevel: typeof activityLevel === 'number' ? activityLevel : null,
    basalMetabolicRateKcal: body.basalMetabolicRateKcal as number,
    estimatedDailyEnergyExpenditureKcal: body.estimatedDailyEnergyExpenditureKcal as number,
    dailyCalorieConsumptionKcal: body.dailyCalorieConsumptionKcal as number,
    waterConsumptionGoalMl: body.waterConsumptionGoalMl as number,
    dailyWaterConsumptionMl: body.dailyWaterConsumptionMl as number,
  };
}

async function post<T>(
  endpoint: string,
  payload: object,
  expectedStatus: number,
): Promise<T> {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`/api/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throwApiError(response, responseBody);
  }

  if (response.status !== expectedStatus) {
    throw new AuthApiError(
      'A API retornou um status inesperado. Tente novamente.',
      response.status,
      'UNEXPECTED_RESPONSE',
    );
  }

  return readPublicProfile(responseBody) as T;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload) {
  return post<PublicProfile>('register', payload, 201);
}

export function login(payload: LoginPayload) {
  return post<PublicProfile>('login', payload, 200);
}

export async function getCurrentUser(signal?: AbortSignal): Promise<CurrentUserProfile> {
  const response = await fetch('/api/v1/me', {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    signal,
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throwApiError(response, responseBody);
  }

  return readCurrentUserProfile(responseBody);
}

export async function updateCurrentUserTmbProfile(
  payload: TmbProfileUpdatePayload,
): Promise<UpdatedTmbProfile> {
  const csrfToken = await getCsrfToken();
  const response = await fetch('/api/v1/me/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throwApiError(response, responseBody);
  }

  if (response.status !== 200) {
    throw new AuthApiError(
      'A API retornou um status inesperado. Tente novamente.',
      response.status,
      'UNEXPECTED_RESPONSE',
    );
  }

  if (typeof responseBody !== 'object' || responseBody === null) {
    throw new Error('A API retornou um perfil atualizado inválido.');
  }

  const body = responseBody as Record<string, unknown>;
  const gender = body.gender;
  const age = body.ageYears;
  const heightCm = body.heightCm;
  const weightKg = body.weightKg;
  const activityLevel = body.activityLevel;
  const basalMetabolicRateKcal = body.basalMetabolicRateKcal;
  const estimatedDailyEnergyExpenditureKcal = body.estimatedDailyEnergyExpenditureKcal;

  if (
    (gender !== 'FEMALE' && gender !== 'MALE') ||
    typeof age !== 'number' ||
    !Number.isInteger(age) ||
    typeof heightCm !== 'number' ||
    !Number.isFinite(heightCm) ||
    typeof weightKg !== 'number' ||
    !Number.isFinite(weightKg) ||
    typeof activityLevel !== 'number' ||
    !Number.isInteger(activityLevel) ||
    activityLevel < 1 ||
    activityLevel > 5 ||
    typeof basalMetabolicRateKcal !== 'number' ||
    !Number.isInteger(basalMetabolicRateKcal) ||
    basalMetabolicRateKcal < 0 ||
    typeof estimatedDailyEnergyExpenditureKcal !== 'number' ||
    !Number.isInteger(estimatedDailyEnergyExpenditureKcal) ||
    estimatedDailyEnergyExpenditureKcal < 0
  ) {
    throw new Error('A API retornou um perfil atualizado inválido.');
  }

  return {
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    basalMetabolicRateKcal,
    estimatedDailyEnergyExpenditureKcal,
  };
}

export async function logout(): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch('/api/v1/logout', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    credentials: 'same-origin',
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throwApiError(response, responseBody);
  }
}

export function getRequestErrorMessage(error: unknown) {
  if (error instanceof AuthApiError) {
    if (error.code === 'EMAIL_ALREADY_REGISTERED') {
      return 'Este e-mail já está cadastrado. Entre na sua conta ou use outro e-mail.';
    }

    if (error.code === 'INVALID_CREDENTIALS') {
      return 'E-mail ou senha incorretos.';
    }

    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Não foi possível conectar à API. Verifique se o backend está ativo na porta 3000.';
  }

  return error instanceof Error
    ? error.message
    : 'Ocorreu um erro inesperado. Tente novamente.';
}
