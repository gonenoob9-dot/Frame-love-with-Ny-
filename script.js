(() => {
  /* ===== ឯកសារខាងក្រៅ៖ ប្ដូរទីតាំងនៅទីនេះបាន =====
     ដាក់បានទាំងផ្លូវក្នុង folder, ផ្លូវខាងក្រៅ (ឧ. 'photo.jpg')
     ឬតំណ URL ពេញ (ឧ. 'https://example.com/photo.jpg') */
  const ASSETS = {
    frame: 'frame.png',
    photo: 'photo.jpg',      // រូបភាពក្នុងស៊ុម
    song:  'song.mp3'        // ចម្រៀង
  };
  document.documentElement.style.setProperty('--frame-url', `url("${ASSETS.frame}")`);

  /* ===== ទិន្នន័យស៊ុម (រូប frame.png ទំហំ 550×731) ===== */
  const IMG_W = 550, IMG_H = 731;
  const OPEN = { x: 61, y: 58, w: 428, h: 613 };   // ទំហំរន្ធខាងក្នុងស៊ុមក្នុងរូប
  const DEPTH_RATIO = 0.045;                       // ក្រាស់ស៊ុម ធៀបនឹងកម្ពស់
  const OVERLAP = 12;                              // រូបភាពលូនក្រោមស៊ុម (px ក្នុងរូប)

  const stage = document.getElementById('stage');
  const scene = document.getElementById('scene');
  const frame = document.getElementById('frame');
  const shadow = document.getElementById('shadow');

  let S = 1, W, H, D;
  let photoEl, glassEl;
  let imgRatio = 2437 / 3264;      // សមាមាត្ររូបភាពលំនាំដើម
  let coverMode = true;
  let msgEl = null, L = null;
  let text1 = null, text2 = null, glyph = null, glyph2 = null;
  let animRaf = null, pendingFinish = false;

  // ចម្រៀង៖ ចាក់ម្ដងពេលចុច "ហាមចុច" ហើយឈប់ពេលចប់បទ (មិនវិលជុំ)
  const song = new Audio(ASSETS.song);
  song.preload = 'auto';
  song.loop = false;
  let revealed = false, typed = 0, typer = null;

  const MESSAGE = `នីអើយ ❤️ បងមិនដឹងថាត្រូវប្រើពាក្យអ្វីឱ្យអស់ដើម្បីពណ៌នាពីសេចក្តីស្រឡាញ់ដែលបងមានចំពោះអូននោះទេ ព្រោះអូនមិនមែនគ្រាន់តែជាមនុស្សម្នាក់ដែលបងស្រឡាញ់ប៉ុណ្ណោះទេ ប៉ុន្តែអូនគឺជាមនុស្សដែលធ្វើឱ្យជីវិតបងមានន័យ ធ្វើឱ្យថ្ងៃធម្មតាក្លាយជាថ្ងៃពិសេស និងធ្វើឱ្យបេះដូងបងមានស្នាមញញឹម ទោះបីពេលខ្លះយើងមានការមិនយល់ចិត្តគ្នា មានការខឹង មានការអន់ចិត្ត ឬជួបបញ្ហាអ្វីក៏ដោយ ក៏វាមិនអាចធ្វើឱ្យសេចក្តីស្រឡាញ់របស់បងចំពោះអូនថយចុះបានឡើយ ព្រោះបងមិនចង់បានអូនត្រឹមតែពេលដែលអ្វីៗល្អនោះទេ ប៉ុន្តែបងចង់នៅក្បែរអូនទាំងពេលសប្បាយ និងពេលពិបាក ចង់ចែករំលែកទុក្ខសោកនិងសុភមង្គលជាមួយអូន ចង់ក្លាយជាមនុស្សដែលអូនអាចពឹងពាក់បាននៅពេលអូននឿយហត់ និងចង់ឃើញស្នាមញញឹមរបស់អូនជារៀងរាល់ថ្ងៃ បងមិនអាចសន្យាថានឹងធ្វើឱ្យអូនសប្បាយចិត្តគ្រប់ពេលបានទេ ប៉ុន្តែបងសន្យាថានឹងព្យាយាមថែរក្សា ស្រឡាញ់ យល់ចិត្ត និងមិនបោះបង់អូនដោយងាយៗឡើយ សម្រាប់បង អូនគឺជាមនុស្សពិសេសដែលបងចង់មាននៅក្នុងថ្ងៃនេះ ថ្ងៃស្អែក និងគ្រប់ថ្ងៃបន្ទាប់ពីនេះ បងមិនចង់ស្រឡាញ់អូនត្រឹមតែមួយរយៈពេលទេ ប៉ុន្តែបងចង់ស្រឡាញ់អូនឱ្យបានយូរអង្វែង ព្រោះក្នុងចំណោមមនុស្សជាច្រើន បងបានជ្រើសរើសបេះដូងអូន ហើយបងក៏សង្ឃឹមថានឹងអាចកាន់ដៃអូនដើរទៅមុខជាមួយគ្នារហូតដល់ថ្ងៃដែលយើងមើលត្រឡប់ក្រោយ ហើយញញឹមដោយមោទនភាពថា យើងបានឆ្លងកាត់អ្វីៗជាច្រើនជាមួយគ្នា។ បងស្រឡាញ់អូនណាស់ នី ❤️🥺`;
  const units = (typeof Intl !== 'undefined' && Intl.Segmenter)
    ? Array.from(new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(MESSAGE), x => x.segment)
    : Array.from(MESSAGE);

  /* ===== បង្កើត DOM 3D ===== */
  function face(cls, w, h, transform) {
    const el = document.createElement('div');
    el.className = 'face ' + cls;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.transform = `translate(${-w / 2}px,${-h / 2}px) ` + transform;
    frame.appendChild(el);
    return el;
  }

  function build() {
    frame.innerHTML = '';
    const vh = stage.clientHeight, vw = stage.clientWidth;
    S = Math.min((vh * 0.84) / (IMG_H * 1.18), (vw * 0.82) / IMG_W);
    W = IMG_W * S; H = IMG_H * S; D = H * DEPTH_RATIO;
    const ow = OPEN.w * S, oh = OPEN.h * S;
    // ទីតាំងកណ្ដាលរន្ធ ធៀបនឹងកណ្ដាលស៊ុម
    const ox = (OPEN.x + OPEN.w / 2 - IMG_W / 2) * S;
    const oy = (OPEN.y + OPEN.h / 2 - IMG_H / 2) * S;
    const hd = D / 2;

    // ខាងក្រៅ (ក្រាស់)
    face('f-outer', W, D, `translateY(${-H / 2}px) rotateX(90deg)`);
    face('f-outer', W, D, `translateY(${H / 2}px) rotateX(90deg)`);
    face('f-outer', D, H, `translateX(${-W / 2}px) rotateY(90deg)`);
    face('f-outer', D, H, `translateX(${W / 2}px) rotateY(90deg)`);
    // ខាងក្នុងរន្ធ
    face('f-inner', ow, D, `translate3d(${ox}px,${oy - oh / 2}px,0) rotateX(90deg)`);
    face('f-inner', ow, D, `translate3d(${ox}px,${oy + oh / 2}px,0) rotateX(90deg)`);
    face('f-inner', D, oh, `translate3d(${ox - ow / 2}px,${oy}px,0) rotateY(90deg)`);
    face('f-inner', D, oh, `translate3d(${ox + ow / 2}px,${oy}px,0) rotateY(90deg)`);

    // អក្សរ 3D ពិត "ហាមចុច" (ចុចហើយប្ដូរជា "នីអើយ") នៅកណ្ដាលផ្នែកខាងក្រោយ
    L = { ow, oh, ox, oy, hd };
    msgEl = null; text1 = null; text2 = null;
    if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; pendingFinish = true; }
    if (!revealed) {
      if (glyph) {
        const k = Math.min(ow * 0.7 / glyph.w, oh * 0.24 / glyph.h);
        const T = Math.max(8, glyph.h * k * 0.22);
        text1 = buildText3D(glyph, k, T);
        if (glyph2) {
          text2 = buildText3D(glyph2, k, T);
          text2.group.style.display = 'none'; text2.shGroup.style.display = 'none';
        }
      }
    } else { makeMessage(); }

    // រូបភាព៖ ខិតមកមុខ ចំកណ្ដាលរន្ធស៊ុម (ពង្រីកបន្តិចឱ្យលូនក្រោមស៊ុម)
    const pw = ow + OVERLAP * 2 * S, ph = oh + OVERLAP * 2 * S;
    photoEl = face('f-photo', pw, ph, `translate3d(${ox}px,${oy}px,${hd - 4}px)`);
    // ក្តារខាងក្រោយ (ដូចមុន)
    face('f-board', ow + 2, oh + 2, `translate3d(${ox}px,${oy}px,${-hd + 2}px) rotateY(180deg)`);
    applyPhotoMode();
    if (currentSrc) { photoEl.style.backgroundImage = `url("${currentSrc}")`; }

    // មុខ និង ក្រោយ
    face('f-front', W, H, `translateZ(${hd}px)`);
    face('f-back', W, H, `rotateY(180deg) translateZ(${hd}px)`);

    // ប្រដាប់ព្យួរ៖ ចិញ្ចៀនដែក + ខ្សែ + ដែកគោល នៅកណ្ដាលខាងលើស៊ុម
    const hh = H * 0.2, hw = hh * (100 / 150);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="100%" height="100%">
      <defs>
        <linearGradient id="mt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0f4"/><stop offset=".5" stop-color="#f3a9c0"/><stop offset="1" stop-color="#b8527a"/></linearGradient>
        <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fafafa"/><stop offset="1" stop-color="#8d8d99"/></linearGradient>
      </defs>
      <path d="M50 118 C26 84 38 44 50 18" fill="none" stroke="#ffd3e2" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M50 118 C74 84 62 44 50 18" fill="none" stroke="#ffb0cb" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="50" cy="13" r="8" fill="url(#ng)" stroke="#5b5b66" stroke-width="1.2"/>
      <circle cx="50" cy="13" r="2.6" fill="#5b5b66"/>
      <circle cx="50" cy="124" r="11" fill="none" stroke="url(#mt)" stroke-width="5"/>
      <rect x="34" y="134" width="32" height="16" rx="5" fill="url(#mt)" stroke="#a33d68" stroke-width="1"/>
      <circle cx="42" cy="142" r="2" fill="#7d2349"/><circle cx="58" cy="142" r="2" fill="#7d2349"/>
    </svg>`;
    const hy = -H / 2 - hh / 2 + 16 * S;
    [[0, 0.8], [90, 0]].forEach(([ang, z]) => {
      const el = face('f-hanger', hw, hh, `translate3d(0,${hy}px,${z}px) rotateY(${ang}deg)`);
      el.innerHTML = svg;
    });

    // បេះដូងលម្អ ៤ ជ្រុង ទៅលើមុខស៊ុម
    const hs = Math.max(16, 30 * S);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      const el = face('f-heart', hs, hs, `translate3d(${sx * (W / 2 - 14 * S)}px,${sy * (H / 2 - 14 * S)}px,${hd + 2}px)`);
      el.textContent = '♥'; el.style.fontSize = hs + 'px';
    });
    const topHeart = face('f-heart', hs * 1.3, hs * 1.3, `translate3d(0,${-H / 2 + 8 * S}px,${hd + 2}px)`);
    topHeart.textContent = '♥'; topHeart.style.fontSize = hs * 1.3 + 'px';

    // កញ្ចក់ភ្លឺ
    glassEl = face('f-glass', ow, oh, `translate3d(${ox}px,${oy}px,${hd - 1.5}px)`);

    scene.style.top = (H * 0.1) + 'px';
    shadow.style.width = Math.min(W * 0.9, 420) + 'px';
    update();
    if (pendingFinish) { pendingFinish = false; startTyping(); }
  }


  /* ===== អក្សរ 3D ពិត៖ ចាប់គ្រោងអក្សរពី canvas រួច extrude ជាសាច់រឹង ===== */
/* ===== marching squares: alpha -> closed loops (inside always on the LEFT of travel, y-down) ===== */
function traceContours(data, w, h) {
  const f = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -0.5 : data[(y * w + x) * 4 + 3] / 255 - 0.5;
  const hp = (x, y) => { const a = f(x, y), b = f(x + 1, y); return { k: 'h' + x + ',' + y, x: x + a / (a - b), y }; };
  const vp = (x, y) => { const a = f(x, y), b = f(x, y + 1); return { k: 'v' + x + ',' + y, x, y: y + a / (a - b) }; };
  const segs = new Map();
  const add = (p, q) => segs.set(p.k, { p, q });
  for (let y = -1; y < h; y++) {
    for (let x = -1; x < w; x++) {
      const fa = f(x, y), fb = f(x + 1, y), fc = f(x + 1, y + 1), fd = f(x, y + 1);
      const ci = (fa > 0 ? 8 : 0) | (fb > 0 ? 4 : 0) | (fc > 0 ? 2 : 0) | (fd > 0 ? 1 : 0);
      if (ci === 0 || ci === 15) continue;
      const T = hp(x, y), B = hp(x, y + 1), L = vp(x, y), R = vp(x + 1, y);
      const mid = (fa + fb + fc + fd) / 4 > 0;
      switch (ci) {
        case 1: add(B, L); break;
        case 2: add(R, B); break;
        case 3: add(R, L); break;
        case 4: add(T, R); break;
        case 5: if (mid) { add(T, L); add(B, R); } else { add(T, R); add(B, L); } break;
        case 6: add(T, B); break;
        case 7: add(T, L); break;
        case 8: add(L, T); break;
        case 9: add(B, T); break;
        case 10: if (mid) { add(R, T); add(L, B); } else { add(L, T); add(R, B); } break;
        case 11: add(R, T); break;
        case 12: add(L, R); break;
        case 13: add(B, R); break;
        case 14: add(L, B); break;
      }
    }
  }
  const loops = [], used = new Set();
  for (const [k0, s0] of segs) {
    if (used.has(k0)) continue;
    const loop = [];
    let key = k0, s = s0;
    while (s && !used.has(key)) {
      used.add(key);
      loop.push([s.p.x + 0.5, s.p.y + 0.5]);
      key = s.q.k; s = segs.get(key);
    }
    if (loop.length > 2) loops.push(loop);
  }
  return loops;
}

function dpLine(pts, eps) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  let mi = 0, md = -1;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = len < 1e-9 ? Math.hypot(p[0] - a[0], p[1] - a[1]) : Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len;
    if (d > md) { md = d; mi = i; }
  }
  if (md <= eps) return [a, b];
  return dpLine(pts.slice(0, mi + 1), eps).slice(0, -1).concat(dpLine(pts.slice(mi), eps));
}
function simplifyLoop(pts, eps) {
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  const s1 = dpLine(pts.slice(0, far + 1), eps);
  const s2 = dpLine(pts.slice(far).concat([pts[0]]), eps);
  return s1.slice(0, -1).concat(s2.slice(0, -1));
}
function loopArea(p) { let s = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; s += p[i][0] * q[1] - q[0] * p[i][1]; } return s / 2; }

  const WORD = 'ហាមចុច', WORD2 = 'នីអើយ';
  const WORD_FONT = '"Noto Sans Khmer","Khmer OS Battambang","Khmer UI","Leelawadee UI","Noto Serif Khmer",sans-serif';
  const MAX_SEGS = 120;                       // កំណត់ចំនួនជញ្ជាំង ដើម្បីកុំឱ្យធ្ងន់ទូរស័ព្ទ

  function makeGlyph(px, word) {
    const c = document.createElement('canvas');
    const g = c.getContext('2d', { willReadFrequently: true });
    const font = `700 ${px}px ${WORD_FONT}`;
    g.font = font;
    const m = g.measureText(word);
    const hasBB = m.actualBoundingBoxAscent !== undefined;
    const asc = hasBB ? m.actualBoundingBoxAscent : px * 1.0;
    const desc = hasBB ? m.actualBoundingBoxDescent : px * 0.5;
    const left = hasBB ? m.actualBoundingBoxLeft : 0;
    const right = hasBB ? m.actualBoundingBoxRight : m.width;
    const lw = px * 0.035, pad = Math.ceil(lw + 6);
    const w = Math.ceil(left + right) + pad * 2, h = Math.ceil(asc + desc) + pad * 2;
    c.width = w; c.height = h;
    const x0 = pad + left, y0 = pad + asc;
    const draw = (fill, stroke) => {
      g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.lineJoin = 'round'; g.lineWidth = lw;
      if (stroke) { g.strokeStyle = stroke; g.strokeText(word, x0, y0); }
      if (fill) { g.fillStyle = fill; g.fillText(word, x0, y0); }
    };
    // 1) ទម្រង់ (mask) សម្រាប់តាមគ្រោង
    draw('#000', '#000');
    const data = g.getImageData(0, 0, w, h).data;
    let loops = traceContours(data, w, h).filter(l => Math.abs(loopArea(l)) > 6);
    // 2) កាត់បន្ថយចំនួនចំណុច រហូតដល់ក្នុងកម្រិតកំណត់
    let eps = 0.8, simp;
    for (;;) {
      simp = loops.map(l => simplifyLoop(l, eps)).filter(l => l.length >= 3);
      if (simp.reduce((a, l) => a + l.length, 0) <= MAX_SEGS || eps > 4) break;
      eps += 0.25;
    }
    // 3) ផ្ទៃមុខអក្សរ (cap)៖ គែមផ្កាឈូកចាស់ + ខាងក្នុងពណ៌ស→ផ្កាឈូកស្រាល
    g.clearRect(0, 0, w, h);
    draw('#ff6fa8', '#ff6fa8');
    const grad = g.createLinearGradient(0, pad, 0, h - pad);
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(1, '#ffc6de');
    g.fillStyle = grad; g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText(word, x0, y0);
    const url = c.toDataURL('image/png');
    // ពន្លឺ និងស្រមោល ដុតជារូបភាពតែម្ដង (មិនប្រើ filter ដែលធ្ងន់)
    const gm = Math.ceil(px * 0.14);
    const blurred = (color, blur, times) => {
      const o = document.createElement('canvas');
      o.width = w + 2 * gm; o.height = h + 2 * gm;
      const og = o.getContext('2d');
      og.shadowColor = color; og.shadowBlur = blur; og.shadowOffsetX = o.width;
      for (let i = 0; i < times; i++) og.drawImage(c, gm - o.width, gm);
      return o.toDataURL('image/png');
    };
    return { w, h, m: gm, loops: simp, url,
      glowUrl: blurred('rgba(255,120,170,0.95)', 14, 2),
      shUrl: blurred('rgba(0,0,0,0.6)', 6, 1) };
  }

  function prepareGlyph() {
    const px = 150;
    const go = () => { try { glyph = makeGlyph(px, WORD); glyph2 = makeGlyph(px, WORD2); } catch (e) { glyph2 = null; if (!glyph) glyph = null; } build(); };
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load(`700 ${px}px "Noto Sans Khmer"`, WORD + WORD2),
        new Promise(r => setTimeout(r, 3000))
      ]).then(go, go);
    } else go();
  }

  function kid(parent, cls, w, h, transform) {
    const el = document.createElement('div');
    el.className = cls;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.transform = `translate(${-w / 2}px,${-h / 2}px) ` + transform;
    parent.appendChild(el);
    return el;
  }

  function buildText3D(gl, k, T) {
    const { ow, oh, ox, oy, hd } = L;
    const gw = gl.w * k, gh = gl.h * k;
    const base = `translate3d(${ox}px,${oy}px,${-hd + 2}px) rotateY(180deg)`;

    // ស្រមោលលើក្តារ (ក្រុមដាច់ដោយឡែក ដើម្បីនៅលើក្តារពេលអក្សរអណ្ដែត)
    const shGroup = face('f-tg', 0, 0, base);
    const ew = gw + 2 * gl.m * k, eh = gh + 2 * gl.m * k;     // ទំហំរួមទាំងគែមព្រាល
    const sh = kid(shGroup, 'f-tk f-tshadow', ew, eh, `translate3d(${gw * 0.025}px,${gh * 0.07}px,0.4px)`);
    sh.style.backgroundImage = `url(${gl.shUrl})`;

    // ក្រុមអក្សរ៖ គល់នៅលើក្តារ, +z (ក្នុងក្រុម) ចេញមករកអ្នកមើលផ្នែកខាងក្រោយ
    const group = face('f-tg', 0, 0, base);
    const LX = -0.55, LY = -0.83;
    const DARK = [88, 12, 50], LIGHT = [255, 128, 178];
    const mix = (t) => DARK.map((v, i) => Math.round(v + (LIGHT[i] - v) * t)).join(',');
    gl.loops.forEach(loop => {
      const P = loop.map(([x, y]) => [(x - gl.w / 2) * k, (y - gl.h / 2) * k]);
      const n = P.length;
      const N = P.map((p, i) => {
        const q = P[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
        return { len, nx: -dy / len, ny: dx / len, ang: Math.atan2(dy, dx) * 180 / Math.PI };
      });
      for (let i = 0; i < n; i++) {
        const s = N[i];
        if (s.len < 0.05) continue;
        const p = P[i], q = P[(i + 1) % n];
        let nx = s.nx, ny = s.ny;
        const a = N[(i + n - 1) % n], b = N[(i + 1) % n];
        if (a.nx * s.nx + a.ny * s.ny > 0.8) { nx += a.nx; ny += a.ny; }
        if (b.nx * s.nx + b.ny * s.ny > 0.8) { nx += b.nx; ny += b.ny; }
        const nl = Math.hypot(nx, ny) || 1;
        const lit = Math.max(0, Math.min(1, 0.5 + 0.5 * ((nx / nl) * LX + (ny / nl) * LY)));
        const t = 0.22 + 0.78 * lit;
        const el = kid(group, 'f-tk f-wall', s.len + 0.8, T,
          `translate3d(${(p[0] + q[0]) / 2}px,${(p[1] + q[1]) / 2}px,${T / 2}px) rotateZ(${s.ang}deg) rotateX(-90deg)`);
        el.style.background = `linear-gradient(180deg,rgb(${mix(t)}),rgb(${mix(t * 0.42)}))`;
      }
    });
    const glow = kid(group, 'f-tk', ew, eh, `translate3d(0,0,${T + 0.1}px)`);
    glow.style.backgroundImage = `url(${gl.glowUrl})`;
    const cap = kid(group, 'f-tk f-cap', gw, gh, `translate3d(0,0,${T + 0.3}px)`);
    cap.style.backgroundImage = `url(${gl.url})`;
    return { group, shGroup, sh, cap, gw, gh, T };
  }

  // ដាក់ទីតាំងអក្សរ (កូអរដោណេក្នុងក្រុម៖ x ស្ដាំ, y ចុះ, z ចេញមករកអ្នកមើលផ្នែកខាងក្រោយ)
  function pose(t, lx, ly, lz, a, s) {
    t.group.style.transform =
      `translate3d(${L.ox}px,${L.oy}px,${-L.hd + 2}px) rotateY(180deg) translate3d(${lx}px,${ly}px,${lz}px) rotateY(${a}deg) scale(${s})`;
  }

  const easeIn = t => t * t * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ===== សារស្នេហ៍ (សរសេរយឺតៗ) ===== */
  let msgInner = null;

  // កំណត់ពណ៌ពាក្យពិសេស៖ "បង" = ពណ៌ផ្ទៃមេឃ, "អូន" និង "នី" = ពណ៌ផ្កាឈូក (ក្រាស់ទាំងអស់)
  const unitClass = (() => {
    const cls = new Array(units.length).fill('');
    const offs = [];
    let o = 0;
    units.forEach(u => { offs.push(o); o += u.length; });
    const mark = (re, name) => {
      let m;
      while ((m = re.exec(MESSAGE))) {
        const st = m.index, en = st + m[0].length;
        for (let i = 0; i < units.length; i++) if (offs[i] >= st && offs[i] < en) cls[i] = name;
      }
    };
    const NOT_MARK = '(?![\u17B6-\u17D3\u17DD])';   // មិនមែនជាផ្នែកនៃពាក្យផ្សេង (ឧ. បង់, បង្ក)
    mark(new RegExp('បង' + NOT_MARK, 'g'), 'w-sky');
    mark(new RegExp('អូន' + NOT_MARK, 'g'), 'w-pink');
    mark(new RegExp('នី' + NOT_MARK, 'g'), 'w-pink');
    return cls;
  })();

  function appendRuns(parent, from, to, extra) {
    let i = from;
    while (i < to) {
      let j = i + 1;
      while (j < to && unitClass[j] === unitClass[i]) j++;
      const sp = document.createElement('span');
      const c = unitClass[i];
      sp.className = (c + ' ' + extra).trim();
      sp.textContent = units.slice(i, j).join('');
      parent.appendChild(sp);
      i = j;
    }
  }

  function renderMessage() {
    if (!msgInner) return;
    msgInner.textContent = '';
    appendRuns(msgInner, 0, typed, '');
    appendRuns(msgInner, typed, units.length, 'off');   // ផ្នែកមិនទាន់សរសេរ (លាក់ តែរក្សាទំហំ)
  }

  function makeMessage() {
    const { ow, oh, ox, oy, hd } = L;
    msgEl = face('f-msg', ow, oh, `translate3d(${ox}px,${oy}px,${-hd - 0.5}px) rotateY(180deg)`);
    const pad = Math.max(4, ow * 0.045);
    msgEl.style.padding = pad + 'px';
    msgInner = document.createElement('div');
    msgInner.className = 'msg-inner';
    msgEl.appendChild(msgInner);
    renderMessage();
    // រៀបអក្សរជាទំហំធម្មតា (14px) រួចបង្រួមដោយ scale ឱ្យសារទាំងមូលនៅក្នុងក្តារ
    // (មិនពឹងលើទំហំអក្សរអប្បបរមារបស់កម្មវិធីរុករក ដូច្នេះប្រើបានលើអេក្រង់តូចគ្រប់ទំហំ)
    const aw = ow - 2 * pad, ah = oh - 2 * pad;
    let lo = 0.02, hi = 3;
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2;
      msgInner.style.width = (aw / mid) + 'px';
      msgInner.style.transform = `scale(${mid})`;
      if (msgInner.offsetHeight * mid <= ah) lo = mid; else hi = mid;
    }
    msgInner.style.width = (aw / lo) + 'px';
    msgInner.style.transform = `scale(${lo})`;
  }

  function startTyping() {
    if (typer) return;
    const tick = () => {
      if (typed >= units.length) { typer = null; return; }
      typed++;
      renderMessage();
      const ch = units[typed - 1];
      const d = ch === '។' ? 800 : ch === ' ' ? 260 : 55;
      typer = setTimeout(tick, d);
    };
    typer = setTimeout(tick, 300);
  }

  function finishReveal() {
    [text1, text2].forEach(t => { if (t) { t.group.remove(); t.shGroup.remove(); } });
    text1 = text2 = null;
    if (!msgEl || !msgEl.isConnected) makeMessage();
    startTyping();
  }

  // ចុច៖ "ហាមចុច" ប្ដូរជា "នីអើយ" ហើយអណ្ដែតឡើង → ហោះរួមតូចទៅកន្លែងសារ → បាត់ → សារលេចចេញ
  function reveal() {
    revealed = true; vx = vy = 0; auto = false; tween = null;
    try { song.currentTime = 0; const p = song.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
    const t1 = text1, t2 = text2;
    if (!t1 || !t2) { finishReveal(); return; }
    const { ow, oh } = L;
    const floatY = -oh * 0.13, floatZ = Math.max(26, t2.T * 2.2);
    const pad = Math.max(4, ow * 0.045);
    const tx = -ow / 2 + pad + 8, ty = -oh / 2 + pad + 6;       // កន្លែងអក្សរដំបូងនៃសារ
    const C = 900, D = 350, E = 950;
    const t0 = performance.now();

    // ប្ដូរជា "នីអើយ" ភ្លាមៗ រួចអណ្ដែតឡើងតែម្ដង (គ្មានវិល)
    t1.group.style.display = 'none'; t1.shGroup.style.display = 'none';
    t2.group.style.display = ''; t2.shGroup.style.display = '';

    const step = (now) => {
      const t = now - t0;
      if (t < C) {                                                // ១) ប្ដូរ + អណ្ដែតឡើង
        const u = easeOut(t / C);
        pose(t2, 0, floatY * u, floatZ * u, 0, 1 + 0.06 * u);
        t2.sh.style.opacity = 0.9 * (1 - 0.8 * u);
      } else if (t < C + D) {                                     // ២) អណ្ដែតស្ងាត់
        const w = (t - C) / 160;
        pose(t2, 0, floatY + Math.sin(w) * 3, floatZ, 0, 1.06);
      } else if (t < C + D + E) {                                 // ៣) ហោះរួមតូចទៅកន្លែងសារ (គ្មានវិល)
        const u = easeInOut((t - C - D) / E);
        pose(t2, lerp(0, tx, u), lerp(floatY, ty, u), lerp(floatZ, 2.5, u), 0, lerp(1.06, 0.07, u));
        t2.sh.style.opacity = 0.18 * (1 - u);
        if (u > 0.85) t2.group.style.opacity = Math.max(0, 1 - (u - 0.85) / 0.15);
      } else {                                                    // ៤) បាត់ → សារលេចចេញ
        animRaf = null;
        finishReveal();
        return;
      }
      animRaf = requestAnimationFrame(step);
    };
    animRaf = requestAnimationFrame(step);
  }

  function onTap(x, y) {
    if (revealed || !text1) return;
    // ត្រូវតែបែរមកផ្នែកខាងក្រោយ
    if (Math.cos(rx * Math.PI / 180) * Math.cos(ry * Math.PI / 180) >= 0) return;
    const b = text1.cap.getBoundingClientRect(), pad = 24;
    if (x >= b.left - pad && x <= b.right + pad && y >= b.top - pad && y <= b.bottom + pad) reveal();
  }

  function applyPhotoMode() {
    photoEl.style.backgroundSize = coverMode ? 'cover' : 'contain';
  }

  /* ===== រូបភាព ===== */
  let currentSrc = null;
  function setPhoto(src) {
    currentSrc = src;
    photoEl.style.backgroundImage = `url("${src}")`;
  }

  // រូបគំរូ (សមាមាត្រ 2437×3264) ដែលគូរដោយ canvas
  function sampleImage() {
    const c = document.createElement('canvas');
    c.width = 487; c.height = 652;
    const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 652);
    sky.addColorStop(0, '#1b2a5e'); sky.addColorStop(.45, '#c1566b'); sky.addColorStop(.7, '#f6a35c'); sky.addColorStop(1, '#2a1d3a');
    g.fillStyle = sky; g.fillRect(0, 0, 487, 652);
    g.fillStyle = 'rgba(255,240,200,.95)'; g.beginPath(); g.arc(243, 330, 70, 0, 7); g.fill();
    const mt = (col, base, amp, seed) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, 652);
      for (let x = 0; x <= 487; x += 8) g.lineTo(x, base - amp * Math.abs(Math.sin(x * .021 + seed)) - amp * .5 * Math.sin(x * .055 + seed * 2));
      g.lineTo(487, 652); g.fill();
    };
    mt('#6b3a5a', 450, 70, 1); mt('#3e2348', 510, 60, 3); mt('#1c1228', 580, 50, 5);
    g.fillStyle = '#fff'; g.font = '700 22px sans-serif'; g.textAlign = 'center';
    g.fillText('សូមដាក់រូបភាពរបស់អ្នក', 243, 70);
    return c.toDataURL('image/jpeg', .9);
  }

  /* ===== ការបង្វិល 360° ===== */
  let rx = -8, ry = 28, zoom = 1;
  let vx = 0, vy = 0;
  let dragging = false, lx = 0, ly = 0;
  let auto = false, tween = null, dirty = false;

  function update() {
    scene.style.transform = `scale(${zoom}) rotateX(${rx}deg) rotateY(${ry}deg)`;
    // ស្រមោលខាងក្រោម
    const k = Math.abs(Math.cos(ry * Math.PI / 180));
    shadow.style.transform = `translateX(-50%) scaleX(${0.35 + 0.65 * k})`;
    shadow.style.opacity = 0.55 + 0.45 * k;
  }

  stage.addEventListener('pointerdown', e => {
    dragging = true; tween = null; lx = e.clientX; ly = e.clientY; vx = vy = 0;
    stage.classList.add('dragging');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    vy = dx * 0.45; vx = -dy * 0.35;
    ry += vy; rx += vx;
    dirty = true;
  });
  const end = () => { dragging = false; stage.classList.remove('dragging'); };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  let down = null;
  stage.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  stage.addEventListener('pointerup', e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
    down = null;
    if (moved < 8 && dt < 500) onTap(e.clientX, e.clientY);
  });

  stage.addEventListener('wheel', e => {
    e.preventDefault();
    zoom = Math.min(2.2, Math.max(0.5, zoom * (e.deltaY < 0 ? 1.07 : 0.93)));
    dirty = true;
  }, { passive: false });

  // ច្បិចពង្រីកលើទូរស័ព្ទ
  const pts = new Map(); let pinch0 = 0, zoom0 = 1;
  stage.addEventListener('pointerdown', e => { pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); zoom0 = zoom; dragging = false; } });
  stage.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); zoom = Math.min(2.2, Math.max(0.5, zoom0 * d / pinch0)); dirty = true; }
  });
  ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, e => pts.delete(e.pointerId)));

  function loop() {
    if (dirty) { dirty = false; update(); }
    if (!dragging) {
      if (tween) {
        const t = Math.min(1, (performance.now() - tween.t0) / tween.dur);
        const k = 1 - Math.pow(1 - t, 3);
        ry = tween.fy + (tween.ty - tween.fy) * k;
        rx = tween.fx + (tween.tx - tween.fx) * k;
        if (t >= 1) tween = null;
        update();
      } else {
        if (auto) { vy = 0.6; vx *= 0.9; }
        if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
          ry += vy; rx += vx;
          if (!auto) { vx *= 0.95; vy *= 0.95; }
          update();
        }
      }
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', build);

  /* ===== បេះដូងអណ្ដែតក្នុងផ្ទៃខាងក្រោយ ===== */
  (function () {
    const box = document.getElementById('hearts');
    for (let i = 0; i < 8; i++) {
      const el = document.createElement('i');
      el.textContent = Math.random() > .5 ? '♥' : '❤';
      el.style.left = Math.random() * 100 + '%';
      el.style.fontSize = 12 + Math.random() * 22 + 'px';
      el.style.animationDuration = 7 + Math.random() * 8 + 's';
      el.style.animationDelay = -Math.random() * 12 + 's';
      box.appendChild(el);
    }
  })();

  /* ===== ចាប់ផ្ដើម ===== */
  build();
  prepareGlyph();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  setPhoto(ASSETS.photo);
  update();
  requestAnimationFrame(loop);
})();
