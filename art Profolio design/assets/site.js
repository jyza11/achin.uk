// shared site JS — mobile nav toggle + smooth hash scroll
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const nav = document.getElementById('nav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
      nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') nav.classList.remove('open');
      });
    }
    // smooth-scroll only for in-page #anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const t = document.getElementById(id);
        if (t) {
          e.preventDefault();
          const top = t.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  });
})();
