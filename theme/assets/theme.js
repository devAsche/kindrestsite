/* Kindrest — Quiet Hours theme */
(function () {
  'use strict';

  var K = window.Kindrest || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(type) {
    try { return window[type]; } catch (e) { return null; }
  }
  function getItem(type, key) {
    try { var s = store(type); return s ? s.getItem(key) : null; } catch (e) { return null; }
  }
  function setItem(type, key, val) {
    try { var s = store(type); if (s) s.setItem(key, val); } catch (e) { /* ignore */ }
  }

  function formatMoney(cents) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    var fmt = K.moneyFormat || '${{amount}}';
    var value = (Number(cents) / 100);
    function withDelims(n, decimals, thousands, dec) {
      var parts = n.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      return parts.join(dec);
    }
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, key) {
      switch (key) {
        case 'amount_no_decimals': return withDelims(value, 0, ',', '.');
        case 'amount_with_comma_separator': return withDelims(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return withDelims(value, 0, '.', ',');
        default: return withDelims(value, 2, ',', '.');
      }
    });
  }
  K.formatMoney = formatMoney;

  /* ------------------------------------------------------------------
     Starfield — gentle twinkling stars on any [data-starfield] canvas
  ------------------------------------------------------------------ */
  function Starfield(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.density = parseFloat(canvas.getAttribute('data-density')) || 0.00018;
    this.stars = [];
    this.running = false;
    this.visible = true;
    this.mouse = { x: 0, y: 0 };
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    this.resize();
    window.addEventListener('resize', debounce(this.resize, 150));
    var self = this;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        if (self.visible) self.start();
      }).observe(canvas);
    }
    if (finePointer && canvas.hasAttribute('data-parallax')) {
      window.addEventListener('mousemove', function (e) {
        self.mouse.x = (e.clientX / window.innerWidth - 0.5);
        self.mouse.y = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
    }
    this.start();
  }
  Starfield.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = this.canvas.offsetWidth || this.canvas.parentNode.offsetWidth;
    var h = this.canvas.offsetHeight || this.canvas.parentNode.offsetHeight;
    if (!w || !h) return;
    this.w = w; this.h = h;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.max(24, Math.min(320, Math.round(w * h * this.density)));
    this.stars = [];
    for (var i = 0; i < count; i++) {
      var big = Math.random() < 0.06;
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: big ? 1.2 + Math.random() * 0.9 : 0.35 + Math.random() * 0.8,
        a: 0.25 + Math.random() * 0.75,
        s: 0.4 + Math.random() * 1.6,
        p: Math.random() * Math.PI * 2,
        d: 0.2 + Math.random() * 0.8,
        big: big
      });
    }
    if (reduceMotion) this.draw(0);
  };
  Starfield.prototype.draw = function (t) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    var mx = this.mouse.x * 14, my = this.mouse.y * 10;
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      var tw = reduceMotion ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.s + s.p);
      var x = s.x + mx * s.d, y = s.y + my * s.d;
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = '#fff6dc';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.big) {
        ctx.globalAlpha = s.a * tw * 0.35;
        ctx.fillRect(x - s.r * 4, y - 0.4, s.r * 8, 0.8);
        ctx.fillRect(x - 0.4, y - s.r * 4, 0.8, s.r * 8);
      }
    }
    ctx.globalAlpha = 1;
  };
  Starfield.prototype.start = function () {
    if (reduceMotion || this.running) return;
    this.running = true;
    requestAnimationFrame(this.tick);
  };
  Starfield.prototype.tick = function (t) {
    if (!this.visible || document.hidden) { this.running = false; return; }
    this.draw(t);
    requestAnimationFrame(this.tick);
  };
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) $$('[data-starfield]').forEach(function (c) { if (c._sf) c._sf.start(); });
  });

  function debounce(fn, wait) {
    var t;
    return function () { clearTimeout(t); var a = arguments; t = setTimeout(function () { fn.apply(null, a); }, wait); };
  }

  function initStarfields(ctx) {
    $$('[data-starfield]', ctx).forEach(function (c) { if (!c._sf) c._sf = new Starfield(c); });
  }

  /* ------------------------------------------------------------------
     Intro — a quick (~1s) dim into a night sky (once per session)
  ------------------------------------------------------------------ */
  function initIntro() {
    var intro = $('#Intro');
    if (!intro || !K.intro) return;
    if (reduceMotion || getItem('sessionStorage', 'kr-intro')) { intro.remove(); return; }
    setItem('sessionStorage', 'kr-intro', '1');
    document.documentElement.classList.add('show-intro');
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      intro.classList.add('is-done');
      setTimeout(function () { intro.remove(); document.documentElement.classList.remove('show-intro'); }, 380);
    }
    initStarfields(intro);
    requestAnimationFrame(function () {
      setTimeout(function () { intro.classList.add('is-dim'); }, 60);
    });
    setTimeout(finish, 1000);
    intro.addEventListener('click', finish);
    document.addEventListener('keydown', function onKey() { finish(); document.removeEventListener('keydown', onKey); });
  }

  /* ------------------------------------------------------------------
     Star trail behind the cursor (desktop, gentle)
  ------------------------------------------------------------------ */
  function initTrail() {
    if (!K.trail || reduceMotion || !finePointer) return;
    var last = 0, lx = 0, ly = 0;
    window.addEventListener('mousemove', function (e) {
      var now = performance.now();
      var dist = Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly);
      if (now - last < 45 || dist < 18) return;
      last = now; lx = e.clientX; ly = e.clientY;
      var star = document.createElement('span');
      star.className = 'trail-star';
      star.style.left = e.clientX + 'px';
      star.style.top = e.clientY + 'px';
      star.style.setProperty('--dx', (Math.random() * 24 - 12) + 'px');
      star.style.setProperty('--dy', (Math.random() * 18 + 6) + 'px');
      var size = 2 + Math.random() * 4;
      star.style.width = star.style.height = size + 'px';
      document.body.appendChild(star);
      setTimeout(function () { star.remove(); }, 900);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Quiet Hours toggle — dims the page, sends a shooting star
  ------------------------------------------------------------------ */
  function shootingStar() {
    var s = $('.shooting-star');
    if (!s || reduceMotion) return;
    s.classList.remove('is-flying');
    void s.offsetWidth;
    s.style.left = (55 + Math.random() * 30) + '%';
    s.style.top = (6 + Math.random() * 18) + '%';
    s.classList.add('is-flying');
  }
  function initQuiet() {
    var root = document.documentElement;
    if (getItem('localStorage', 'kr-quiet') === '1') root.classList.add('is-quiet');
    $$('[data-quiet-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', root.classList.contains('is-quiet'));
      btn.addEventListener('click', function () {
        var on = root.classList.toggle('is-quiet');
        setItem('localStorage', 'kr-quiet', on ? '1' : '0');
        $$('[data-quiet-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', on); });
        if (on) shootingStar();
      });
    });
  }

  /* ------------------------------------------------------------------
     Mobile nav
  ------------------------------------------------------------------ */
  function initNav() {
    var btn = $('[data-menu-toggle]');
    var nav = $('#MobileNav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ------------------------------------------------------------------
     Reveal on scroll
  ------------------------------------------------------------------ */
  function initReveal() {
    var els = $$('.reveal, [data-reveal-section]');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Product form
     A "Cap + Neck Wrap" set card can sit next to the pack options (value "__set").
     It selects the single-cap variant and adds the Neck Wrap to the cart with it;
     the wrap discount itself is Shopify's automatic discount.
  ------------------------------------------------------------------ */
  var SET_VALUE = '__set';

  function BuyForm(root) {
    this.root = root;
    var json = $('[data-product-json]', root);
    if (!json) return;
    root._buyForm = this;
    this.product = JSON.parse(json.textContent);
    this.set = this.product.set || null;
    this.isSet = false;
    this.setPrice = null;
    this.setInput = $('input[value="' + SET_VALUE + '"]', root);
    this.setAddonSelect = $('[data-set-addon-variant]', root);
    this.setAddonBox = $('[data-set-addon]', root);
    this.form = $('form', root);
    this.idInput = $('input[name="id"]', root);
    this.atc = $('[data-atc]', root);
    this.error = $('[data-error]', root);
    this.updateUrl = root.hasAttribute('data-update-url');
    this.gallery = root.closest('[data-buy-section]') ? $('[data-gallery]', root.closest('[data-buy-section]')) : null;
    this.onChange = this.onChange.bind(this);
    root.addEventListener('change', this.onChange);
    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.initSticky();
    this.onChange();
  }
  BuyForm.prototype.singlePackValue = function () {
    var idx = this.product.packIndex;
    if (idx === null || idx === undefined) return null;
    for (var i = 0; i < this.product.variants.length; i++) {
      var v = this.product.variants[i];
      if (packCount(v.options[idx]) === 1) return v.options[idx];
    }
    return null;
  };
  BuyForm.prototype.selectedOptions = function () {
    var opts = [];
    this.isSet = false;
    for (var i = 0; i < this.product.options.length; i++) {
      var checked = $('input[name="option-' + i + '"]:checked', this.root);
      var val = checked ? checked.value : null;
      if (val === SET_VALUE) {
        this.isSet = !!this.set;
        val = this.singlePackValue();
      }
      opts.push(val);
    }
    return opts;
  };
  BuyForm.prototype.findVariant = function (opts) {
    return this.product.variants.find(function (v) {
      return v.options.every(function (o, i) { return o === opts[i]; });
    });
  };
  BuyForm.prototype.addonVariant = function () {
    if (!this.set || !this.set.variants || !this.set.variants.length) return null;
    var id = this.setAddonSelect ? Number(this.setAddonSelect.value) : null;
    var vs = this.set.variants;
    var match = id ? vs.find(function (v) { return v.id === id; }) : null;
    return match || vs.find(function (v) { return v.available; }) || vs[0];
  };
  // Price of the cap + discounted wrap. Returns null when the set is not possible.
  BuyForm.prototype.setPricing = function (capVariant) {
    var addon = this.addonVariant();
    if (!addon || !capVariant) return null;
    var off = Math.round(addon.price * (this.set.percent || 0) / 100);
    return {
      total: capVariant.price + addon.price - off,
      separate: capVariant.price + addon.price,
      saving: off,
      addon: addon,
      available: capVariant.available && addon.available
    };
  };
  BuyForm.prototype.onChange = function () {
    var opts = this.selectedOptions();
    var variant = this.findVariant(opts);
    var self = this;
    var packIdx = this.product.packIndex;

    // Labels next to option names
    opts.forEach(function (val, i) {
      var label = $('[data-option-value="' + i + '"]', self.root);
      if (!label) return;
      label.textContent = (self.isSet && i === packIdx) ? self.set.label : (val || '');
    });

    // Per-value prices on pack cards (depend on the other selected options)
    $$('[data-pack-price]', this.root).forEach(function (el) {
      var idx = Number(el.getAttribute('data-option-index'));
      var o = opts.slice(); o[idx] = el.getAttribute('data-pack-price');
      var v = self.findVariant(o);
      if (!v) { el.innerHTML = ''; return; }
      var html = formatMoney(v.price);
      if (v.compare_at_price > v.price) html = '<s>' + formatMoney(v.compare_at_price) + '</s>' + html;
      el.innerHTML = html;
    });

    // Set card price (single cap in the selected color + discounted wrap)
    var setCardPricing = null;
    if (this.set && packIdx !== null && packIdx !== undefined) {
      var so = opts.slice(); so[packIdx] = this.singlePackValue();
      setCardPricing = this.setPricing(this.findVariant(so));
      var setPriceEl = $('[data-set-price]', this.root);
      if (setPriceEl) {
        setPriceEl.innerHTML = setCardPricing
          ? formatMoney(setCardPricing.total) + '<span class="pack__save">Save ' + formatMoney(setCardPricing.saving) + '</span>'
          : '';
      }
    }
    if (this.setAddonBox) this.setAddonBox.hidden = !this.isSet;

    // Availability marking on option inputs
    $$('input[name^="option-"]', this.root).forEach(function (input) {
      var item = input.closest('[data-option-item]');
      if (!item) return;
      if (input.value === SET_VALUE) {
        item.classList.toggle('is-unavailable', !setCardPricing || !setCardPricing.available);
        return;
      }
      var idx = Number(input.name.split('-')[1]);
      var o = opts.slice(); o[idx] = input.value;
      var v = self.findVariant(o);
      item.classList.toggle('is-unavailable', !v || !v.available);
    });

    this.variant = variant;
    if (!variant) {
      this.setPrice = null;
      this.setAtc(false, 'Unavailable');
      return;
    }
    this.idInput.value = variant.id;
    var sp = this.isSet ? this.setPricing(variant) : null;
    this.setPrice = sp;

    // Price block
    var priceNow = $('[data-price]', this.root);
    var priceWas = $('[data-compare]', this.root);
    var save = $('[data-save]', this.root);
    var priceRef = $('[data-price-ref]', this.root);
    if (sp) {
      // Set: shown as a comparison with buying both separately, never as a former price.
      if (priceNow) priceNow.textContent = formatMoney(sp.total);
      if (priceWas) { priceWas.textContent = ''; priceWas.hidden = true; }
      if (save) { save.textContent = 'You save ' + formatMoney(sp.saving) + ' vs. buying separately'; save.hidden = false; }
      if (priceRef) { priceRef.textContent = 'Cap + Neck Wrap bought separately: ' + formatMoney(sp.separate); priceRef.hidden = false; }
    } else {
      if (priceNow) priceNow.textContent = formatMoney(variant.price);
      // Strike-through is only for a real compare-at price set in Shopify. A multi-pack saving is
      // shown as a comparison with buying the single item separately, never as a former price.
      var hasCompare = variant.compare_at_price > variant.price;
      var pack = hasCompare ? null : this.packSaving(variant);
      if (priceWas) {
        priceWas.textContent = hasCompare ? formatMoney(variant.compare_at_price) : '';
        priceWas.hidden = !hasCompare;
      }
      if (save) {
        if (hasCompare) save.textContent = 'You save ' + formatMoney(variant.compare_at_price - variant.price);
        else if (pack) save.textContent = 'You save ' + formatMoney(pack.amount) + ' vs. buying ' + pack.count + ' separately';
        save.hidden = !(hasCompare || pack);
      }
      if (priceRef) {
        if (pack) priceRef.textContent = pack.count + ' ' + pack.unit + ' bought separately: ' + formatMoney(pack.separate);
        priceRef.hidden = !pack;
      }
    }

    var available = sp ? sp.available : variant.available;
    this.setAtc(available, available ? null : 'Sold out');

    if (this.updateUrl && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }
    if (variant.featured_media && this.gallery && this.gallery._gallery) {
      this.gallery._gallery.showMedia(variant.featured_media.id);
    }
    this.syncSticky();
  };
  // Saving of a multi-pack vs buying the single option N times.
  // Returns { amount, count, unit, separate } or null when there is no saving.
  BuyForm.prototype.packSaving = function (variant) {
    var packIdx = this.product.packIndex;
    if (packIdx === null || packIdx === undefined) return null;
    var count = packCount(variant.options[packIdx]);
    if (count < 2) return null;
    var single = this.product.variants.find(function (v) {
      return v.options.every(function (o, i) {
        return i === packIdx ? packCount(o) === 1 : o === variant.options[i];
      });
    });
    if (!single || single === variant) return null;
    var separate = single.price * count;
    if (separate <= variant.price) return null;
    var unit = String(single.options[packIdx]).replace(/\d+/g, '').replace(/[-_]/g, ' ').trim().toLowerCase() || 'item';
    if (!/s$/.test(unit)) unit += 's';
    return { amount: separate - variant.price, count: count, unit: unit, separate: separate };
  };
  function packCount(value) {
    var m = String(value).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }
  BuyForm.prototype.currentPrice = function () {
    if (this.setPrice) return this.setPrice.total;
    return this.variant ? this.variant.price : 0;
  };
  BuyForm.prototype.cartItems = function () {
    var items = [{ id: this.variant.id, quantity: 1 }];
    if (this.setPrice) items.push({ id: this.setPrice.addon.id, quantity: 1 });
    return items;
  };
  BuyForm.prototype.selectSet = function () {
    if (!this.setInput) return false;
    this.setInput.checked = true;
    this.onChange();
    return true;
  };
  BuyForm.prototype.setAtc = function (enabled, text) {
    var label = $('[data-atc-label]', this.root);
    var price = $('[data-atc-price]', this.root);
    this.atc.disabled = !enabled;
    if (label) label.textContent = text || this.atc.getAttribute('data-label');
    if (price) price.textContent = enabled && this.variant ? '· ' + formatMoney(this.currentPrice()) : '';
  };
  BuyForm.prototype.isAvailable = function () {
    if (!this.variant) return false;
    return this.setPrice ? this.setPrice.available : this.variant.available;
  };
  BuyForm.prototype.onSubmit = function (e) {
    e.preventDefault();
    if (!this.variant) return;
    var self = this;
    this.atc.classList.add('is-loading');
    if (this.error) this.error.textContent = '';
    Cart.add(this.cartItems(), this.atc)
      .catch(function (err) { if (self.error) self.error.textContent = err.message || 'Something went wrong. Please try again.'; })
      .then(function () { self.atc.classList.remove('is-loading'); });
  };
  BuyForm.prototype.initSticky = function () {
    var bar = document.getElementById('StickyAtc-' + this.root.getAttribute('data-section'));
    if (!bar) return;
    this.sticky = bar;
    var self = this;
    var btn = $('[data-sticky-atc]', bar);
    btn.addEventListener('click', function () {
      if (!self.isAvailable()) return;
      btn.classList.add('is-loading');
      Cart.add(self.cartItems(), btn).catch(function () {
        self.root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }).then(function () { btn.classList.remove('is-loading'); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var en = entries[0];
        // visible once the form has scrolled above the viewport
        bar.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0);
      }).observe(this.atc);
    }
  };
  BuyForm.prototype.syncSticky = function () {
    if (!this.sticky || !this.variant) return;
    var v = this.variant;
    var packIdx = this.product.packIndex;
    var title = v.title;
    if (this.setPrice) {
      var parts = v.options.filter(function (o, i) { return i !== packIdx; });
      parts.push(this.set.label);
      title = parts.join(' / ');
    }
    $('[data-sticky-variant]', this.sticky).textContent = title + ' · ' + formatMoney(this.currentPrice());
    var b = $('[data-sticky-atc]', this.sticky);
    b.disabled = !this.isAvailable();
  };

  /* Links that pre-select the set (e.g. hero offer, announcement "?set=1") */
  function initSetLinks() {
    function firstForm() {
      var root = $('[data-buy]');
      return root && root._buyForm ? root._buyForm : null;
    }
    var wantsSet = false;
    try { wantsSet = new URLSearchParams(window.location.search).get('set') === '1'; } catch (e) { /* ignore */ }
    if (wantsSet) {
      var f = firstForm();
      if (f) f.selectSet();
    }
    $$('[data-select-set]').forEach(function (a) {
      a.addEventListener('click', function () {
        var f = firstForm();
        if (f) f.selectSet();
      });
    });
  }

  /* ------------------------------------------------------------------
     Gallery
  ------------------------------------------------------------------ */
  function Gallery(root) {
    this.root = root;
    this.main = $('[data-gallery-main] img', root);
    this.thumbs = $$('[data-thumb]', root);
    this.index = 0;
    var self = this;
    this.thumbs.forEach(function (t, i) { t.addEventListener('click', function () { self.show(i); }); });
    var prev = $('[data-gallery-prev]', root), next = $('[data-gallery-next]', root);
    if (prev) prev.addEventListener('click', function () { self.show(self.index - 1); });
    if (next) next.addEventListener('click', function () { self.show(self.index + 1); });
    // swipe
    var sx = null;
    var area = $('[data-gallery-main]', root);
    if (area) {
      area.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      area.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) self.show(self.index + (dx < 0 ? 1 : -1));
        sx = null;
      });
    }
  }
  Gallery.prototype.show = function (i) {
    if (!this.thumbs.length || !this.main) return;
    var n = this.thumbs.length;
    i = (i + n) % n;
    if (i === this.index && this.main.getAttribute('data-ready')) return;
    this.index = i;
    var t = this.thumbs[i];
    var main = this.main;
    main.classList.add('is-fading');
    var src = t.getAttribute('data-src'), srcset = t.getAttribute('data-srcset'), alt = t.getAttribute('data-alt');
    setTimeout(function () {
      main.src = src; main.srcset = srcset; main.alt = alt || '';
      main.onload = function () { main.classList.remove('is-fading'); };
      setTimeout(function () { main.classList.remove('is-fading'); }, 400);
    }, 160);
    main.setAttribute('data-ready', '1');
    this.thumbs.forEach(function (th, j) { th.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  };
  Gallery.prototype.showMedia = function (mediaId) {
    var idx = this.thumbs.findIndex(function (t) { return t.getAttribute('data-media-id') === String(mediaId); });
    if (idx > -1) this.show(idx);
  };

  /* ------------------------------------------------------------------
     Cart (drawer)
  ------------------------------------------------------------------ */
  var Cart = {
    drawer: null,
    init: function () {
      this.drawer = $('#CartDrawer');
      var self = this;
      $$('[data-cart-open]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          if (!self.drawer) return;
          e.preventDefault();
          self.refresh().then(function () { self.open(); });
        });
      });
      if (!this.drawer) return;
      $$('[data-cart-close]', this.drawer).forEach(function (el) { el.addEventListener('click', function () { self.close(); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') self.close(); });
      this.drawer.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-line-qty]');
        if (btn) {
          var line = Number(btn.getAttribute('data-line'));
          var qty = Number(btn.getAttribute('data-line-qty'));
          self.change(line, qty);
        }
      });
      var up = $('[data-upsell]', this.drawer);
      if (up) {
        $('[data-upsell-add]', up).addEventListener('click', function (e) {
          var sel = $('[data-upsell-variant]', up);
          var id = sel ? sel.value : up.getAttribute('data-variant');
          e.currentTarget.classList.add('is-loading');
          var btn = e.currentTarget;
          self.add([{ id: Number(id), quantity: 1 }], null, true).then(function () { btn.classList.remove('is-loading'); });
        });
      }
    },
    fetchJSON: function (url, opts) {
      return fetch(url, opts).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.description || data.message || 'Something went wrong.');
          return data;
        });
      });
    },
    add: function (items, sourceEl, keepOpen) {
      var self = this;
      return this.fetchJSON(K.routes.cartAdd, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: items })
      }).then(function () {
        if (sourceEl) flyStar(sourceEl);
        return self.refresh();
      }).then(function () {
        if (!self.drawer) { window.location.href = K.routes.cartPage; return; }
        setTimeout(function () { self.open(); }, sourceEl && !reduceMotion ? 520 : 0);
      });
    },
    change: function (line, quantity) {
      var self = this;
      this.drawer.classList.add('is-busy');
      return this.fetchJSON(K.routes.cartChange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity })
      }).then(function (cart) { self.render(cart); })
        .catch(function () {})
        .then(function () { self.drawer.classList.remove('is-busy'); });
    },
    refresh: function () {
      var self = this;
      return this.fetchJSON(K.routes.cart + '?t=' + Date.now()).then(function (cart) { self.render(cart); return cart; });
    },
    render: function (cart) {
      $$('[data-cart-count]').forEach(function (el) {
        el.textContent = cart.item_count;
        el.hidden = cart.item_count === 0;
      });
      if (!this.drawer) return;
      var body = $('[data-cart-items]', this.drawer);
      var empty = $('[data-cart-empty]', this.drawer);
      var foot = $('[data-cart-foot]', this.drawer);
      empty.hidden = cart.item_count > 0;
      foot.hidden = cart.item_count === 0;
      body.innerHTML = cart.items.map(function (item, i) {
        var line = i + 1;
        var img = item.image ? '<img src="' + sizedImage(item.image, 200) + '" alt="" loading="lazy" width="84" height="84">' : '';
        var variant = item.variant_title && item.variant_title !== 'Default Title' ? '<div class="cart-line__variant">' + escapeHtml(item.variant_title) + '</div>' : '';
        // Strike-through only when Shopify actually applied a discount to the line.
        var price = item.original_line_price > item.final_line_price
          ? '<s class="cart-line__was">' + formatMoney(item.original_line_price) + '</s>' + formatMoney(item.final_line_price)
          : formatMoney(item.final_line_price);
        var discount = item.line_level_total_discount > 0
          ? '<div class="cart-line__discount">✦ Set discount −' + formatMoney(item.line_level_total_discount) + '</div>' : '';
        return '<div class="cart-line">' +
          '<div class="cart-line__img">' + img + '</div>' +
          '<div><a class="cart-line__title" href="' + item.url + '">' + escapeHtml(item.product_title) + '</a>' + variant + discount +
          '<div class="qty"><button type="button" data-line="' + line + '" data-line-qty="' + (item.quantity - 1) + '" aria-label="Decrease quantity">−</button>' +
          '<input type="number" value="' + item.quantity + '" readonly aria-label="Quantity">' +
          '<button type="button" data-line="' + line + '" data-line-qty="' + (item.quantity + 1) + '" aria-label="Increase quantity">+</button></div>' +
          '<button type="button" class="cart-line__remove" data-line="' + line + '" data-line-qty="0">Remove</button></div>' +
          '<div class="cart-line__price">' + price + '</div></div>';
      }).join('');
      $('[data-cart-subtotal]', this.drawer).textContent = formatMoney(cart.total_price);
      var savingsRow = $('[data-cart-savings-row]', this.drawer);
      if (savingsRow) {
        savingsRow.hidden = !(cart.total_discount > 0);
        $('[data-cart-savings]', savingsRow).textContent = '−' + formatMoney(cart.total_discount || 0);
      }

      var up = $('[data-upsell]', this.drawer);
      if (up) {
        var upId = Number(up.getAttribute('data-product-id'));
        var hasUpsell = cart.items.some(function (it) { return it.product_id === upId; });
        up.hidden = cart.item_count === 0 || hasUpsell;
        // Set offer: only promise the discount when a qualifying cap is in the cart.
        // An empty qualifying value means any variant of the cap qualifies.
        var capId = Number(up.getAttribute('data-offer-cap'));
        var qual = up.getAttribute('data-offer-value') || '';
        var qualifies = !!capId && cart.items.some(function (it) {
          return it.product_id === capId && (!qual || (it.variant_options || []).indexOf(qual) > -1);
        });
        up.classList.toggle('is-offer', qualifies);
      }
    },
    open: function () {
      if (!this.drawer) return;
      this.lastFocus = document.activeElement;
      this.drawer.classList.add('is-open');
      this.drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var close = $('[data-cart-close].icon-btn', this.drawer);
      if (close) close.focus({ preventScroll: true });
    },
    close: function () {
      if (!this.drawer || !this.drawer.classList.contains('is-open')) return;
      this.drawer.classList.remove('is-open');
      this.drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (this.lastFocus) this.lastFocus.focus({ preventScroll: true });
    }
  };
  K.cart = Cart;

  function sizedImage(src, w) {
    try {
      var url = new URL(src, window.location.origin);
      url.searchParams.set('width', w);
      return url.toString();
    } catch (e) { return src; }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; });
  }

  /* A little star flies from the button to the cart icon */
  function flyStar(fromEl) {
    var target = $('.cart-icon');
    if (!target || reduceMotion) return;
    var a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    if (b.width === 0) return;
    var star = document.createElement('span');
    star.className = 'fly-star';
    star.textContent = '✦';
    var sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    var ex = b.left + b.width / 2, ey = b.top + b.height / 2;
    star.style.left = sx + 'px'; star.style.top = sy + 'px';
    document.body.appendChild(star);
    var midX = (sx + ex) / 2 + (ex > sx ? -60 : 60), midY = Math.min(sy, ey) - 120;
    var anim = star.animate([
      { transform: 'translate(0,0) scale(0.6) rotate(0deg)', opacity: 0 },
      { transform: 'translate(' + (midX - sx) + 'px,' + (midY - sy) + 'px) scale(1.4) rotate(180deg)', opacity: 1, offset: 0.45 },
      { transform: 'translate(' + (ex - sx) + 'px,' + (ey - sy) + 'px) scale(0.5) rotate(360deg)', opacity: 0.9 }
    ], { duration: 650, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = function () {
      star.remove();
      target.classList.remove('is-bump'); void target.offsetWidth; target.classList.add('is-bump');
    };
  }

  /* ------------------------------------------------------------------
     Hero swatches — swap the moon image and sync the buy box color
  ------------------------------------------------------------------ */
  function initHeroSwatches() {
    var swatches = $$('[data-hero-swatch]');
    if (!swatches.length) return;
    var img = $('.hero__moon img');
    var name = $('[data-hero-swatch-name]');
    swatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        swatches.forEach(function (o) { o.setAttribute('aria-pressed', o === sw ? 'true' : 'false'); });
        var color = sw.getAttribute('data-color');
        if (name) name.textContent = color;
        var src = sw.getAttribute('data-src');
        if (img && src && img.getAttribute('src') !== src) {
          img.classList.add('is-swapping');
          var pre = new Image();
          pre.onload = pre.onerror = function () {
            img.removeAttribute('srcset');
            img.src = src;
            requestAnimationFrame(function () { img.classList.remove('is-swapping'); });
          };
          pre.src = src;
        }
        // Select the same color in the buy box below (without scrolling)
        var idx = sw.getAttribute('data-option-index');
        $$('[data-buy] input[name="option-' + idx + '"]').forEach(function (input) {
          if (input.value === color && !input.checked) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Smooth anchor to the buy box (hero CTA)
  ------------------------------------------------------------------ */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        var el = id && document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initIntro();
    initStarfields();
    initTrail();
    initQuiet();
    initNav();
    initReveal();
    initAnchors();
    initHeroSwatches();
    $$('[data-gallery]').forEach(function (g) { g._gallery = new Gallery(g); });
    $$('[data-buy]').forEach(function (r) { new BuyForm(r); });
    initSetLinks();
    Cart.init();
  });
})();
