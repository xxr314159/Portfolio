/* ============================================================
 * 数字书房 Portfolio · main.js · 亮色高级版
 * 粒子背景 + 光标跟随 + 滚动淡入 + 按钮微交互 + Markdown 博客 + 留言板
 * ============================================================ */

(function () {
  'use strict';

  /* ---------- 0. 安静模式 ---------- */
  (function initQuietMode() {
    const stored = localStorage.getItem('portfolio_quiet');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (stored === '1' || prefersReduced) document.body.classList.add('quiet-mode');
    document.getElementById('quiet-toggle').addEventListener('click', () => {
      document.body.classList.toggle('quiet-mode');
      localStorage.setItem('portfolio_quiet', document.body.classList.contains('quiet-mode') ? '1' : '0');
    });
  })();

  /* ---------- 1. 粒子背景 Canvas ---------- */
  (function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 35 : 70;
    const MAX_DIST = 140;
    const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b'];

    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let paused = false;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); });

    class P {
      constructor() { this.reset(); this.y = Math.random() * canvas.height; this.x = Math.random() * canvas.width; }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.r = Math.random() * 2.5 + 1.2;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        if (paused) return;
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        // 鼠标排斥
        if (!isMobile) {
          const dx = this.x - mouse.x, dy = this.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < MAX_DIST) {
            const f = (MAX_DIST - d) / MAX_DIST;
            this.x += (dx / d) * f * 1.5;
            this.y += (dy / d) * f * 1.5;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new P());

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });

    function connect() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) {
            ctx.strokeStyle = '#8b5cf6';
            ctx.globalAlpha = (1 - d / 150) * 0.18;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      if (!paused) connect();
      requestAnimationFrame(animate);
    }
    animate();
  })();

  /* ---------- 2. 光标跟随光圈 ---------- */
  (function initCursor() {
    const ring = document.getElementById('cursor-ring');
    if (!ring || window.innerWidth < 768) return;

    let tx = -100, ty = -100, cx = -100, cy = -100;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

    function tick() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      ring.style.left = cx + 'px'; ring.style.top = cy + 'px';
      requestAnimationFrame(tick);
    }
    tick();

    // 悬停效果
    const hoverables = 'a, button, .book-card, .project-card, .post-item, .mf-submit, .letter-link, .copy-intro, .pc-detail, .font-toggle, .anchor-dot';
    document.querySelectorAll(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  })();

  /* ---------- 3. 滚动淡入 ---------- */
  (function initFadeUp() {
    const els = document.querySelectorAll('.fade-up');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach((en, idx) => {
        if (en.isIntersecting) {
          setTimeout(() => { en.target.classList.add('visible'); }, (en.target.dataset.delay || idx * 80));
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  })();

  /* ---------- 4. 侧边锚点 + 底部导航 ---------- */
  (function initAnchors() {
    const sections = document.querySelectorAll('.section');
    const dots = document.querySelectorAll('.anchor-dot');
    const bottomLinks = document.querySelectorAll('.bottom-nav a');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          dots.forEach(d => d.classList.toggle('active', d.dataset.target === id));
          bottomLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(s => io.observe(s));
  })();

  /* ---------- 5. 藏书卡翻书 ---------- */
  (function initBookCards() {
    document.querySelectorAll('.book-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        card.classList.toggle('expanded');
      });
    });
  })();

  /* ---------- 6. 复制操作 ---------- */
  (function initCopy() {
    const intro = '袭锌睿 · AI 应用开发者 · 实训中 · 用大模型造东西的人';
    document.getElementById('copy-intro')?.addEventListener('click', () => {
      navigator.clipboard.writeText(intro).then(() => {
        const fb = document.getElementById('copy-feedback');
        fb.classList.add('show'); setTimeout(() => fb.classList.remove('show'), 1500);
      });
    });
    document.getElementById('copy-email')?.addEventListener('click', () => {
      navigator.clipboard.writeText('846300839@qq.com').then(() => {
        const hint = document.getElementById('email-hint');
        hint.textContent = '地址已抄 ✨'; hint.classList.add('show');
        setTimeout(() => hint.classList.remove('show'), 2000);
      });
    });
  })();

  /* ---------- 7. 阅读进度条 ---------- */
  (function initProgress() {
    const bar = document.getElementById('progress-bar');
    function update() {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (dh > 0 ? st / dh * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ---------- 8. 博客字体切换 ---------- */
  (function initFont() {
    const serifBtn = document.getElementById('font-serif');
    const monoBtn = document.getElementById('font-mono');
    const stored = localStorage.getItem('portfolio_font');
    if (stored === 'serif') { document.body.classList.add('font-serif'); serifBtn.classList.add('active'); }
    else if (stored === 'mono') { document.body.classList.add('font-mono'); monoBtn.classList.add('active'); }
    serifBtn?.addEventListener('click', () => {
      document.body.classList.remove('font-mono');
      document.body.classList.toggle('font-serif');
      serifBtn.classList.toggle('active', document.body.classList.contains('font-serif'));
      monoBtn.classList.remove('active');
      localStorage.setItem('portfolio_font', document.body.classList.contains('font-serif') ? 'serif' : '');
    });
    monoBtn?.addEventListener('click', () => {
      document.body.classList.remove('font-serif');
      document.body.classList.toggle('font-mono');
      monoBtn.classList.toggle('active', document.body.classList.contains('font-mono'));
      serifBtn.classList.remove('active');
      localStorage.setItem('portfolio_font', document.body.classList.contains('font-mono') ? 'mono' : '');
    });
  })();

  /* ---------- 9. Markdown 博客 ---------- */
  (function initBlog() {
    const listEl = document.getElementById('post-list');
    const detailEl = document.getElementById('post-detail');
    const titleEl = document.getElementById('post-title');
    const dateEl = document.getElementById('post-date');
    const bodyEl = document.getElementById('post-body');
    const notesEl = document.getElementById('post-notes-content');
    const tocEl = document.getElementById('toc');
    const backBtn = document.getElementById('post-back');
    const countEl = document.getElementById('post-count');
    let posts = [];

    fetch('posts/index.json')
      .then(r => r.json())
      .then(data => {
        posts = data;
        countEl.textContent = `${posts.length} 篇随笔`;
        listEl.innerHTML = posts.map(p => `
          <article class="post-item" data-slug="${p.slug}">
            <h3>${p.title}</h3>
            <time>${p.date}</time>
            <p>${p.excerpt}</p>
          </article>
        `).join('');
        listEl.querySelectorAll('.post-item').forEach(el => {
          el.addEventListener('click', () => showPost(el.dataset.slug));
        });
        if (location.hash.startsWith('#/posts/')) showPost(location.hash.slice(8));
      })
      .catch(() => { listEl.innerHTML = '<p class="loading">取书失败，请稍后再来</p>'; countEl.textContent = '0 篇'; });

    function showPost(slug) {
      const post = posts.find(p => p.slug === slug);
      if (!post) { showList(); return; }
      listEl.hidden = true; detailEl.hidden = false;
      titleEl.textContent = post.title; dateEl.textContent = post.date;
      fetch(`posts/${slug}.md`).then(r => r.text()).then(md => {
        bodyEl.innerHTML = marked.parse(md);
        if (window.hljs) hljs.highlightAll();
        notesEl.innerHTML = post.notes || '<p style="color:#94a3b8">暂无复盘笔记</p>';
        buildToc();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      history.replaceState(null, '', `#/posts/${slug}`);
    }

    function showList() {
      listEl.hidden = false; detailEl.hidden = true;
      tocEl.classList.remove('visible');
      history.replaceState(null, '', '#writing');
    }

    function buildToc() {
      const headings = bodyEl.querySelectorAll('h2, h3');
      tocEl.innerHTML = '<h3>目录</h3><ul>';
      headings.forEach((h, i) => {
        h.id = 'h-' + i;
        tocEl.innerHTML += `<li><a href="#h-${i}" class="toc-${h.tagName.toLowerCase()}">${h.textContent}</a></li>`;
      });
      tocEl.innerHTML += '</ul>';
      tocEl.classList.add('visible');
      tocEl.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          document.getElementById(a.getAttribute('href').slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
      const tocLinks = tocEl.querySelectorAll('a');
      const hio = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
          }
        });
      }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
      headings.forEach(h => hio.observe(h));
    }

    backBtn?.addEventListener('click', showList);
  })();

  /* ---------- 10. 留言板 ---------- */
  (function initMessageBoard() {
    const form = document.getElementById('message-form');
    const nameInput = document.getElementById('mf-name');
    const bodyInput = document.getElementById('mf-body');
    const errorEl = document.getElementById('mf-error');
    const wallEl = document.getElementById('message-wall');
    let messages = [];

    function load() {
      fetch('data/messages.json').then(r => r.json()).then(data => {
        messages = [...(data.persisted || []), ...JSON.parse(localStorage.getItem('portfolio_messages') || '[]')];
        render();
      }).catch(() => {
        messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        render();
      });
    }

    function render() {
      if (messages.length === 0) {
        wallEl.innerHTML = '<li class="mw-empty">墙上还很空，来写第一张吧 ✨</li>'; return;
      }
      const sorted = [...messages].sort((a, b) => b.ts - a.ts);
      wallEl.innerHTML = sorted.map(m => `
        <li>
          <div class="mw-head">
            <span class="mw-name">${escapeHtml(m.name) || '匿名旅人'}</span>
            <time class="mw-time">${fmt(m.ts)}</time>
          </div>
          <p class="mw-body">${escapeHtml(m.body)}</p>
        </li>
      `).join('');
    }
    function fmt(ts) { const d = new Date(ts); return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`; }
    function pad(n) { return n < 10 ? '0' + n : n; }
    function escapeHtml(s) { const div = document.createElement('div'); div.textContent = s; return div.innerHTML; }

    form?.addEventListener('submit', e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const body = bodyInput.value.trim();
      let err = '';
      bodyInput.classList.remove('error'); nameInput.classList.remove('error');
      if (body.length < 10) { err = '留言至少 10 个字'; bodyInput.classList.add('error'); }
      else if (body.length > 500) { err = '留言不超过 500 字'; bodyInput.classList.add('error'); }
      else if (name.length > 20) { err = '昵称不超过 20 字'; nameInput.classList.add('error'); }
      errorEl.textContent = err;
      if (err) return;

      const msg = { name, body, ts: Date.now() };
      const localList = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      localList.push(msg);
      localStorage.setItem('portfolio_messages', JSON.stringify(localList));
      messages.push(msg); render(); form.reset(); errorEl.textContent = '';

      form.innerHTML = '<p class="mw-feedback">已送到书房主人手上，感谢留言 ✨</p>';
      setTimeout(() => {
        form.innerHTML = `
          <div class="mf-row"><label for="mf-name">昵称（可选）</label><input id="mf-name" type="text" maxlength="20" placeholder="匿名旅人"></div>
          <div class="mf-row"><label for="mf-body">留言</label><textarea id="mf-body" rows="3" maxlength="500" placeholder="10~500 字"></textarea></div>
          <p class="mf-error" id="mf-error"></p>
          <button id="mf-submit" type="submit" class="mf-submit">✨ 贴上便签</button>
        `;
        initMessageBoard();
      }, 2200);
    });

    load();
  })();

  /* ---------- 11. 页脚年份 ---------- */
  const fy = document.getElementById('footer-year');
  if (fy) fy.textContent = new Date().getFullYear();

})();
