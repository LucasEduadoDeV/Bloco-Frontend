# LifeStyle Frontend

Aplicação web do LifeStyle/BLOCO, construída com React, TypeScript, Vite e Tailwind CSS.

## Desenvolvimento

Na pasta `FrontEnd/`, instale as dependências e inicie o servidor local:

```bash
npm install
npm run dev
```

Para validar a aplicação e gerar os arquivos de produção em `dist/`:

```bash
npm run build
npm run preview
```

## Rotas

- `/` — landing page.
- `/register` — cadastro de usuário.
- `/login` — login.

Cadastro e login consomem a API local por meio do proxy do Vite (`/api` → `http://localhost:3000`). Para testar a autenticação em HTTP local, configure `AUTH_COOKIE_SECURE=false` no backend; em produção, use HTTPS e mantenha o cookie `Secure` habilitado. O JWT fica em cookie HttpOnly e não é acessado pelo frontend.

O login redireciona para `/dashboard`, que valida a sessão em `/api/v1/me`. Consulte [Product.md](docs/Product.md) para os contratos e fluxos de autenticação.

## Documentação

- [Product](docs/Product.md) — visão geral do produto, fluxos e proposta de integração para autenticação.
- [Tools](docs/Tools.md) — stack e ferramentas do frontend.
