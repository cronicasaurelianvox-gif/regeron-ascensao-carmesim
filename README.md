# Re:Geron — Ascensão Carmesim

Projeto inicial para aprendizado de HTML, CSS, JavaScript e Firebase.

## Tecnologias

- HTML
- CSS
- JavaScript com módulos ES
- Vite
- ESLint
- Prettier
- Vitest
- Firebase, preparado mas ainda não configurado

## Requisitos

- Node.js 20 ou superior
- npm

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Depois, abra o endereço mostrado no terminal.

## Verificações

```bash
npm run lint
npm run format:check
npm test
npm run build
```

## Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Registre um aplicativo Web.
3. Copie `.env.example` para `.env.local`.
4. Preencha os valores do Firebase em `.env.local`.
5. Nunca publique `.env.local` no GitHub.
6. Configure o Firebase Emulator antes de testar com dados reais.

A integração fica em `src/services/firebase.js`. Por enquanto, o jogo funciona sem Firebase.

## Estrutura

```text
src/
├── game/       # Regras do jogo
├── services/   # Firebase e serviços externos
├── styles/     # CSS
└── ui/         # Interface

tests/          # Testes automatizados
public/assets/  # Imagens, sons e outros recursos
```

## Subir para o GitHub

Depois de criar um repositório vazio no GitHub:

```bash
git init
git add .
git commit -m "chore: inicia projeto do jogo"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Não inclua senhas, tokens, arquivos `.env.local` ou credenciais administrativas.
