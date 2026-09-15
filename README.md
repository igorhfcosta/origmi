# OrigamiLab

Plataforma web para aprender origami com instruções passo a passo, animações 3D interativas e exploração matemática das dobras.

## MVP 04

Esta versão transforma o protótipo em uma pequena plataforma com mais de um tutorial e câmera pedagógica por etapa:

- biblioteca inicial com **Cachorro de origami** e **Duas dobras fundamentais**;
- navegação entre biblioteca e tutorial sem recarregar a aplicação;
- câmera inteligente por etapa, com posição, alvo, FOV e duração definidos nos dados do tutorial;
- botão **Vista da etapa** para recuperar o enquadramento pedagógico depois de explorar livremente o modelo;
- importador interno validado para arquivos `.fold` JSON;
- leitura de `vertices_coords`, `edges_vertices`, `edges_assignment` e `faces_vertices`;
- união de vários segmentos colineares em um único vinco animável;
- eixos de vincos posteriores reposicionados pelas dobras anteriores;
- estados anterior, atual e de repetição calculados pelo motor;
- câmera orbitável e zoom continuam disponíveis após o movimento guiado;
- linhas de vinco e setas geradas a partir dos dados;
- etapas anterior / repetir / próxima;
- controle de velocidade;
- **Modo Matemática** com observações geométricas por etapa;
- suporte a `prefers-reduced-motion`;
- fallback para navegadores sem WebGL;
- testes unitários da importação, matemática da dobra, catálogo e estado do tutorial;
- CI com checagem TypeScript, testes e build;
- deploy automático no GitHub Pages.

Os arquivos FOLD são usados **internamente e versionados junto do projeto**. O MVP 04 não oferece upload ou importação de arquivos pelo usuário.

## Arquitetura de conteúdo

Cada item da biblioteca combina:

1. um modelo geométrico FOLD;
2. metadados de faces e vincos;
3. uma sequência pedagógica de etapas;
4. um enquadramento de câmera específico por etapa.

Isso permite adicionar novos origamis sem reescrever o motor 3D.

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

1. adicionar um terceiro origami reconhecível, como barco ou coração;
2. destacar visualmente as faces que irão se mover antes de cada dobra;
3. aprofundar o Modo Matemática com marcações diretamente sobre o modelo;
4. otimizar o carregamento do motor 3D para celular;
5. suportar squash/reverse folds;
6. criar o editor visual de passos e enquadramentos.
