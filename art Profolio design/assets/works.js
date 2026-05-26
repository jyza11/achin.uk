// ──────────── Works data + grid render + lightbox ────────────
const WORKS = [
  { id:'w1', title:'Tidewater, Early March', year:'2025', medium:'Oil on linen', dim:'162 × 130 cm', cat:'N° 48', status:'Sold · private collection', span:1, art:2,
    desc:'Painted over fourteen months from a high window above the Aber-Wrac’h. The horizon has been worked and re-worked; what remains is mostly weather.' },
  { id:'w2', title:'Vespers, an Open Window', year:'2025', medium:'Oil on Belgian linen', dim:'146 × 114 cm', cat:'N° 47', status:'Available · enquire', span:2, art:1,
    desc:'A southwest-facing interior at the close of day; the room half-empty, the linen curtain held briefly against the warmth.' },
  { id:'w3', title:'A Letter, Half Written', year:'2024', medium:'Oil on linen', dim:'92 × 73 cm', cat:'N° 39', status:'Available · enquire', span:3, art:3,
    desc:'A still life of the everyday — paper, an inkpot, the gentian winter light of a Paris flat in January.' },
  { id:'w4', title:'Marée Basse', year:'2024', medium:'Oil on linen', dim:'80 × 80 cm', cat:'N° 36', status:'Sold · private collection', span:4, art:4,
    desc:'Low tide at Locquirec; pools of trapped sky in the granite. The frame is square so the painting cannot decide whether it is landscape or memory.' },
  { id:'w5', title:'Interior with Almonds', year:'2023', medium:'Oil on linen', dim:'81 × 60 cm', cat:'N° 31', status:'In permanent collection · MAM Paris', span:5, art:5,
    desc:'Painted in the artist’s mother’s kitchen. The almonds are a pretext — what is being looked at is the quality of the morning.' },
  { id:'w6', title:'Crépuscule, Île Saint-Louis', year:'2023', medium:'Oil on linen', dim:'114 × 146 cm', cat:'N° 29', status:'Sold · private collection', span:6, art:6,
    desc:'The window of the studio at twilight, with the Seine just visible. A study in deep umber and a single point of cadmium.' },
  { id:'w7', title:'A Long Afternoon', year:'2022', medium:'Oil on linen', dim:'200 × 130 cm', cat:'N° 22', status:'Available · enquire', span:7, art:7,
    desc:'The largest of the recent works. A diagonal of daylight bisects a corner of the studio; the foreground was reworked twelve times.' },
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('worksGrid');
  if (!grid) return;
  grid.innerHTML = WORKS.map((w, i) => `
    <article class="work w-${w.span}" data-i="${i}">
      <div class="frame">
        <image-slot id="work-${w.id}" shape="rect" placeholder="${w.title} — drag a photograph of the painting here">
          <div class="canvas-art ca-${w.art}"></div>
        </image-slot>
      </div>
      <div class="label">
        <span class="t">${w.title}</span>
        <span class="y">${w.year}</span>
      </div>
      <div class="meta">${w.medium} · ${w.dim} ${w.status.startsWith('Sold') ? '<span class="sold">SOLD</span>' : w.status.startsWith('In permanent') ? '<span class="sold" style="color:#5d5240;border-color:#5d5240">COLLECTION</span>' : ''}</div>
    </article>
  `).join('');

  const lb = document.getElementById('lightbox');
  const lbArt = document.getElementById('lbArt');
  let currentI = 0;
  function openLb(i) {
    currentI = i;
    const w = WORKS[i];
    // parse "146 × 114 cm" → real aspect-ratio so the artwork keeps its proportions
    const m = (w.dim || '').match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/);
    const aw = m ? +m[1] : 1, ah = m ? +m[2] : 1;
    const ar = aw / ah;
    const cls = Math.abs(ar - 1) < 0.05 ? 'square' : ar > 1 ? 'landscape' : 'portrait';
    lbArt.innerHTML = `<div class="canvas-holder ${cls}" style="--ar: ${aw}/${ah}"><div class="canvas-art ca-${w.art}"></div></div>`;
    document.getElementById('lbCounter').textContent = `Plate · ${String(i+1).padStart(2,'0')} / ${String(WORKS.length).padStart(2,'0')}`;
    document.getElementById('lbKicker').textContent = `${w.medium} · Catalogue ${w.cat}`;
    document.getElementById('lbTitle').textContent = w.title;
    document.getElementById('lbDesc').textContent = w.desc;
    document.getElementById('lbMedium').textContent = w.medium;
    document.getElementById('lbDim').textContent = w.dim;
    document.getElementById('lbYear').textContent = w.year;
    document.getElementById('lbStatus').textContent = w.status;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  grid.addEventListener('click', (e) => {
    const a = e.target.closest('.work');
    if (a) openLb(+a.dataset.i);
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.getElementById('lbPrev').addEventListener('click', () => openLb((currentI - 1 + WORKS.length) % WORKS.length));
  document.getElementById('lbNext').addEventListener('click', () => openLb((currentI + 1) % WORKS.length));
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb((currentI - 1 + WORKS.length) % WORKS.length);
    if (e.key === 'ArrowRight') openLb((currentI + 1) % WORKS.length);
  });
});
