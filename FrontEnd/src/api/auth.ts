export interface PublicProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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

async function post<T>(endpoint: string, payload: object): Promise<T> {
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
  return post<PublicProfile>('register', payload);
}

export function login(payload: LoginPayload) {
  return post<PublicProfile>('login', payload);
}

export async function getCurrentUser(signal?: AbortSignal): Promise<PublicProfile> {
  const response = await fetch('/api/v1/me', {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    signal,
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throwApiError(response, responseBody);
  }

  return readPublicProfile(responseBody);
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
