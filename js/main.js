/* ================================================================
   AMARE PERFUME — MASTER JAVASCRIPT
   Features: Cart, Reveal Animations, Navbar, Particles,
             Cursor, Toast, Page Transitions, Ripple, Filter
================================================================ */

'use strict';

/* ── CART STATE ── */
let cart = JSON.parse(localStorage.getItem('amare_cart')) || [];

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initReveal();
  initCart();
  initRipple();
  initCustomCursor();
  initParticles();
  markActiveLink();
  updateCartBadge();
  initPageTransition();

  // ───────── HASH ANCHOR SCROLL FIX (Products page) ─────────
  // Ensure hash navigation reliably scrolls to the correct section
  // after all layout/CSS has applied (especially on file://).
  if (window.location.hash) {
    const hash = window.location.hash;
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
});

/* ================================================================
   NAVBAR — scroll + transparent → solid
================================================================ */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Active nav link ── */
function markActiveLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a, .mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

/* ================================================================
   MOBILE MENU
================================================================ */
function initMobileMenu() {
  const burger  = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!burger || !mobileNav) return;

  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ================================================================
   SCROLL REVEAL — Intersection Observer
================================================================ */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -44px 0px' });

  els.forEach(el => io.observe(el));
}

/* ================================================================
   CART SYSTEM
================================================================ */
function initCart() {
  renderCart();
}

/* Toggle sidebar */
function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('overlay');
  if (!sidebar) return;

  const isOpen = sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

/* Add item */
function addToCart(name, price, img) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx > -1) {
    cart[idx].quantity++;
  } else {
    cart.push({ name, price, img, quantity: 1 });
  }
  saveCart();
  renderCart();
  updateCartBadge(true);
  showToast(`<i class="fas fa-check-circle"></i> <strong>${name}</strong> added`);

  // Auto-open cart
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && !sidebar.classList.contains('open')) {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

/* Change qty */
function changeQty(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
}

/* Remove item */
function removeItem(index) {
  const name = cart[index].name;
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast(`<i class="fas fa-times-circle"></i> ${name} removed`);
}

/* Save to localStorage */
function saveCart() {
  localStorage.setItem('amare_cart', JSON.stringify(cart));
}

/* Render */
function renderCart() {
  const container = document.getElementById('cart-items-container');
  const totalEl   = document.getElementById('cart-total');
  if (!container) return;

  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <p>Your cart is empty</p>
        <small style="font-size:11px;letter-spacing:.1em;color:var(--text-muted)">Add a fragrance to begin</small>
      </div>`;
  } else {
    container.innerHTML = cart.map((item, i) => {
      total += item.price * item.quantity;
      return `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.name}" loading="lazy">
          <div class="item-details">
            <h6>${item.name}</h6>
            <p class="item-price">Rs ${item.price.toLocaleString()}</p>
            <div class="qty-controls">
              <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
            </div>
          </div>
          <button class="remove-item" onclick="removeItem(${i})" title="Remove">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>`;
    }).join('');
  }

  if (totalEl) totalEl.textContent = `Rs ${total.toLocaleString()}`;
}

/* Badge */
function updateCartBadge(pop = false) {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    if (pop) {
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
  });
}

/* WhatsApp Order */
function orderAll() {
  const name = document.getElementById('cust-name')?.value.trim();
  const addr = document.getElementById('cust-addr')?.value.trim();
  if (!name || !addr) { showToast('<i class="fas fa-exclamation-circle"></i> Please enter your name & address'); return; }
  if (!cart.length)   { showToast('<i class="fas fa-exclamation-circle"></i> Your cart is empty'); return; }

  let msg = `*✨ New Order from Amare!*%0A━━━━━━━━━━━━━━━━━━━━%0A`;
  msg += `*Name:* ${encodeURIComponent(name)}%0A`;
  msg += `*Address:* ${encodeURIComponent(addr)}%0A`;
  msg += `━━━━━━━━━━━━━━━━━━━━%0A`;

  let total = 0;
  cart.forEach(item => {
    msg += `• *${encodeURIComponent(item.name)}* × ${item.quantity} — Rs ${(item.price * item.quantity).toLocaleString()}%0A`;
    total += item.price * item.quantity;
  });
  msg += `━━━━━━━━━━━━━━━━━━━━%0A*Total: Rs ${total.toLocaleString()}*`;

  window.open(`https://wa.me/923313077774?text=${msg}`, '_blank');
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  toggleCart();
}

