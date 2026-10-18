(() => {
  'use strict';

  const menu = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#nav-links');
  const menuQuery = window.matchMedia('(max-width: 700px)');
  const closeMenu = (restoreFocus = false) => {
    menu?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    if (restoreFocus) menu?.focus();
  };

  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (menuQuery.matches && !event.target.closest('.nav') && menu?.getAttribute('aria-expanded') === 'true') closeMenu();
  });
  menuQuery.addEventListener('change', () => closeMenu());
  document.querySelector('[data-print-brief]')?.addEventListener('click', () => window.print());

  const sections = [...document.querySelectorAll('[data-brief-section]')];
  const links = [...document.querySelectorAll('.fiki-toc a')];
  const progress = document.querySelector('#reading-progress');
  let scheduled = false;
  let activeId = '';

  function updateReadingPosition() {
    scheduled = false;
    const headerOffset = (document.querySelector('.site-header')?.getBoundingClientRect().height || 90) + 60;
    const active = sections.reduce((previous, section) => section.getBoundingClientRect().top <= headerOffset ? section : previous, sections[0]);
    if (active && active.id !== activeId) {
      activeId = active.id;
      links.forEach((link) => {
        if (link.hash === `#${activeId}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent = max > 0 ? Math.max(0, Math.min(100, window.scrollY / max * 100)) : 0;
      progress.style.width = `${percent}%`;
    }
  }
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateReadingPosition);
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  document.querySelectorAll('.brief-portrait img').forEach((image) => image.addEventListener('load', scheduleUpdate));
  document.body.classList.add('fiki-enhanced');
  updateReadingPosition();
})();
