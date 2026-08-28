# Savoi Tattoo — guia do projeto

Site do Savoi, tatuador de blackwork e dark art em Belo Horizonte.
HTML + CSS + JS puro, tudo em `index.html`, sem framework e sem build. Abre
direto no navegador ou hospeda no GitHub Pages.

## Estrutura

- `index.html` — página inteira (html, css e js no mesmo arquivo)
- `imagens/` — fotos e imagens do site
- `videos/` — vídeo da seção "sobre"

## Identidade visual

Estética analógica/grunge de estúdio de tatuagem: fundo escuro (`#141210`),
vermelho de destaque (`#d6301f`), fontes `Oswald` (títulos) e `IBM Plex Mono`
(corpo), fotos em moldura de polaroid levemente giradas, fita adesiva,
faixa de texto correndo (ticker). Tom de voz do texto: direto, informal,
BH ("sô", "vamo trocar uma ideia").

Nomes de classe, variáveis CSS e variáveis JS são em português
(`.menu`, `.capa`, `.botao`, `--destaque`, `videoSobre` etc.) — manter esse
padrão em qualquer código novo, não introduzir nomes em inglês.

## Animações — evitar o genérico

Não usar fade-in simples e igual em tudo. Preferir:

- Entrada escalonada (staggered): elementos aparecendo em sequência com
  pequeno atraso entre eles, não todos juntos.
- Toques que reforcem a identidade: giro leve em fotos (`rotate(-2deg)`
  etc.), efeito de revelar cor no hover (grayscale → cor), sombra que cresce
  no hover, faixa de texto em loop.
- Antes de aceitar uma animação como pronta, perguntar: "isso poderia estar
  em qualquer site, ou é claramente do Savoi Tattoo?" Se for genérico
  demais, refazer com mais personalidade.
- CSS puro é suficiente pro que o site precisa hoje. Só sugerir uma lib
  (GSAP, anime.js) se for pedido algo que CSS não dá conta (parallax
  complexo, scroll-trigger elaborado).

## Imagens

Claude não gera imagens/fotos do zero. Para arte nova:
- Preferir SVG desenhado à mão ou efeitos em CSS quando possível.
- Se precisar de uma imagem gerada por IA de verdade, avisar que precisa de
  uma ferramenta externa conectada (ex.: MCP de geração de imagem) e não
  inventar/alucinar que a imagem foi criada sem ela.
- Fotos reais (do trabalho do tatuador) sempre vêm do usuário — não
  substituir por imagem gerada sem avisar.

## Idioma

Todo texto, commit, comentário e nome de variável em português. Só ficam em
inglês sintaxe obrigatória de HTML/CSS/JS, nomes próprios (WhatsApp,
Instagram, nomes de fontes) e termos de estilo de tatuagem sem tradução
usada no meio (blackwork, dark art).
