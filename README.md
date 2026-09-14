# OrigamiLab

Protótipo de uma plataforma web para aprender origami com instruções passo a passo e animações 3D interativas.

## MVP 01

Esta primeira versão valida o núcleo do projeto:

- folha quadrada renderizada em 3D;
- câmera orbitável e zoom;
- dobra central de 180° animada;
- linha de vinco e guia visual;
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

1. generalizar o motor para múltiplos vincos e faces;
2. carregar a geometria a partir de dados em vez de componentes fixos;
3. suporte ao formato FOLD;
4. primeiro origami completo;
5. biblioteca de modelos;
6. editor visual de passos.
