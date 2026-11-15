# Product

## Visão

O LifeStyle é um projeto para apoiar e conectar pessoas do universo fitness e de academias.

## Público

O produto poderá atender pessoas que treinam, profissionais do ramo fitness e espaços como academias. As necessidades prioritárias de cada público ainda serão exploradas.

## Direção visual

A identidade BLOCO usa grafite (`#222525`), carvão (`#303433`), laranja (`#F26A32`), branco mineral (`#F1F0EA`) e Space Grotesk. A experiência será construída gradualmente, com foco em apoiar a rotina fitness.

## Experiência inicial

### Landing page (`/`)

Apresenta a proposta do LifeStyle, explica de forma geral como o produto funciona, indica para quem se destina e direciona para cadastro ou login. O CTA “Comece agora” leva a `/register`; “Acessar plataforma” leva a `/login`.

### Cadastro (`/register`)

Fluxo de criação de conta para usuários comuns:

- Campos obrigatórios: nome, e-mail e senha.
- Campo opcional: telefone.
- A interface valida presença dos campos obrigatórios, formato de e-mail, nome de até 255 caracteres, e-mail de até 320 caracteres, senha com mínimo de 8 caracteres e telefone de até 50 caracteres.
- O formulário envia os dados para `POST /api/v1/register`. Em sucesso, confirma a criação da conta e oferece um link para o login.
- Erros de validação e e-mail já cadastrado são apresentados ao usuário; indisponibilidade da API também é informada.

O cadastro de negócios, como academias, é uma possibilidade futura e não faz parte deste fluxo.

### Login (`/login`)

Entrada para usuários que já têm uma conta:

- Campos obrigatórios: e-mail e senha.
- A interface valida presença dos campos e formato de e-mail.
- “Criar conta” leva a `/register`.
- “Esqueci a senha” está presente visualmente, mas informa que a recuperação ainda não está disponível.
- O formulário envia as credenciais para `POST /api/v1/login`. Credenciais inválidas recebem uma mensagem genérica.
- Em sucesso, o backend cria uma sessão usando JWT em cookie HttpOnly e a interface redireciona para `/dashboard`.

### Integração de backend

O frontend usa os endpoints documentados em `http://localhost:3000/api/v1`. Em desenvolvimento, o Vite encaminha `/api` ao backend local na porta `3000`, evitando a necessidade de CORS no navegador.

- Cadastro envia `{ name, email, password, phone }`, com `phone: null` quando o campo opcional está vazio. O backend retorna apenas o perfil público; senha e hash não são expostos.
- Login envia `{ email, password }`, retorna o perfil público e define um cookie JWT HttpOnly. O token expira em 15 minutos e não há renovação automática nesta etapa. O frontend não lê nem armazena o JWT; o navegador envia o cookie automaticamente.
- Antes de cada operação `POST`, o frontend solicita `GET /api/v1/csrf`, lê o cookie `XSRF-TOKEN` e envia seu valor no header `X-XSRF-TOKEN`.
- A rota `/dashboard` consulta `GET /api/v1/me` antes de exibir os dados e redireciona ao login em caso de `401`. O botão de saída chama `POST /api/v1/logout` com CSRF e retorna ao login em caso de sucesso.
- Durante o desenvolvimento com HTTP local, configure `AUTH_COOKIE_SECURE=false` no backend para que o navegador aceite o cookie de autenticação. Em produção, use HTTPS e mantenha `Secure` ligado.
- Respostas de erro usam `{ code, message, fields }`. A interface apresenta campos de validação, e-mail já cadastrado e erro genérico de credenciais.
- Senhas são armazenadas com hash no backend. HTTPS deve ser configurado no ambiente de implantação.
- Recuperação de senha, verificação de e-mail e renovação de sessão ainda não estão implementadas.
- Os dados de alimentação e hidratação do dashboard são apenas ilustrativos e ainda não vêm da API.

### Dashboard

Foram criadas cinco direções visuais exploratórias para comparar prioridades e organização:

1. **Visão geral:** resumo da semana, indicadores e próximo treino.
2. **Treino em foco:** destaque para o treino do dia e seus exercícios.
3. **Agenda semanal:** calendário e atividades planejadas.
4. **Evolução:** consistência e indicadores de progresso pessoal.
5. **Comunidade:** atividade social e possibilidades de descoberta.

Essas opções são conceitos para discussão, não uma definição de funcionalidades. A estrutura final do dashboard e recursos como comunidade, desafios e descoberta de espaços ainda precisam ser validados. Os nomes, números e atividades exibidos nos exemplos são ilustrativos.

#### Segunda exploração: treino, alimentação e hidratação

Uma nova rodada explora cinco maneiras de combinar o treino em foco com acompanhamento diário:

1. **Equilíbrio:** treino e exercícios em destaque, com círculos de calorias e água na lateral.
2. **Ritmo do dia:** metas de alimentação e hidratação no topo, treino e sequência de exercícios abaixo.
3. **Alimentação em foco:** registro de refeições e meta calórica como conteúdo principal, treino e hidratação como apoios.
4. **Painel de metas:** sessão de treino à esquerda e calorias, água e refeições organizadas em um painel à direita.
5. **Visão integrada:** meta calórica e refeições em uma coluna ampla; treino e hidratação em módulos compactos ao lado.

Os círculos mostram valores ilustrativos de consumo em relação às metas diárias. A personalização das metas, o registro de refeições e água e as informações nutricionais ainda precisam ser definidos.