/* Feedback form */
function sendFeedback(e) {
  e.preventDefault();
  const name  = document.getElementById('fb-name')?.value.trim();
  const email = document.getElementById('fb-email')?.value.trim();
  const msg   = document.getElementById('fb-msg')?.value.trim();
  if (!name || !msg) { showToast('<i class="fas fa-exclamation-circle"></i> Please fill in your name and message'); return; }

  let text = `*Website Feedback 📝*%0A━━━━━━━━━━━━━━━━━━━━%0A`;
  text += `*Name:* ${encodeURIComponent(name)}%0A`;
  if (email) text += `*Email:* ${encodeURIComponent(email)}%0A`;
  text += `━━━━━━━━━━━━━━━━━━━━%0A*Message:*%0A${encodeURIComponent(msg)}`;

  window.open(`https://wa.me/923313077774?text=${text}`, '_blank');
  showToast('<i class="fas fa-check-circle"></i> Opening WhatsApp…');

  e.target.reset();
}

/* ================================================================
   TOAST
================================================================ */
let toastTimer;
function showToast(html) {
  let t = document.getElementById('toast-notif');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast-notif';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ================================================================
   BUTTON RIPPLE
================================================================ */
function initRipple() {
  document.querySelectorAll('.btn, .product-card__btn, .btn--whatsapp').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 700);
    });
  });
}

/* ================================================================
   CUSTOM CURSOR (desktop only)
================================================================ */
function initCustomCursor() {
  if (window.innerWidth < 1024 || window.matchMedia('(pointer:coarse)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  const animRing = () => {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  };
  animRing();

  // Hover expand
  const hoverSels = 'a, button, .product-card, .filter-btn';
  document.querySelectorAll(hoverSels).forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width  = dot.style.height  = '10px';
      ring.style.width = ring.style.height = '52px';
      ring.style.borderColor = 'rgba(201,168,76,0.75)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width  = dot.style.height  = '';
      ring.style.width = ring.style.height = '';
      ring.style.borderColor = '';
    });
  });
}

/* ================================================================
   HERO PARTICLES (canvas-based floating dust)
================================================================ */
function initParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.2 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.22;
      this.vy   = -Math.random() * 0.38 - 0.12;
      this.life = 0;
      this.maxLife = Math.random() * 260 + 120;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life >= this.maxLife || this.y < -5) this.reset();
    }
    draw() {
      const prog  = this.life / this.maxLife;
      const alpha = prog < 0.15 ? prog / 0.15 : (1 - prog);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${alpha * 0.5})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 65; i++) particles.push(new Particle());

  const animate = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  };
  animate();
}

/* ================================================================
   PAGE TRANSITION (subtle fade/wipe on links)
================================================================ */
function initPageTransition() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Reveal on load
  overlay.classList.add('leaving');
  setTimeout(() => overlay.style.display = 'none', 600);

  // On nav link click (not cart, not hash, not external)
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;

    a.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.display = 'block';
      overlay.classList.remove('leaving');
      overlay.classList.add('entering');
      setTimeout(() => {
        window.location.href = href;
      }, 480);
    });
  });
}

/* ================================================================
   COLLECTION PAGE — Filter
================================================================ */
function filterProducts(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('#products-grid .product-card').forEach(card => {
    const match = cat === 'all' || card.dataset.cat === cat;
    card.classList.toggle('hidden', !match);
    if (match) {
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = '';
    }
  });
}