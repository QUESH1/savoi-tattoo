(function () {
  'use strict';

  var html = document.documentElement;
  var reduzido = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduzido) html.classList.add('reduzido');

  var temGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var temLenis = typeof window.Lenis !== 'undefined';
  var ponteiroFino = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  if (temGsap) gsap.registerPlugin(ScrollTrigger);

  var loader = document.getElementById('loader');
  var cortina = document.getElementById('cortina');
  var jaRevelou = false;

  /* ---------------------------------------------------------
     preloader + cortina — some sempre, com ou sem GSAP
     --------------------------------------------------------- */
  function revelarSemAnimacao() {
    if (jaRevelou) return;
    jaRevelou = true;
    if (loader) loader.style.display = 'none';
    if (cortina) cortina.style.display = 'none';
    html.classList.remove('sem-rolagem');
    if (window.lenisSavoi) window.lenisSavoi.start();
    // garante que o herói fique visível mesmo se o gsap.set de esconder
    // já tiver rodado e a animação normal não tenha chegado a completar
    if (temGsap) {
      gsap.set('.capa-titulo .linha span', { yPercent: 0 });
      gsap.set('.capa-conteudo .aparecer', { opacity: 1, y: 0 });
    }
  }

  function iniciarPreloader() {
    var mancha = document.getElementById('loader-mancha');

    if (!temGsap || reduzido) { revelarSemAnimacao(); return; }

    // esconde o título/hero ANTES da cortina abrir, enquanto ainda está
    // coberto — assim não há flash do conteúdo em estado "normal"
    gsap.set('.capa-titulo .linha span', { yPercent: 105 });
    gsap.set('.capa-conteudo .aparecer', { opacity: 0, y: 18 });
    if (mancha) gsap.set(mancha, { opacity: 0, scale: .82, clipPath: 'inset(100% 0 0 0)' });

    var tl = gsap.timeline({
      delay: .2,
      onComplete: function () {
        jaRevelou = true;
        loader.style.display = 'none';
        cortina.style.display = 'none';
        html.classList.remove('sem-rolagem');
        if (window.lenisSavoi) window.lenisSavoi.start();
        iniciarHero();
      }
    });

    if (mancha) {
      tl.to(mancha, { opacity: 1, scale: 1, clipPath: 'inset(0% 0 0 0)', duration: .9, ease: 'power3.out' });
    } else {
      tl.to({}, { duration: .5 });
    }
    tl.to('.loader-texto', { opacity: 0, duration: .3 }, '-=.15');
    if (mancha) tl.to(mancha, { opacity: 0, scale: .92, duration: .3 }, '<');
    tl.to(cortina, { scaleY: 0, duration: .95, ease: 'power4.inOut' }, '-=.05');
  }

  // rede de segurança: se algo travar, a página nunca fica presa atrás da cortina
  setTimeout(revelarSemAnimacao, 4500);
  html.classList.add('sem-rolagem');

  /* ---------------------------------------------------------
     lenis — rolagem suave, integrada ao ticker do gsap
     --------------------------------------------------------- */
  var lenis = null;
  if (temLenis && !reduzido) {
    lenis = new Lenis({ duration: 1.05, easing: function (t) { return 1 - Math.pow(1 - t, 3); } });
    lenis.stop();
    window.lenisSavoi = lenis;
    if (temGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function passo(t) { lenis.raf(t); requestAnimationFrame(passo); });
    }
  }

  /* ---------------------------------------------------------
     hero — título entra em linhas, resto sobe em sequência
     --------------------------------------------------------- */
  function iniciarHero() {
    if (!temGsap) return;
    var linhas = document.querySelectorAll('.capa-titulo .linha span');
    var grupo = document.querySelectorAll('.capa-conteudo .aparecer');

    gsap.timeline()
      .to(linhas, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .12 })
      .to(grupo, { opacity: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .1 }, '-=.65');
  }

  /* ---------------------------------------------------------
     revelação por máscara ao rolar — textos, fotos, títulos
     --------------------------------------------------------- */
  function iniciarRevelacoes() {
    if (!temGsap || reduzido) return;
    var itens = document.querySelectorAll('.revelar-item');
    gsap.set(itens, { clipPath: 'inset(0 0 100% 0)' });
    itens.forEach(function (el) {
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ---------------------------------------------------------
     paralaxe leve nas imagens de fundo
     --------------------------------------------------------- */
  function iniciarParalaxe() {
    if (!temGsap || reduzido) return;
    gsap.to('#capa-fundo', {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: { trigger: '.capa', start: 'top top', end: 'bottom top', scrub: true }
    });
    var contatoFundo = document.getElementById('contato-fundo');
    if (contatoFundo) {
      gsap.to(contatoFundo, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.contato', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }

  /* ---------------------------------------------------------
     como funciona — linha do tempo enche conforme rola,
     números batem quando a etapa entra na tela
     --------------------------------------------------------- */
  function iniciarProcesso() {
    if (!temGsap) return;
    var etapas = document.querySelector('.etapas');
    var linha = document.getElementById('etapas-linha-preenchida');
    if (!etapas) return;

    if (linha && !reduzido) {
      gsap.to(linha, {
        height: '100%',
        ease: 'none',
        scrollTrigger: { trigger: etapas, start: 'top 60%', end: 'bottom 75%', scrub: true }
      });
    }
    document.querySelectorAll('.etapa-numero').forEach(function (numero) {
      gsap.to(numero, {
        scale: 1,
        duration: .6,
        ease: 'back.out(3)',
        scrollTrigger: { trigger: numero, start: 'top 82%' }
      });
    });
  }

  /* ---------------------------------------------------------
     índice de seções — pontinhos que acompanham a rolagem
     --------------------------------------------------------- */
  function iniciarIndice() {
    var pontos = document.querySelectorAll('.indice a');
    if (!pontos.length) return;

    pontos.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var alvo = document.querySelector(a.getAttribute('href'));
        if (!alvo) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(alvo, { duration: 1.1 });
        else alvo.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth' });
      });
    });

    if (!temGsap) return;
    var ids = ['topo', 'sobre', 'portfolio', 'processo', 'contato'];
    ids.forEach(function (id, i) {
      var secao = document.getElementById(id);
      if (!secao) return;
      ScrollTrigger.create({
        trigger: secao,
        start: 'top center',
        end: 'bottom center',
        onEnter: function () { marcarAtivo(i); },
        onEnterBack: function () { marcarAtivo(i); }
      });
    });
    function marcarAtivo(i) {
      pontos.forEach(function (a) { a.classList.remove('ativo'); });
      var atual = document.querySelector('.indice a[data-idx="' + i + '"]');
      if (atual) atual.classList.add('ativo');
    }
  }

  /* ---------------------------------------------------------
     menu — sombra depois que rola um pouco
     --------------------------------------------------------- */
  function iniciarMenu() {
    var menu = document.querySelector('.menu');
    if (!menu) return;
    function aoRolar(y) {
      if (y > 8) menu.classList.add('rolado');
      else menu.classList.remove('rolado');
    }
    if (lenis) lenis.on('scroll', function (e) { aoRolar(e.scroll); });
    else window.addEventListener('scroll', function () { aoRolar(window.scrollY); });
  }

  /* ---------------------------------------------------------
     menu mobile — painel cheio, abre com o hambúrguer
     --------------------------------------------------------- */
  function iniciarMenuMobile() {
    var botao = document.getElementById('menu-alternar');
    var painel = document.getElementById('menu-mobile');
    if (!botao || !painel) return;

    function fechar() {
      painel.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
      html.classList.remove('sem-rolagem');
      if (lenis) lenis.start();
    }
    function abrir() {
      painel.classList.add('aberto');
      botao.setAttribute('aria-expanded', 'true');
      html.classList.add('sem-rolagem');
      if (lenis) lenis.stop();
    }
    botao.addEventListener('click', function () {
      if (painel.classList.contains('aberto')) fechar(); else abrir();
    });
    painel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', fechar);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && painel.classList.contains('aberto')) fechar();
    });
  }

  /* ---------------------------------------------------------
     faixa corrida — anda sozinha, acelera com o scroll,
     e pode ser arrastada com o dedo ou o mouse
     --------------------------------------------------------- */
  function iniciarFaixa() {
    var faixa = document.getElementById('faixa');
    var trilha = document.getElementById('faixa-trilha');
    if (!faixa || !trilha) return;

    var largura = 0;
    var x = 0;
    var velBase = reduzido ? 0 : .5;
    var velAlvo = velBase;
    var velAtual = velBase;
    var arrastando = false;
    var inicioPonteiro = 0;
    var inicioX = 0;

    function medir() { largura = trilha.scrollWidth / 2; }
    medir();
    window.addEventListener('resize', medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

    if (lenis) {
      lenis.on('scroll', function (e) {
        var v = Math.min(Math.abs(e.velocity || 0), 45);
        velAlvo = velBase + v * .1;
      });
    }

    function passo() {
      if (!arrastando) {
        velAtual += (velAlvo - velAtual) * .06;
        velAlvo += (velBase - velAlvo) * .015;
        x -= velAtual;
      }
      if (largura > 0) {
        if (x <= -largura) x += largura;
        if (x > 0) x -= largura;
      }
      trilha.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);

    faixa.addEventListener('pointerdown', function (e) {
      arrastando = true;
      faixa.classList.add('arrastando');
      inicioPonteiro = e.clientX;
      inicioX = x;
      faixa.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    faixa.addEventListener('pointermove', function (e) {
      if (!arrastando) return;
      x = inicioX + (e.clientX - inicioPonteiro);
    });
    function soltar() { arrastando = false; faixa.classList.remove('arrastando'); }
    faixa.addEventListener('pointerup', soltar);
    faixa.addEventListener('pointercancel', soltar);
    faixa.addEventListener('pointerleave', function () { if (arrastando) soltar(); });
  }

  /* ---------------------------------------------------------
     tilt 3d na polaroid do "quem é savoi"
     --------------------------------------------------------- */
  function iniciarTiltSobre() {
    if (!temGsap || !ponteiroFino || reduzido) return;
    var alvo = document.getElementById('sobre-foto');
    var polaroid = alvo ? alvo.querySelector('.polaroid') : null;
    if (!alvo || !polaroid) return;
    alvo.addEventListener('pointermove', function (e) {
      var r = alvo.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - .5;
      var py = (e.clientY - r.top) / r.height - .5;
      gsap.to(polaroid, { rotateY: px * 16, rotateX: py * -16, duration: .5, ease: 'power3.out' });
    });
    alvo.addEventListener('pointerleave', function () {
      gsap.to(polaroid, { rotateY: 0, rotateX: 0, duration: .6, ease: 'power3.out' });
    });
  }

  /* ---------------------------------------------------------
     vídeo "quem é savoi" com botão de tocar próprio
     --------------------------------------------------------- */
  function iniciarVideoSobre() {
    var video = document.getElementById('video-sobre');
    var botao = document.querySelector('.botao-tocar');
    if (!video || !botao) return;

    botao.addEventListener('click', function () {
      video.controls = true;
      video.play();
      botao.classList.add('escondido');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime > 0 && !video.ended) botao.classList.remove('escondido');
    });
    video.addEventListener('play', function () { botao.classList.add('escondido'); });
    video.addEventListener('ended', function () {
      video.controls = false;
      botao.classList.remove('escondido');
    });
  }

  /* ---------------------------------------------------------
     vídeos de fundo (contato e "vamo tatuar") — autoplay em
     loop, mudo, só quando visíveis; funciona em qualquer
     navegador porque nunca depende só do autoplay nativo
     --------------------------------------------------------- */
  function iniciarVideosFundo() {
    var videos = [document.getElementById('outro-fundo')]
      .filter(function (v) { return !!v; });
    if (!videos.length || reduzido) return;

    function tentarTocar(video) {
      var promessa = video.play();
      if (promessa && promessa.catch) promessa.catch(function () { /* navegador bloqueou, tenta de novo depois */ });
    }

    if ('IntersectionObserver' in window) {
      var observador = new IntersectionObserver(function (itens) {
        itens.forEach(function (item) {
          if (item.isIntersecting) tentarTocar(item.target);
          else item.target.pause();
        });
      }, { threshold: .15 });
      videos.forEach(function (v) { observador.observe(v); });
    } else {
      videos.forEach(tentarTocar);
    }

    // navegadores mais restritos só liberam o play() depois de um gesto do usuário
    function retentarNoGesto() {
      videos.forEach(function (v) {
        if (v.paused && v.getBoundingClientRect().top < window.innerHeight) tentarTocar(v);
      });
    }
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (evento) {
      document.addEventListener(evento, retentarNoGesto, { once: true, passive: true });
    });
  }

  /* ---------------------------------------------------------
     carrossel do portfólio — deck escuro em loop automático,
     tipo "profundidade de campo": a peça central fica grande
     e nítida, as demais encolhem, escurecem e descem conforme
     se afastam do centro. Arrasta pra navegar manualmente.
     --------------------------------------------------------- */
  function iniciarCarrossel() {
    var carrossel = document.querySelector('.carrossel');
    var trilha = document.getElementById('carrossel-trilha');
    var btnAnterior = document.querySelector('.carrossel-anterior');
    var btnProximo = document.querySelector('.carrossel-proximo');
    if (!carrossel || !trilha) return;

    // duplica as peças via JS (não no HTML) pra fechar o loop infinito
    // sem duplicar o peso das imagens na página
    var originais = Array.prototype.slice.call(trilha.querySelectorAll('.peca'));
    if (!originais.length) return;
    originais.forEach(function (peca) {
      var clone = peca.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      trilha.appendChild(clone);
    });
    var pecas = Array.prototype.slice.call(trilha.querySelectorAll('.peca'));

    var largura = 0;
    var x = 0;
    var velBase = reduzido ? 0 : .45;
    var velAtual = velBase;
    var arrastando = false;
    var moveu = false;
    var pausado = false;
    var inicioPonteiro = 0;
    var inicioX = 0;

    function medir() { largura = trilha.scrollWidth / 2; }
    medir();
    window.addEventListener('resize', medir);
    window.addEventListener('load', medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

    function aplicarProfundidade() {
      var rect = carrossel.getBoundingClientRect();
      var centro = rect.left + rect.width / 2;
      var raio = (rect.width / 2) || 1;
      var deltas = pecas.map(function (peca) {
        var r = peca.getBoundingClientRect();
        var d = ((r.left + r.width / 2) - centro) / raio;
        d = d < -0.85 ? -0.85 : (d > 0.85 ? 0.85 : d);
        return d / 0.85;
      });
      pecas.forEach(function (peca, i) {
        var d = deltas[i];
        var abs = d < 0 ? -d : d;
        peca.style.transform = 'translateY(' + (abs * 40).toFixed(2) + 'px) scale(' + (1 - abs * .46).toFixed(3) + ')';
        peca.style.filter = 'brightness(' + Math.max(1 - abs * .78, .28).toFixed(3) + ')';
        peca.style.opacity = (1 - abs * .2).toFixed(2);
        peca.style.zIndex = String(200 - Math.round(abs * 150));
      });
    }

    function passo() {
      if (!arrastando && !pausado && !emTransicaoSeta) x -= velAtual;
      if (largura > 0) {
        if (x <= -largura) x += largura;
        if (x > 0) x -= largura;
      }
      trilha.style.transform = 'translateX(' + x + 'px)';
      aplicarProfundidade();
      requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);

    carrossel.addEventListener('pointerenter', function () { pausado = true; });
    carrossel.addEventListener('pointerleave', function () { pausado = false; if (arrastando) soltar(); });

    var pecaAlvo = null;

    // obs: trilha.setPointerCapture faz o navegador redirecionar o evento
    // "click" nativo pra disparar na própria trilha, não na peça sob o dedo/
    // mouse — por isso a abertura do lightbox é feita aqui manualmente
    // (via pecaAlvo.click()) em vez de depender do bubbling do clique.
    trilha.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      arrastando = true;
      moveu = false;
      inicioPonteiro = e.clientX;
      inicioX = x;
      pecaAlvo = e.target.closest ? e.target.closest('.peca') : null;
      trilha.classList.add('arrastando');
      trilha.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    trilha.addEventListener('pointermove', function (e) {
      if (!arrastando) return;
      var delta = e.clientX - inicioPonteiro;
      if (Math.abs(delta) > 5) moveu = true;
      x = inicioX + delta;
    });
    function soltar() {
      arrastando = false;
      trilha.classList.remove('arrastando');
      if (!moveu && pecaAlvo) pecaAlvo.click();
      pecaAlvo = null;
    }
    trilha.addEventListener('pointerup', soltar);
    trilha.addEventListener('pointercancel', function () { pecaAlvo = null; arrastando = false; trilha.classList.remove('arrastando'); });
    trilha.addEventListener('pointerleave', function () { if (arrastando) soltar(); });
    trilha.addEventListener('dragstart', function (e) { e.preventDefault(); });

    function largoDoCartao() {
      var peca = trilha.querySelector('.peca');
      if (!peca) return 240;
      var gap = parseFloat(getComputedStyle(trilha).columnGap || getComputedStyle(trilha).gap || 22);
      return peca.getBoundingClientRect().width + gap;
    }

    // navegação pelas setas com uma transição animada visível, em vez de
    // um salto seco — usa gsap se disponível, senão anima só a velocidade
    var alvoX = { v: 0 };
    var emTransicaoSeta = false;
    function irPara(deltaX) {
      if (!temGsap || reduzido) { x += deltaX; return; }
      emTransicaoSeta = true;
      alvoX.v = x;
      gsap.to(alvoX, {
        v: x + deltaX,
        duration: .7,
        ease: 'power3.out',
        onUpdate: function () { x = alvoX.v; },
        onComplete: function () { emTransicaoSeta = false; }
      });
    }
    if (btnAnterior) btnAnterior.addEventListener('click', function () { irPara(largoDoCartao()); });
    if (btnProximo) btnProximo.addEventListener('click', function () { irPara(-largoDoCartao()); });
  }

  /* ---------------------------------------------------------
     portfólio em lightbox
     --------------------------------------------------------- */
  function iniciarLightbox() {
    var pecas = Array.prototype.slice.call(document.querySelectorAll('.peca'));
    var lightbox = document.getElementById('lightbox');
    var imgEl = document.getElementById('lightbox-img');
    if (!pecas.length || !lightbox || !imgEl) return;

    var atual = 0;
    var elementoAnterior = null;
    var btnFechar = document.getElementById('lightbox-fechar');

    function mostrar(i, animar) {
      var novo = (i + pecas.length) % pecas.length;
      var img = pecas[novo].querySelector('img');
      var src = img.currentSrc || img.src;
      if (animar && temGsap && !reduzido && novo !== atual) {
        gsap.to(imgEl, {
          rotationY: -90, opacity: 0, duration: .22, ease: 'power2.in',
          onComplete: function () {
            imgEl.src = src;
            imgEl.alt = img.alt;
            gsap.fromTo(imgEl,
              { rotationY: 90, opacity: 0 },
              { rotationY: 0, opacity: 1, duration: .38, ease: 'power2.out', clearProps: 'transform,opacity' }
            );
          }
        });
      } else {
        imgEl.src = src;
        imgEl.alt = img.alt;
      }
      atual = novo;
    }
    function abrir(i) {
      elementoAnterior = document.activeElement;
      mostrar(i);
      lightbox.classList.add('aberto');
      html.classList.add('sem-rolagem');
      if (lenis) lenis.stop();
      if (btnFechar) btnFechar.focus();
    }
    function fechar() {
      lightbox.classList.remove('aberto');
      html.classList.remove('sem-rolagem');
      if (lenis) lenis.start();
      if (elementoAnterior && elementoAnterior.focus) elementoAnterior.focus();
    }

    pecas.forEach(function (el, i) {
      el.addEventListener('click', function () { abrir(i); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i); }
      });
    });
    var btnAnterior = document.getElementById('lightbox-anterior');
    var btnProximo = document.getElementById('lightbox-proximo');
    if (btnFechar) btnFechar.addEventListener('click', fechar);
    if (btnAnterior) btnAnterior.addEventListener('click', function () { mostrar(atual - 1, true); });
    if (btnProximo) btnProximo.addEventListener('click', function () { mostrar(atual + 1, true); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) fechar(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('aberto')) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowLeft') mostrar(atual - 1, true);
      if (e.key === 'ArrowRight') mostrar(atual + 1, true);
    });
  }

  /* ---------------------------------------------------------
     botões magnéticos
     --------------------------------------------------------- */
  function iniciarMagnetismo() {
    if (!temGsap || !ponteiroFino || reduzido) return;
    document.querySelectorAll('.botao').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        gsap.to(btn, { x: relX * .25, y: relY * .35, duration: .4, ease: 'power3.out' });
      });
      btn.addEventListener('pointerleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, .4)' });
      });
    });
  }

  /* ---------------------------------------------------------
     cursor customizado
     --------------------------------------------------------- */
  function iniciarCursor() {
    if (!temGsap || !ponteiroFino || reduzido) return;
    var ponto = document.querySelector('.cursor-ponto');
    var anel = document.querySelector('.cursor-anel');
    var textoAnel = document.querySelector('.cursor-texto');
    if (!ponto || !anel) return;

    html.classList.add('cursor-ativo');
    gsap.set([ponto, anel], { xPercent: -50, yPercent: -50 });

    var moverPontoX = gsap.quickTo(ponto, 'x', { duration: .1, ease: 'power3' });
    var moverPontoY = gsap.quickTo(ponto, 'y', { duration: .1, ease: 'power3' });
    var moverAnelX = gsap.quickTo(anel, 'x', { duration: .35, ease: 'power3' });
    var moverAnelY = gsap.quickTo(anel, 'y', { duration: .35, ease: 'power3' });

    window.addEventListener('pointermove', function (e) {
      moverPontoX(e.clientX); moverPontoY(e.clientY);
      moverAnelX(e.clientX); moverAnelY(e.clientY);
    });

    function estado(tipo, texto) {
      anel.classList.toggle('grande', tipo === 'grande');
      anel.classList.toggle('pegar', tipo === 'pegar');
      if (textoAnel) textoAnel.textContent = texto || '';
    }

    document.querySelectorAll('.peca').forEach(function (el) {
      el.addEventListener('pointerenter', function () { estado('grande', 'ver'); });
      el.addEventListener('pointerleave', function () { estado(''); });
    });

    var faixa = document.getElementById('faixa');
    if (faixa) {
      faixa.addEventListener('pointerenter', function () { estado('pegar', 'arraste'); });
      faixa.addEventListener('pointerleave', function () { estado(''); });
    }

    document.querySelectorAll('a, button, .arrastavel').forEach(function (el) {
      if (el.closest('.peca') || el.closest('#faixa')) return;
      el.addEventListener('pointerenter', function () { estado('grande'); });
      el.addEventListener('pointerleave', function () { estado(''); });
    });
  }

  /* ---------------------------------------------------------
     boot
     --------------------------------------------------------- */
  function iniciarTudo() {
    iniciarPreloader();
    iniciarRevelacoes();
    iniciarParalaxe();
    iniciarProcesso();
    iniciarIndice();
    iniciarMenu();
    iniciarMenuMobile();
    iniciarFaixa();
    iniciarTiltSobre();
    iniciarVideoSobre();
    iniciarVideosFundo();
    iniciarCarrossel();
    iniciarLightbox();
    iniciarMagnetismo();
    iniciarCursor();

    window.addEventListener('load', function () {
      if (temGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarTudo);
  } else {
    iniciarTudo();
  }
})();
