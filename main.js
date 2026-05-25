/* ═══════════════════════════════════════════════════════
   GAGAN — AI ENGINEER PORTFOLIO
   main.js — All interactive logic
═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   1. NEURAL NETWORK CANVAS BACKGROUND
───────────────────────────────────────── */
(function () {
  const cv = document.getElementById('bg');
  const cx = cv.getContext('2d');
  let W, H, mouse = { x: -999, y: -999 };
  const PC = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fbbf24'];
  const SC = ['#c4b5fd', '#f9a8d4', '#6ee7b7', '#93c5fd', '#fde68a'];

  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  window.addEventListener('resize', () => { resize(); build(); });
  resize();

  function h2r(h, a) {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  class Node {
    constructor(i) {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = 2 + Math.random() * 3;
      this.ci = i % PC.length;
      this.pulse = 0;
      this.depth = Math.random();
    }

    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 25000) {
        const f = (158 - Math.sqrt(d2)) * 0.00035;
        this.vx += dx * f;
        this.vy += dy * f;
      }
      this.vx *= 0.993;
      this.vy *= 0.993;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
      this.pulse *= 0.95;
    }

    draw() {
      const a = 0.12 + this.depth * 0.2 + this.pulse * 0.5;
      const col = PC[this.ci];
      if (this.pulse > 0.04) {
        cx.beginPath();
        cx.arc(this.x, this.y, this.r + 4 + this.pulse * 9, 0, Math.PI * 2);
        cx.strokeStyle = h2r(col, this.pulse * 0.28);
        cx.lineWidth = 1;
        cx.stroke();
      }
      const g = cx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2.5);
      g.addColorStop(0, h2r(col, a));
      g.addColorStop(1, h2r(col, 0));
      cx.beginPath();
      cx.arc(this.x, this.y, this.r * 2.5, 0, Math.PI * 2);
      cx.fillStyle = g;
      cx.fill();
      cx.beginPath();
      cx.arc(this.x, this.y, this.r * 0.5, 0, Math.PI * 2);
      cx.fillStyle = h2r(col, Math.min(1, a + 0.35));
      cx.fill();
    }
  }

  class Signal {
    constructor(a, b, col) {
      this.a = a;
      this.b = b;
      this.t = 0;
      this.col = col;
      this.sp = 0.003 + Math.random() * 0.007;
    }
    update() { this.t += this.sp; }
    done() { return this.t >= 1; }
    draw() {
      const x = this.a.x + (this.b.x - this.a.x) * this.t;
      const y = this.a.y + (this.b.y - this.a.y) * this.t;
      const al = Math.sin(this.t * Math.PI);
      const tx = this.a.x + (this.b.x - this.a.x) * Math.max(0, this.t - 0.14);
      const ty = this.a.y + (this.b.y - this.a.y) * Math.max(0, this.t - 0.14);
      const tg = cx.createLinearGradient(tx, ty, x, y);
      tg.addColorStop(0, h2r(this.col, 0));
      tg.addColorStop(1, h2r(this.col, al * 0.75));
      cx.beginPath();
      cx.moveTo(tx, ty);
      cx.lineTo(x, y);
      cx.strokeStyle = tg;
      cx.lineWidth = 1.8;
      cx.stroke();
      const bg = cx.createRadialGradient(x, y, 0, x, y, 8);
      bg.addColorStop(0, h2r(this.col, al));
      bg.addColorStop(1, h2r(this.col, 0));
      cx.beginPath();
      cx.arc(x, y, 8, 0, Math.PI * 2);
      cx.fillStyle = bg;
      cx.fill();
      if (this.t > 0.82) this.b.pulse = Math.max(this.b.pulse, (this.t - 0.82) / 0.18);
    }
  }

  let nodes = [], edges = [], sigs = [];
  const MD = 195;

  function build() {
    const n = Math.min(Math.floor(W * H / 13000), 100);
    nodes = Array.from({ length: n }, (_, i) => new Node(i));
    rebuildEdges();
  }

  function rebuildEdges() {
    edges = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MD) edges.push({ a: nodes[i], b: nodes[j], d });
      }
    }
  }

  let st = 0;
  function spawnSignal() {
    if (++st < 20) return;
    st = 0;
    if (!edges.length) return;
    const e = edges[Math.floor(Math.random() * edges.length)];
    const col = SC[Math.floor(Math.random() * SC.length)];
    sigs.push(new Signal(e.a, e.b, col));
    if (Math.random() < 0.45) {
      setTimeout(() => {
        const nx = edges.filter(x => x.a === e.b || x.b === e.b);
        if (nx.length) {
          const ne = nx[Math.floor(Math.random() * nx.length)];
          sigs.push(new Signal(ne.a === e.b ? ne.a : ne.b, ne.a === e.b ? ne.b : ne.a, col));
        }
      }, 150 + Math.random() * 250);
    }
  }

  function drawBackground() {
    cx.fillStyle = '#05050f';
    cx.fillRect(0, 0, W, H);
    const t = Date.now() * 0.00008;
    [
      [0.15 + 0.14 * Math.sin(t * 0.7), 0.18 + 0.1 * Math.cos(t * 0.5), 'rgba(99,102,241,.12)', W * 0.5],
      [0.78 + 0.09 * Math.cos(t * 0.6), 0.52 + 0.13 * Math.sin(t * 0.4), 'rgba(236,72,153,.09)', W * 0.38],
      [0.42 + 0.1 * Math.sin(t * 0.9), 0.8 + 0.09 * Math.cos(t * 0.8), 'rgba(20,184,166,.08)', W * 0.32],
      [0.55 + 0.08 * Math.cos(t * 0.5), 0.3 + 0.12 * Math.sin(t * 0.7), 'rgba(251,191,36,.06)', W * 0.28]
    ].forEach(([px, py, c, r]) => {
      const g = cx.createRadialGradient(W * px, H * py, 0, W * px, H * py, r);
      g.addColorStop(0, c);
      g.addColorStop(1, 'transparent');
      cx.fillStyle = g;
      cx.fillRect(0, 0, W, H);
    });
    if (mouse.x > 0) {
      const mg = cx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
      mg.addColorStop(0, 'rgba(167,139,250,.055)');
      mg.addColorStop(1, 'transparent');
      cx.fillStyle = mg;
      cx.fillRect(0, 0, W, H);
    }
  }

  let fr = 0;
  function loop() {
    drawBackground();
    if (++fr % 80 === 0) rebuildEdges();
    for (const e of edges) {
      const alpha = (1 - e.d / MD) * 0.065 + e.a.pulse * 0.07 + e.b.pulse * 0.07;
      cx.beginPath();
      cx.moveTo(e.a.x, e.a.y);
      cx.lineTo(e.b.x, e.b.y);
      cx.strokeStyle = `rgba(167,139,250,${alpha})`;
      cx.lineWidth = 0.65;
      cx.stroke();
    }
    for (const n of nodes) { n.update(); n.draw(); }
    spawnSignal();
    sigs = sigs.filter(s => !s.done());
    for (const s of sigs) { s.update(); s.draw(); }
    requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  build();
  loop();
})();


