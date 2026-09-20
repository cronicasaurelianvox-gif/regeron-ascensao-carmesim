# Instruções do projeto

## Objetivo

Este é um RPG de navegador criado para aprendizado utilizando HTML, CSS, JavaScript e Firebase.

## Regras gerais

1. Leia este arquivo antes de modificar o código.
2. Preserve a estrutura existente do projeto.
3. Não crie arquivos desnecessários.
4. Mantenha a lógica do jogo separada da interface e do Firebase.
5. Use JavaScript moderno com módulos ES.
6. Use nomes de variáveis e funções em inglês.
7. Não remova funcionalidades existentes sem explicar o motivo.
8. Não instale dependências novas sem justificar.

## Estrutura

- `src/game/`: regras do jogo.
- `src/ui/`: interface e DOM.
- `src/services/`: Firebase e outros serviços externos.
- `src/styles/`: CSS.
- `tests/`: testes automatizados.
- `public/assets/`: imagens, sons e outros recursos.

## JavaScript

- Use `const` e `let`, nunca `var`.
- Prefira funções pequenas e testáveis.
- Use `async/await` para operações assíncronas.
- Trate erros explicitamente.
- Evite variáveis globais e código duplicado.

## Firebase

- Todo acesso ao Firebase deve ficar em `src/services/`.
- Nunca coloque credenciais administrativas no frontend.
- Nunca versione `.env.local`.
- Nunca use `allow read, write: if true` em regras publicadas.
- Prefira o Firebase Emulator durante o desenvolvimento.
- Não faça deploy, apague dados ou altere regras de segurança sem explicar o impacto.

## Processo obrigatório

Antes de editar:

1. Leia `AGENTS.md` e `README.md`.
2. Examine os arquivos relacionados.
3. Identifique funções existentes que possam ser reutilizadas.

Depois de editar:

1. Execute `npm run lint`.
2. Execute `npm run format:check`.
3. Execute `npm test`.
4. Confirme que os arquivos estão nos locais corretos.

## Resposta ao concluir uma tarefa

Informe:

- Resumo das alterações.
- Arquivos modificados.
- Testes executados e resultados.
- Limitações ou próximos passos.

## Limites

Não faça alterações destrutivas sem autorização explícita. Faça a menor alteração necessária e preserve a arquitetura existente.

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm test
```

## Pedido padrão para a IA

Leia primeiro `AGENTS.md`. Antes de alterar o código, explique brevemente o plano. Faça a menor alteração necessária, crie ou atualize os testes relacionados e execute lint, formatação e testes antes de concluir.
