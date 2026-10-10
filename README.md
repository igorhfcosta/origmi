# OrigamiLab

Plataforma web para aprender origami com instruções passo a passo, animações 3D interativas e exploração matemática das dobras.

## MVP 05

Esta versão reúne os seis marcos posteriores ao MVP 04:

- **Destaque antes da dobra:** as faces que vão se mover ficam amarelas durante uma breve preparação. Depois, a dobra começa. Repetir executa novamente a preparação e todas as fases da etapa.
- **Modo Matemática no modelo:** pontos, segmentos, regiões e arcos de ângulo acompanham as faces durante o movimento. Perguntas e explicações ajudam a investigar simetria, congruência, mediatriz e área.
- **Carregamento para celular:** o motor 3D e o editor são carregados sob demanda; a biblioteca não baixa Three.js. O renderizador desenha novos quadros apenas quando necessário, limita a resolução em aparelhos menores e dispensa sombras neles. Não há dependência de um ambiente HDR externo.
- **Terceiro origami reconhecível:** coração de oito dobras, com arquivo FOLD, etapas e câmera próprios. O modelo conserva a área do quadrado e termina com uma silhueta simétrica.
- **Squash e reverse folds:** o laboratório de dobras coordenadas inclui abertura e achatamento de bolso, inversão para dentro e inversão para fora, com trajetórias que mantêm os vértices compartilhados unidos.
- **Editor visual:** edição, duplicação, remoção e reordenação de etapas; várias fases e vincos por etapa; captura da câmera orbitável; marcações por clique sobre o papel; edição das perguntas; prévia por etapa ou como tutorial completo; importação/exportação JSON e rascunhos locais.

A biblioteca tem quatro conteúdos: **Cachorro de origami**, **Duas dobras fundamentais**, **Coração de origami** e **Dobras coordenadas**.

Continuam disponíveis câmera por etapa, **Vista da etapa**, voltar/repetir/próximo, controle de velocidade, movimento reduzido e aviso para navegadores sem WebGL. O acabamento do cachorro permanece separado das dobras.

## Usar o editor

1. Abra **Editor** e escolha um modelo da biblioteca.
2. Selecione uma etapa e edite seu texto, suas fases ou a exploração matemática.
3. Gire e aproxime a prévia; clique em **Usar esta vista** para guardar a câmera da etapa.
4. Escolha **Ponto**, **Segmento**, **Ângulo** ou **Região** e clique no papel. Segmentos usam dois cliques; ângulos usam três: vértice, primeiro lado e segundo lado, na mesma face.
5. Use **Reproduzir etapa** ou **Testar tutorial**. Exporte o JSON para guardar ou compartilhar a sequência.

Rascunhos válidos ficam em `localStorage`, separados por modelo. Não são publicados nem enviados a um servidor. Se o armazenamento estiver indisponível, a exportação continua disponível. Um JSON exportado pode ser reaberto em **Importar**; o editor valida o formato, as referências e a continuidade antes de aceitar o arquivo. JSONs com referências a outros modelos ou movimentos que separam faces são rejeitados sem substituir o rascunho atual.

O editor trabalha sobre os modelos geométricos existentes; não desenha novos padrões de vinco nem importa arquivos FOLD enviados pelo usuário. Os arquivos `.fold` continuam internos e versionados no projeto.

## Arquitetura

Cada item de `src/data/catalog.ts` combina um modelo FOLD, metadados de faces/vincos, etapas e câmera. O editor usa o mesmo formato das etapas e o mesmo motor da visualização normal.

- `src/engine/types.ts`: contratos de modelos, fases, movimentos, câmeras e marcações.
- `src/engine/origamiEngine.ts`: estados acumulados, replay, faces móveis, eixos atuais e transformação de pontos. `fold` continua compatível com os tutoriais do MVP 04; novas etapas podem usar `phases`.
- `src/engine/tutorialDocument.ts`: esquema JSON versão 1, validação e serialização.
- `src/components/OrigamiModel.tsx`: uma linha do tempo por etapa e matrizes de face calculadas do mesmo estado angular. Marcas e decoração herdam essas matrizes, sem cálculo geométrico paralelo.
- `src/components/TutorialEditor.tsx`: autoria e captura de câmera sobre os modelos do catálogo.

Uma fase simples contém `folds` (um ou mais vincos, com ângulo final e sentido); uma fase coordenada contém `vertex` (mecanismo, técnica e parâmetro angular). Fases são sequenciais; vincos da mesma fase simples são simultâneos. Não combine `fold` e `phases` na mesma etapa.

### Escopo das dobras complexas

O suporte inicial usa um **vértice simétrico de grau quatro** preparado no laboratório, com setores de 45°, 45°, 135° e 135°. A inversão calcula os ângulos seguidores a partir do parâmetro do vinco principal; eles não são interpolados independentemente. O achatamento parte do bolso previamente preparado. A validação exige continuidade ao mudar de técnica e verifica os vértices compartilhados em estados intermediários.

Esse suporte não é um solucionador universal de origami: novos padrões precisam de preparação geométrica compatível. Não há detecção geral de colisões, espessura real do papel nem simulação de flexão entre vincos. Os testes garantem união das faces e conservação geométrica nos modelos publicados; não substituem a verificação física de um novo modelo.

Referência de contexto sobre cadeias fechadas e dobras de grau quatro: Balkcom e Mason, [Robotic origami folding](https://rlab.cs.dartmouth.edu/publications/Balkcom2008.pdf), seção 4.

## Stack

React + TypeScript + Vite; Three.js + React Three Fiber + Drei; GSAP; Zustand; Vitest; Playwright.

## Rodando localmente

```bash
npm ci
npm run dev
```

## Qualidade

```bash
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

Os testes de navegador usam o build de produção em `/origmi/` e cobrem desktop e celular: carregamento sob demanda, preparação/replay, matemática, acabamento, coração, squash/reverse, editor, importação/exportação, armazenamento, movimento reduzido, fallback WebGL e largura de 320 px.

A CI executa TypeScript, testes unitários, build e testes de navegador. Capturas e traces ficam no artefato `browser-checks`. O deploy no GitHub Pages continua automático após alterações em `main`.

## Próximas evoluções

- experimentar os tutoriais com alunos e revisar texto, tempo da preparação e enquadramentos;
- acrescentar modelos que reutilizem os mecanismos coordenados já testados;
- ampliar o catálogo de mecanismos e estudar colisão e ordem das camadas;
- permitir autoria geométrica e publicação de tutoriais, além do editor local atual.
