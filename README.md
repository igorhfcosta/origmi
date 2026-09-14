# OrigamiLab

Protótipo de uma plataforma web para aprender origami com instruções passo a passo e animações 3D interativas.

## MVP 03

Esta versão transforma o motor técnico em um primeiro tutorial de origami completo:

- importador validado para arquivos `.fold` JSON;
- leitura de `vertices_coords`, `edges_vertices`, `edges_assignment` e `faces_vertices`;
- união de vários segmentos colineares em um único vinco animável;
- mensagens claras para arquivos inválidos ou ainda não suportados;
- cachorro de origami carregado de `dog.fold`;
- dobra da base e duas orelhas em sequência;
- eixos de vincos posteriores reposicionados pelas dobras anteriores;
- olhos e nariz vinculados à face correta;
- estados anterior, atual e de repetição calculados pelo motor;
- câmera orbitável e zoom;
- linhas de vinco e setas geradas a partir dos dados;
- etapas anterior / repetir / próxima;
- controle de velocidade;
- primeiro experimento do **Modo Matemática**;
- suporte a `prefers-reduced-motion`;
- testes unitários da importação, matemática da dobra e estado do tutorial;
- CI com checagem TypeScript, testes e build.

O formato segue a [especificação FOLD 1.2](https://github.com/edemaine/fold/blob/main/doc/spec.md). A geometria fica no arquivo FOLD; as decisões pedagógicas — texto, ordem e faces movimentadas — permanecem em dados separados do tutorial.

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

1. adicionar enquadramentos de câmera específicos por etapa;
2. criar a biblioteca de modelos;
3. permitir upload local de arquivos FOLD;
4. suportar squash/reverse folds;
5. criar o editor visual de passos.