/* ─────────────────────────────────────────
   2. CUSTOM CURSOR
───────────────────────────────────────── */
const cur = document.getElementById('cur');
const curo = document.getElementById('cur-o');
let mx = 0, my = 0, ox = 0, oy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top = my + 'px';
});

(function animateCursor() {
  ox += (mx - ox) * 0.11;
  oy += (my - oy) * 0.11;
  curo.style.left = ox + 'px';
  curo.style.top = oy + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur.style.transform = 'translate(-50%,-50%) scale(3)';
    curo.style.width = '58px';
    curo.style.height = '58px';
    curo.style.borderColor = 'rgba(167,139,250,.6)';
  });
  el.addEventListener('mouseleave', () => {
    cur.style.transform = 'translate(-50%,-50%) scale(1)';
    curo.style.width = '36px';
    curo.style.height = '36px';
    curo.style.borderColor = 'rgba(167,139,250,.4)';
  });
});


/* ─────────────────────────────────────────
   3. 3D TILT ON PROJECT CARDS
───────────────────────────────────────── */
document.querySelectorAll('.pc, .proj-feat').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ─────────────────────────────────────────
   4. SCROLL REVEAL
───────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('on');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.rv').forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────────
   5. ACTIVE NAV LINK HIGHLIGHTING
───────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = '#22d3ee';
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });

sections.forEach(s => navObserver.observe(s));
