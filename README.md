# OrigamiLab

Protótipo de uma plataforma web para aprender origami com instruções passo a passo e animações 3D interativas.

## MVP 02

Esta versão transforma a primeira demonstração em um motor de dobras orientado a dados:

- folha dividida em faces independentes cadastradas por vértices;
- vincos com eixo, direção e conjunto de faces afetadas;
- composição de duas dobras acumuladas em uma única sequência;
- estados anterior, atual e de repetição calculados pelo motor;
- validação estrutural do modelo;
- câmera orbitável e zoom;
- linhas de vinco e setas geradas a partir dos dados;
- etapas anterior / repetir / próxima;
- controle de velocidade;
- primeiro experimento do **Modo Matemática**;
- suporte a `prefers-reduced-motion`;
- testes unitários da matemática da dobra e do estado do tutorial;
- CI com checagem TypeScript, testes e build.

## Stack

- React + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- GSAP
- Zustand
- Vitest

## Rodando localmente

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run check
npm test
npm run build
```

## Próximos marcos

1. importar geometria no formato FOLD;
2. criar o primeiro origami simples completo;
3. adicionar câmeras específicas por etapa;
4. biblioteca de modelos;
5. editor visual de passos.
