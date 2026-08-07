'use strict';

import { ItemParser, DB, QUIZ, CARDS } from './data.js';
import { Search } from './search.js';
import { Progress } from './progress.js';
import { PeriodicTable } from './periodic-table.js';
import { LawsData } from './laws.js';
import { ExamCenter } from './examCenter.js';
import { OrganicData } from './organic-data.js';

const MindMap = {
  // Renders an organic conversion SVG pathway
  renderPathwaySVG(pathway, width) {
    const H = 90; // svg height
    const nodeW = 74, nodeH = 36;
    const arrowW = 50;
    const nodes = pathway.filter(p => p.label);
    const arrows = pathway.filter(p => p.arrow);
    const totalW = nodes.length * nodeW + arrows.length * arrowW;
    const svgW = Math.max(width, totalW + 20);

    let x = 10; let items = [];

    pathway.forEach((p, i) => {
      if (p.label) {
        const cx = x + nodeW / 2;
        const cy = H / 2;
        items.push(`
          <rect x="${x}" y="${cy - nodeH/2}" width="${nodeW}" height="${nodeH}"
            rx="10" fill="${p.clr}18" stroke="${p.clr}" stroke-width="1.5"/>
          <text x="${cx}" y="${cy - 4}" text-anchor="middle"
            font-family="Courier New" font-size="12" font-weight="700" fill="${p.clr}">${p.label}</text>
          <text x="${cx}" y="${cy + 14}" text-anchor="middle"
            font-family="Segoe UI,Tahoma,Arial,sans-serif" font-size="9" fill="#8aaccc">${p.sub || ''}</text>
        `);
        x += nodeW;
      } else if (p.arrow) {
        const cx = x + arrowW / 2;
        const cy = H / 2;
        const lines = p.arrow.split('\n');
        items.push(`
          <line x1="${x + 4}" y1="${cy}" x2="${x + arrowW - 8}" y2="${cy}"
            stroke="#4a6380" stroke-width="1.5" stroke-dasharray="4 3"/>
          <polygon points="${x+arrowW-8},${cy-4} ${x+arrowW-1},${cy} ${x+arrowW-8},${cy+4}"
            fill="#4a6380"/>
          ${lines.map((l, li) => `<text x="${cx}" y="${cy - 8 + li*10}" text-anchor="middle"
            font-family="Courier New" font-size="9" fill="#ffcc44">${l}</text>`).join('')}
        `);
        x += arrowW;
      }
    });

    return `<svg width="${svgW}" height="${H}" xmlns="http://www.w3.org/2000/svg">${items.join('')}</svg>`;
  },

  // Bond formation animation SVG for alkenes
  bondFormationSVG(type) {
    if (type === 'alkene_addition') {
      return `<svg width="300" height="110" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:300px">
        <!-- C=C double bond -->
        <circle cx="90" cy="55" r="18" fill="#00ffb318" stroke="#00ffb3" stroke-width="1.5"/>
        <text x="90" y="60" text-anchor="middle" font-family="Courier New" font-size="14" font-weight="700" fill="#00ffb3">C</text>
        <circle cx="180" cy="55" r="18" fill="#00ffb318" stroke="#00ffb3" stroke-width="1.5"/>
        <text x="180" y="60" text-anchor="middle" font-family="Courier New" font-size="14" font-weight="700" fill="#00ffb3">C</text>
        <!-- σ bond (solid) -->
        <line x1="108" y1="51" x2="162" y2="51" stroke="#00ffb3" stroke-width="2"/>
        <!-- π bond (animated) -->
        <line x1="108" y1="60" x2="162" y2="60" stroke="#ff6eb4" stroke-width="2" stroke-dasharray="6 3" class="anim-pulse"/>
        <!-- Labels -->
        <text x="135" y="44" text-anchor="middle" font-size="9" fill="#8aaccc" font-family="Segoe UI,Tahoma,Arial,sans-serif">رابطة σ</text>
        <text x="135" y="76" text-anchor="middle" font-size="9" fill="#ff6eb4" font-family="Segoe UI,Tahoma,Arial,sans-serif" class="anim-glow">رابطة π (تنكسر في الإضافة)</text>
        <!-- Br approaching -->
        <circle cx="240" cy="55" r="14" fill="#ffcc4418" stroke="#ffcc44" stroke-width="1.5" class="anim-float" style="animation-delay:0.5s"/>
        <text x="240" y="60" text-anchor="middle" font-family="Courier New" font-size="13" font-weight="700" fill="#ffcc44">Br</text>
        <line x1="198" y1="55" x2="224" y2="55" stroke="#ffcc44" stroke-width="1.5" stroke-dasharray="4 3" class="anim-pulse"/>
        <!-- Annotation -->
        <text x="150" y="100" text-anchor="middle" font-size="9" fill="#4a6380" font-family="Segoe UI,Tahoma,Arial,sans-serif">تفاعل إضافة: π تنكسر → رابطة σ جديدة مع Br</text>
      </svg>`;
    }
    if (type === 'alkyne_triple') {
      return `<svg width="300" height="110" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:300px">
        <circle cx="90" cy="55" r="18" fill="#ff6eb418" stroke="#ff6eb4" stroke-width="1.5"/>
        <text x="90" y="60" text-anchor="middle" font-family="Courier New" font-size="14" font-weight="700" fill="#ff6eb4">C</text>
        <circle cx="180" cy="55" r="18" fill="#ff6eb418" stroke="#ff6eb4" stroke-width="1.5"/>
        <text x="180" y="60" text-anchor="middle" font-family="Courier New" font-size="14" font-weight="700" fill="#ff6eb4">C</text>
        <!-- σ bond -->
        <line x1="108" y1="55" x2="162" y2="55" stroke="#ff6eb4" stroke-width="2.5"/>
        <!-- π bond 1 -->
        <line x1="108" y1="46" x2="162" y2="46" stroke="#b97aff" stroke-width="2" stroke-dasharray="5 3" class="anim-pulse"/>
        <!-- π bond 2 -->
        <line x1="108" y1="64" x2="162" y2="64" stroke="#00e5ff" stroke-width="2" stroke-dasharray="5 3" class="anim-pulse" style="animation-delay:0.4s"/>
        <text x="135" y="90" text-anchor="middle" font-size="10" fill="#8aaccc" font-family="Segoe UI,Tahoma,Arial,sans-serif">رابطة ثلاثية: σ + π + π</text>
        <text x="135" y="28" text-anchor="middle" font-size="9" fill="#b97aff" font-family="Segoe UI,Tahoma,Arial,sans-serif">رابطة π</text>
        <text x="135" y="79" text-anchor="middle" font-size="9" fill="#00e5ff" font-family="Segoe UI,Tahoma,Arial,sans-serif">رابطة π</text>
      </svg>`;
    }
    return '';
  },

  renderOrganicNetwork(width) {
    const nodes = [
      { id:'hc', label:'هيدروكربونات', x:70, y:90, clr:'#59b894' },
      { id:'fg', label:'مجموعات وظيفية', x:190, y:35, clr:'#6ab8d1' },
      { id:'rx', label:'ظروف التفاعل', x:310, y:90, clr:'#9a86c5' },
      { id:'cv', label:'تحويلات عضوية', x:190, y:150, clr:'#d5b063' },
    ];
    const links = [['hc','fg'],['fg','rx'],['rx','cv'],['cv','hc'],['hc','rx']];
    const mapById = Object.fromEntries(nodes.map(n => [n.id, n]));
    const W = Math.max(width, 380);
    const scale = W / 380;
    const edgeSvg = links.map(([a,b]) => {
      const n1 = mapById[a], n2 = mapById[b];
      return `<line x1="${n1.x*scale}" y1="${n1.y}" x2="${n2.x*scale}" y2="${n2.y}" stroke="#6f86a3" stroke-width="1.4" stroke-dasharray="5 4"/>`;
    }).join('');
    const nodeSvg = nodes.map(n => `
      <g>
        <rect x="${(n.x-50)*scale}" y="${n.y-18}" width="${100*scale}" height="36" rx="10" fill="${n.clr}22" stroke="${n.clr}" stroke-width="1.5"/>
        <text x="${n.x*scale}" y="${n.y+5}" text-anchor="middle" font-family="Segoe UI,Tahoma,Arial,sans-serif" font-size="11" fill="${n.clr}" font-weight="700">${n.label}</text>
      </g>
    `).join('');
    return `<svg width="${W}" height="190" xmlns="http://www.w3.org/2000/svg">${edgeSvg}${nodeSvg}</svg>`;
  },

  reactionScene(type) {
    if (type === 'alkene_addition') {
      return `
        <svg class="rxn-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg">
          <text x="180" y="20" text-anchor="middle" class="rxn-label">كسر π ثم تكوين روابط σ</text>
          <text x="40" y="74" class="rxn-formula">CH₂=CH₂</text>
          <text x="145" y="74" class="rxn-plus">+</text>
          <text x="165" y="74" class="rxn-formula">Br₂</text>
          <text x="230" y="74" class="rxn-arrow">→</text>
          <text x="258" y="74" class="rxn-formula">BrCH₂-CH₂Br</text>
          <line x1="60" y1="84" x2="98" y2="84" class="rxn-bond pi break"/>
          <line x1="258" y1="84" x2="330" y2="84" class="rxn-bond solid form"/>
          <text x="180" y="126" text-anchor="middle" class="rxn-note">تفاعل إضافة نموذجي للكينات يزيل لون البروم</text>
        </svg>`;
    }
    if (type === 'alcohol_oxidation') {
      return `
        <svg class="rxn-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg">
          <text x="180" y="20" text-anchor="middle" class="rxn-label">أكسدة كحول أولي على خطوتين</text>
          <text x="36" y="74" class="rxn-formula">CH₃CH₂OH</text>
          <text x="122" y="74" class="rxn-arrow">→</text>
          <text x="146" y="74" class="rxn-formula">CH₃CHO</text>
          <text x="228" y="74" class="rxn-arrow">→</text>
          <text x="252" y="74" class="rxn-formula">CH₃COOH</text>
          <rect x="128" y="38" width="104" height="16" rx="6" class="rxn-cond pulse"/>
          <text x="180" y="50" text-anchor="middle" class="rxn-cond-text">K₂Cr₂O₇ / H₂SO₄</text>
          <text x="180" y="126" text-anchor="middle" class="rxn-note">توقيت الإيقاف مهم إذا أردت الحصول على الألدهيد</text>
        </svg>`;
    }
    if (type === 'esterification') {
      return `
        <svg class="rxn-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg">
          <text x="180" y="20" text-anchor="middle" class="rxn-label">تفاعل استرة متزن</text>
          <text x="34" y="74" class="rxn-formula">CH₃COOH</text>
          <text x="118" y="74" class="rxn-plus">+</text>
          <text x="138" y="74" class="rxn-formula">C₂H₅OH</text>
          <text x="220" y="74" class="rxn-arrow">⇌</text>
          <text x="244" y="74" class="rxn-formula">CH₃COOC₂H₅</text>
          <rect x="142" y="38" width="82" height="16" rx="6" class="rxn-cond pulse"/>
          <text x="183" y="50" text-anchor="middle" class="rxn-cond-text">H₂SO₄ + Δ</text>
          <circle cx="232" cy="102" r="3.5" class="rxn-drop drift"/>
          <text x="180" y="126" text-anchor="middle" class="rxn-note">سحب الماء يساعد على زيادة النواتج</text>
        </svg>`;
    }
    return '';
  },

  reactionCard({ id, title, type, steps }) {
    return `
      <div class="glass-card rxn-anim-card fade-in">
        <div class="rxn-anim-head">
          <div class="rxn-anim-title">${title}</div>
          <div class="rxn-anim-controls">
            <button class="rxn-ctrl-btn" data-action="toggle-rxn-anim" data-anim-id="${id}">تشغيل/إيقاف</button>
            <button class="rxn-ctrl-btn" data-action="restart-rxn-anim" data-anim-id="${id}">إعادة</button>
          </div>
        </div>
        <div class="rxn-steps">
          <div class="rxn-step"><span>المتفاعلات:</span> ${steps.reactants}</div>
          <div class="rxn-step"><span>الشرط:</span> ${steps.condition}</div>
          <div class="rxn-step"><span>الناتج:</span> ${steps.product}</div>
          <div class="rxn-step"><span>تفسير:</span> ${steps.note}</div>
        </div>
        <div class="rxn-stage" id="${id}">
          ${this.reactionScene(type)}
        </div>
      </div>`;
  }
};

const ChemFormat = {
  sub(v) { return `<sub class="chem-sub">${v}</sub>`; },
  sup(v) { return `<sup class="chem-sup">${v}</sup>`; },
  formula(raw) {
    return String(raw || '').replace(/([A-Za-z\)])(\d+)/g, (_, p1, p2) => `${p1}<sub class="chem-sub">${p2}</sub>`);
  },
  charge(base, charge) {
    return `${this.formula(base)}<sup class="chem-sup">${charge}</sup>`;
  },
  power(base, exp) {
    return `${base}<sup class="chem-sup">${exp}</sup>`;
  },
  root(expr, order = 2) {
    if (order === 2) return `√(<span class="chem-ltr">${expr}</span>)`;
    return `<span class="chem-sup">${order}</span>√(<span class="chem-ltr">${expr}</span>)`;
  },
};


const Renderer = {

  /* — HOME — */
  home(adaptiveHome = null) {
    const hero = `
      <div class="home-hero fade-in">
        <div class="hero-brand-wrap">
          <img src="assets/images/catalyst_logo_reference.png" alt="Catalyst" class="hero-brand-mark">
          <div class="hero-title">CATALYST</div>
          <div class="hero-tagline">Visualize • Understand • Transform</div>
        </div>
      </div>`;

    const studySection = `
      <section class="glass-card home-path-card fade-in fade-in-delay-1">
        <div class="home-path-title">ذاكر وافهم</div>
        <div class="home-path-desc">ابدأ بمسار الفهم الأساسي من المحتوى الدراسي.</div>
        <div class="home-path-actions">
          <button class="home-quick-btn" data-action="tab" data-tab="organic">الكيمياء العضوية</button>
          <button class="home-quick-btn" data-action="tab" data-tab="periodic">الجدول الدوري</button>
          <button class="home-quick-btn" data-action="tab" data-tab="laws">القوانين</button>
        </div>
      </section>`;

    const exploreSection = `
      <section class="glass-card home-path-card fade-in fade-in-delay-2">
        <div class="home-path-title">استكشف وتدرّب</div>
        <div class="home-path-desc">تدريب بصري وتفاعلي على المفاهيم المهمة.</div>
        <div class="home-path-actions">
          <button class="home-quick-btn" data-action="tab" data-tab="search">البحث الذكي</button>
          <button class="home-quick-btn" data-action="tab" data-tab="periodic">التوزيع الإلكتروني</button>
          <button class="home-quick-btn" data-action="tab" data-tab="organic">التفاعلات العضوية</button>
          <button class="home-quick-btn" data-action="tab" data-tab="quiz">الاختبار السريع</button>
        </div>
      </section>`;

    const reviewSection = `
      <section class="glass-card home-path-card fade-in fade-in-delay-3">
        <div class="home-path-title">راجع بسرعة</div>
        <div class="home-path-desc">مراجعة خفيفة قبل الاختبار أو بعد المذاكرة.</div>
        <div class="home-path-actions">
          <button class="home-quick-btn" data-action="tab" data-tab="laws">مراجعة سريعة للقوانين</button>
          <button class="home-quick-btn" data-action="open-periodic-filter" data-filter="transition">السلسلة الانتقالية</button>
        </div>
      </section>`;

    const curriculumOrder = ['transition', 'iron', 'qualitative', 'hydrocarbons', 'org_derivatives'];
    const unitsSorted = [...DB.units].sort((a, b) => {
      const ia = curriculumOrder.indexOf(a.id);
      const ib = curriculumOrder.indexOf(b.id);
      const va = ia === -1 ? 999 : ia;
      const vb = ib === -1 ? 999 : ib;
      return va - vb;
    });

    const unitsHtml = unitsSorted.map((u, i) => {
      const totalN = u.sections.reduce((a, s) => a + s.nodes.length, 0);
      const pct = Progress.getPct(u.id, totalN);
      const delay = i === 0 ? '' : `fade-in-delay-${Math.min(i, 3)}`;
      const displayTitle = u.id === 'iron'
        ? 'الحديد (Fe) وتفاعلاته'
        : u.title;
      return `
        <div class="glass-card unit-card fade-in ${delay}" data-action="open-unit" data-unit-id="${u.id}" style="border-color:${u.clr}30">
          <div class="unit-card-icon" style="background:${u.clr}15">${u.icon}</div>
          <div class="unit-card-body">
            <div class="unit-card-title" style="color:${u.clr}">${displayTitle}</div>
            <div class="unit-card-meta">${u.description}</div>
            <div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${u.clr}"></div></div>
          </div>
          <div class="unit-card-arrow">←</div>
        </div>`;
    }).join('');

    const unitsSection = `
      <section class="home-section-block fade-in fade-in-delay-1">
      <div class="section-label">ابدأ من الوحدات الرئيسية</div>
      <div class="home-section-subtitle">اختر الباب الذي تريد فهمه أو مراجعته</div>
      <div class="units-grid">${unitsHtml}</div>
      </section>
    `;

    return `
      <div class="home-stack">
        ${hero}
        ${unitsSection}
        ${studySection}
        ${exploreSection}
        ${reviewSection}
      </div>
    `;
  },

  /* — UNIT — */
  unit(unit) {
    const sectionsHtml = unit.sections.map(s => `
      <div class="glass-card section-item fade-in" data-action="open-section" data-unit-id="${unit.id}" data-section-id="${s.id}" style="border-color:${unit.clr}25">
        <div class="section-dot" style="background:${unit.clr}"></div>
        <div class="section-item-title">${s.title}</div>
        <div class="section-item-count">${s.nodes.length} موضوع ←</div>
      </div>`).join('');

    return `
      <div class="breadcrumb">
        <span data-action="tab" data-tab="home">🏠 الرئيسية</span>
        <span class="breadcrumb-sep">←</span>
        <span style="color:${unit.clr}">${unit.icon} ${unit.title}</span>
      </div>
      <div class="section-list">${sectionsHtml}</div>`;
  },

  /* — SECTION — */
  section(unit, sec) {
    const html = sec.nodes.map(node => this._renderNode(unit, node)).join('');
    return `
      <div class="breadcrumb">
        <span data-action="tab" data-tab="home">🏠</span>
        <span class="breadcrumb-sep">←</span>
        <span data-action="open-unit" data-unit-id="${unit.id}" style="color:${unit.clr}">${unit.title}</span>
        <span class="breadcrumb-sep">←</span>
        <span>${sec.title}</span>
      </div>
      ${html}`;
  },

  _renderNode(unit, node) {
    /* TABLE */
    if (node.isTable && node.tableData) {
      const td = node.tableData;
      return `
        <div class="glass-card compare-block fade-in" style="padding:14px;margin-bottom:10px;border-color:${(node.clr||unit.clr)}25">
          <h4 style="color:${node.clr||unit.clr};margin-bottom:10px;font-size:13px">${node.title}</h4>
          <div class="table-scroll">
            <table class="chem-table">
              <tr>${td.headers.map(h => `<th style="color:${node.clr||unit.clr}">${h}</th>`).join('')}</tr>
              ${td.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
            </table>
          </div>
        </div>`;
    }

    /* EXPECTED QUESTIONS */
    if (node.isExpected) {
      return `
        <div class="expected-block fade-in">
          <div class="expected-header">❓ ${node.title}</div>
          ${node.items.map((q, i) => `
            <div class="expected-item">
              <span class="expected-num">س${i+1}</span>
              <span>${q}</span>
            </div>`).join('')}
        </div>`;
    }

    /* PATHWAY */
    if (node.isPathway && node.pathway) {
      const w = document.getElementById('view')?.clientWidth || 320;
      const svgHtml = MindMap.renderPathwaySVG(node.pathway, w - 28);
      return `
        <div class="glass-card fade-in" style="padding:12px;margin-bottom:8px;border-color:${(node.clr||unit.clr)}25">
          <div class="node-title" style="color:${node.clr||unit.clr};margin-bottom:10px;font-size:13px;font-weight:800">${node.title}</div>
          <div class="pathway-scroll">${svgHtml}</div>
        </div>`;
    }

    /* ACCORDION NODE */
    const clr = node.clr || unit.clr;
    const nid = node.id;
    const itemsHtml = (node.items || []).map(item => ItemParser.render(item)).join('');

    return `
      <div class="node-wrap fade-in">
        <div class="node-header" id="nh_${nid}" data-action="toggle-node" data-node-id="${nid}" data-unit-id="${unit.id}"
          style="border-color:${clr}35">
          <div class="node-title" style="color:${clr}">${node.title}</div>
          <span class="node-count">${(node.items||[]).length}</span>
          <span class="node-chevron">▼</span>
        </div>
        <div class="node-body" id="nb_${nid}" style="border-color:${clr}25;background:${clr}08">
          ${itemsHtml}
          ${this._bondDemo(node)}
        </div>
      </div>`;
  },

  _bondDemo(node) {
    if (node.id === 'ethene_rxns') {
      return '';
    }
    if (node.id === 'ethyne_rxns') {
      return `<div class="bond-demo" style="margin-top:12px">
        <div class="bond-demo-label">🔬 الرابطة الثلاثية</div>
        ${MindMap.bondFormationSVG('alkyne_triple')}
      </div>`;
    }
    return '';
  },

  /* — ORGANIC TAB (special visual) — */
  organic(section = '') {
    const C = ChemFormat;
    const eqArrow = '<span class="chem-equation-arrow">→</span>';
    const revArrow = '<span class="chem-equation-arrow">⇌</span>';
    const shuffle = (arr) => {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = out[i];
        out[i] = out[j];
        out[j] = t;
      }
      return out;
    };
    const organic = OrganicData.build(C, eqArrow, revArrow, shuffle);
    const {
      families,
      groups,
      functionalGroups,
      generalFormulas,
      conversions,
      reactions,
      oxidationReduction,
      c2Path,
      c2Arrows,
      reagents,
      comparisons,
      comparisonTables,
      aromaticCompounds,
      preparationMethods,
      practicalTests,
      aromaticGuide,
      polymers,
      commonMistakes,
      quickFacts,
      lessons,
      reagentChoices,
    } = organic;

    const currentSection = ((section || '') + '').trim();
    const sectionMeta = [
      { key: 'families', title: 'العائلات العضوية', desc: 'تصنيف العائلات والصيغ العامة وأمثلة سريعة.' },
      { key: 'general-formulas', title: 'الصيغ العامة', desc: 'الصيغ العامة للعائلات وكيفية قراءتها.' },
      { key: 'functional-groups', title: 'المجموعات الوظيفية', desc: 'المجموعة الفعالة وأثرها على التفاعل.' },
      { key: 'reactions', title: 'التحويلات والتفاعلات', desc: 'خرائط التحويل ومسار C₂ وتفاعلات أساسية.' },
      { key: 'aromatics', title: 'مشتقات البنزين', desc: 'مركبات أروماتية وتوجيه الحلقة.' },
      { key: 'tests', title: 'التمييز العملي', desc: 'طرق التمييز والمقارنات الامتحانية.' },
      { key: 'polymers', title: 'البلمرة', desc: 'معلومات البلمرة والاستخدامات الشائعة.' },
      { key: 'redox', title: 'قابلية الأكسدة والاختزال', desc: 'ما يُؤكسد وما يُختزل مع أمثلة.' },
      { key: 'reagents', title: 'الكواشف والشروط', desc: 'الكاشف المناسب والشرط المتوقع.' },
      { key: 'mistakes', title: 'أخطاء شائعة', desc: 'أخطاء متكررة وحقائق سريعة للمراجعة.' },
      { key: 'practice', title: 'تدريب سريع', desc: 'أنشطة تفاعلية قصيرة للتثبيت.' },
    ];

    const header = (title, desc) => `
      <section class="organic-section organic-subheader">
        <div class="organic-subheader-row">
          <div>
            <h2 class="organic-section-title">${title}</h2>
            <p class="organic-section-sub">${desc}</p>
          </div>
          <button class="organic-chip-btn organic-back-btn" data-action="go-hash" data-hash="#organic">العودة لفهرس العضوية</button>
        </div>
      </section>
    `;

    const blocks = {
      'families': `
        <section class="organic-section">
          <h2 class="organic-section-title">العائلات العضوية</h2>
          <div class="organic-group-grid">
            ${families.map(f => `
              <article class="organic-group-card">
                <h3>${f.title}</h3>
                <div class="chem-formula">${f.formula}</div>
                <p><strong>الفرع:</strong> ${f.branch}</p>
                <p>${f.notes}</p>
                <p><strong>أمثلة:</strong> ${f.samples.map(s => `<span class="chem-formula">${s}</span>`).join('، ')}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'general-formulas': `
        <section class="organic-section">
          <h2 class="organic-section-title">الصيغ العامة</h2>
          <div class="organic-group-grid">
            ${generalFormulas.map(g => `
              <article class="organic-group-card">
                <h3>${g.family}</h3>
                <div class="chem-formula">${g.formula}</div>
                <p>${g.note}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'functional-groups': `
        <section class="organic-section">
          <h2 class="organic-section-title">المجموعات الوظيفية</h2>
          <div class="organic-group-grid">
            ${groups.map(g => `
              <article class="organic-group-card">
                <h3>${g.name}</h3>
                <div class="chem-formula">${g.formula}</div>
                <p><strong>مثال:</strong> <span class="chem-formula">${g.example}</span></p>
                <p><strong>أهم تفاعل:</strong> ${g.key}</p>
                <p><strong>خطأ شائع:</strong> ${g.trap}</p>
              </article>
            `).join('')}
          </div>
        </section>
        <section class="organic-section">
          <h2 class="organic-section-title">المجموعات الفعالة</h2>
          <div class="organic-group-grid">
            ${functionalGroups.map(g => `
              <article class="organic-group-card">
                <h3>${g.name}</h3>
                <div class="chem-formula">${g.symbol}</div>
                <p><strong>توجد في:</strong> ${g.presentIn}</p>
                <p><strong>الأكسدة/الاختزال:</strong> ${g.oxidation}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'reactions': `
        <section class="organic-section">
          <h2 class="organic-section-title">خريطة التحويلات العضوية</h2>
          <div class="organic-flow-map">
            ${conversions.map(c => `
              <article class="organic-flow-card">
                <div class="chem-equation"><span class="chem-formula">${c.from}</span> ${eqArrow} <span class="chem-formula">${c.to}</span></div>
                <div class="organic-flow-arrow">
                  <span><strong>الكاشف:</strong> <span class="chem-formula">${c.reagent}</span></span>
                  <span><strong>الشرط:</strong> ${c.condition}</span>
                  <span><strong>النوع:</strong> ${c.type}</span>
                </div>
                <p class="organic-trap"><strong>فخ شائع:</strong> ${c.trap}</p>
              </article>
            `).join('')}
          </div>
        </section>
        <section class="organic-section">
          <h2 class="organic-section-title">التحويلات والتفاعلات</h2>
          <div class="organic-group-grid">
            ${reactions.map(r => `
              <article class="organic-step-card">
                <h3>${r.title}</h3>
                <div class="chem-equation">${r.equation}</div>
                <p><strong>نوع التفاعل:</strong> ${r.type}</p>
                <p><strong>الشرط:</strong> ${r.condition}</p>
              </article>
            `).join('')}
          </div>
        </section>
        <section class="organic-section">
          <h2 class="organic-section-title">مسار C₂ التعليمي</h2>
          <div class="organic-c2-path">
            ${c2Path.map((node, idx) => `
              <article class="organic-flow-card">
                <div class="chem-formula">${node.formula}</div>
                <h3>${node.name}</h3>
                <p><strong>العائلة:</strong> ${node.family}</p>
                <p>${node.note}</p>
              </article>
              ${idx < c2Arrows.length ? `
                <div class="organic-flow-arrow">
                  <span class="chem-equation-arrow">↓</span>
                  <span><strong>الكاشف:</strong> <span class="chem-formula">${c2Arrows[idx].reagent}</span></span>
                  <span><strong>الشرط:</strong> ${c2Arrows[idx].condition}</span>
                  <span><strong>النوع:</strong> ${c2Arrows[idx].type}</span>
                </div>
              ` : ''}
            `).join('')}
          </div>
        </section>
        <section class="organic-section">
          <h2 class="organic-section-title">تفاعلات بشرح مرئي</h2>
          <div class="organic-lessons">
            ${lessons.map(lesson => `
              <article class="organic-step-card">
                <h3>${lesson.title}</h3>
                <div class="chem-equation">${lesson.equation}</div>
                <p><strong>الكاشف/الشرط:</strong> <span class="chem-formula">${lesson.reagent}</span></p>
                <div class="organic-steps-list">
                  ${lesson.steps.map(st => `
                    <div class="organic-step-item">
                      <h4>${st.t}</h4>
                      <p>${st.d}</p>
                      <p><strong>ماذا يتغير؟</strong> ${st.ch}</p>
                    </div>
                  `).join('')}
                </div>
                <p class="organic-trap"><strong>خطأ شائع:</strong> ${lesson.trap}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'aromatics': `
        <section class="organic-section">
          <h2 class="organic-section-title">مشتقات البنزين</h2>
          <div class="organic-group-grid">
            ${aromaticCompounds.map(item => `
              <article class="organic-group-card">
                <h3>${item.name}</h3>
                <div class="chem-formula">${item.formula}</div>
                <p>${item.note}</p>
              </article>
            `).join('')}
          </div>
          <div class="organic-note-card">
            <h3>المجموعات الموجهة (ملخص)</h3>
            <ul>
              ${aromaticGuide.map(item => `<li><strong>${item.name}</strong>: ${item.note}</li>`).join('')}
            </ul>
          </div>
        </section>
      `,
      'tests': `
        <section class="organic-section">
          <h2 class="organic-section-title">التمييز العملي</h2>
          <div class="organic-group-grid">
            ${practicalTests.map(test => `
              <article class="organic-step-card">
                <h3>${test.title}</h3>
                ${test.rows.map(row => `
                  <div class="organic-note-card" style="margin-top:8px">
                    <p><strong>طريقة التمييز:</strong> ${row.test}</p>
                    ${row.alcohol ? `<p><strong>الكحول:</strong> ${row.alcohol}</p>` : ''}
                    ${row.ether ? `<p><strong>الإيثر:</strong> ${row.ether}</p>` : ''}
                    ${row.first ? `<p><strong>الأول:</strong> ${row.first}</p>` : ''}
                    ${row.second ? `<p><strong>الثاني:</strong> ${row.second}</p>` : ''}
                    ${row.third ? `<p><strong>الثالث:</strong> ${row.third}</p>` : ''}
                  </div>
                `).join('')}
              </article>
            `).join('')}
          </div>
        </section>
        <section class="organic-section">
          <h2 class="organic-section-title">المقارنات المهمة</h2>
          <div class="organic-group-grid">
            ${(comparisonTables || comparisons).map(cmp => `
              <article class="organic-comparison-card">
                <h3>${cmp.title}</h3>
                <p><strong>الفرق الأساسي:</strong> ${cmp.diff}</p>
                <p><strong>اختبار/دليل:</strong> ${cmp.test}</p>
                <p><strong>مثال:</strong> <span class="chem-formula">${cmp.example}</span></p>
                <p><strong>فخ امتحاني:</strong> ${cmp.trap}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'polymers': `
        <section class="organic-section">
          <h2 class="organic-section-title">البلمرة</h2>
          <div class="organic-group-grid">
            ${polymers.map(p => `
              <article class="organic-reagent-card">
                <h3>${p.polymer}</h3>
                <p><strong>المونومر:</strong> ${p.monomer}</p>
                <p><strong>النوع:</strong> ${p.type}</p>
                <p><strong>الاستخدامات:</strong> ${p.uses}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'redox': `
        <section class="organic-section">
          <h2 class="organic-section-title">قابلية الأكسدة والاختزال</h2>
          <div class="organic-group-grid">
            ${oxidationReduction.map(item => `
              <article class="organic-comparison-card">
                <h3>${item.species}</h3>
                <p><strong>الأكسدة:</strong> ${item.oxidation}</p>
                <p><strong>الاختزال:</strong> ${item.reduction}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'reagents': `
        <section class="organic-section">
          <h2 class="organic-section-title">الكواشف والشروط</h2>
          <div class="organic-group-grid">
            ${reagents.map(r => `
              <article class="organic-reagent-card">
                <h3 class="chem-formula">${r.name}</h3>
                <p><strong>يستخدم في:</strong> ${r.use}</p>
                <p><strong>الشرط:</strong> ${r.condition}</p>
                <p><strong>الناتج المتوقع:</strong> ${r.expected}</p>
                <p><strong>خطأ شائع:</strong> ${r.trap}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `,
      'mistakes': `
        <section class="organic-section">
          <h2 class="organic-section-title">أخطاء شائعة</h2>
          <div class="organic-note-card">
            <ul>
              ${commonMistakes.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
        </section>
        <section class="organic-section">
          <h2 class="organic-section-title">حقائق سريعة</h2>
          <div class="organic-note-card">
            <ul>
              ${quickFacts.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        </section>
      `,
      'practice': `
        <section class="organic-section">
          <h2 class="organic-section-title">تدريب سريع</h2>
          <div class="organic-activity-card" data-activity="seq1" data-correct="a,b,c,d">
            <h3>رتّب خطوات التحويل</h3>
            <p>حوّل <span class="chem-formula">${C.formula('C2H4')}</span> إلى <span class="chem-formula">${C.formula('CH3COOH')}</span>.</p>
            <div class="organic-grid-2">
              <button class="organic-chip-btn" data-action="organic-seq-toggle" data-step-key="a">إضافة ماء (${C.formula('H2O/H2SO4')})</button>
              <button class="organic-chip-btn" data-action="organic-seq-toggle" data-step-key="c">أكسدة أولى (${C.formula('K2Cr2O7')})</button>
              <button class="organic-chip-btn" data-action="organic-seq-toggle" data-step-key="b">تكوين ${C.formula('C2H5OH')}</button>
              <button class="organic-chip-btn" data-action="organic-seq-toggle" data-step-key="d">أكسدة ثانية إلى الحمض</button>
            </div>
            <div class="organic-activity-actions">
              <button class="organic-chip-btn" data-action="organic-seq-check">تحقق</button>
              <button class="organic-chip-btn" data-action="organic-seq-reset">إعادة</button>
            </div>
            <p class="organic-activity-feedback" data-organic-feedback="seq1">اختر الترتيب ثم اضغط تحقق.</p>
            <p class="organic-activity-feedback muted" data-organic-selected="seq1"></p>
          </div>

          <div class="organic-activity-card" data-activity="reagent1" data-correct="b">
            <h3>اختر الكاشف المناسب</h3>
            <p>التحويل: <span class="chem-formula">${C.formula('C2H4')}</span> ${eqArrow} <span class="chem-formula">${C.formula('C2H5OH')}</span></p>
            <div class="organic-grid-2">
              ${reagentChoices.map(ch => `<button class="organic-chip-btn" data-action="organic-reagent-select" data-choice-key="${ch.key}">${ch.label}</button>`).join('')}
            </div>
            <div class="organic-activity-actions">
              <button class="organic-chip-btn" data-action="organic-reagent-check">تأكيد الإجابة</button>
              <button class="organic-chip-btn" data-action="organic-reagent-reset">إعادة</button>
            </div>
            <p class="organic-activity-feedback" data-organic-feedback="reagent1">اختر كاشفًا ثم أكد الإجابة.</p>
          </div>
        </section>
      `,
    };

    if (!currentSection) {
      return `
        <div class="organic-page">
          <section class="organic-section">
            <h2 class="organic-section-title">فهرس الكيمياء العضوية</h2>
            <p class="organic-section-sub">اختر جزئية واحدة للدراسة في كل مرة لعرض مركز وواضح على الموبايل.</p>
            <div class="organic-index-grid">
              ${sectionMeta.map(item => `
                <button class="organic-index-card" data-action="go-hash" data-hash="#organic/${item.key}">
                  <span class="organic-index-title">${item.title}</span>
                  <span class="organic-index-desc">${item.desc}</span>
                </button>
              `).join('')}
            </div>
          </section>
        </div>
      `;
    }

    const meta = sectionMeta.find(x => x.key === currentSection);
    if (!meta || !blocks[currentSection]) {
      return `
        <div class="organic-page">
          <section class="organic-section">
            <h2 class="organic-section-title">هذه الجزئية غير متاحة</h2>
            <p class="organic-section-sub">الرجاء العودة لفهرس العضوية واختيار جزئية من القائمة.</p>
            <button class="organic-chip-btn organic-back-btn" data-action="go-hash" data-hash="#organic">العودة لفهرس العضوية</button>
          </section>
        </div>
      `;
    }

    return `
      <div class="organic-page">
        ${header(meta.title, meta.desc)}
        ${blocks[currentSection]}
      </div>
    `;
  },

  periodic(S) {
    return PeriodicTable.render(S || {});
  },

  examCenterBlocked() {
    return `
      <div class="section-label">مركز الامتحانات</div>
      <div class="glass-card exam-blocked-card fade-in">
        <div class="exam-blocked-title">مركز الامتحانات قيد التطوير</div>
        <div class="exam-blocked-text">نعمل على بناء مركز تدريبي يضم أسئلة من النماذج الاسترشادية وامتحانات الأعوام السابقة في الكيمياء، مع مراجعة الإجابات وتحليل الأخطاء.</div>
        <div class="exam-blocked-text">سيتم تفعيله بعد الأنتهاء من تحليل الأسئلة والإجابات للنماذج والتأكد من دقتها قبل إتاحتها للطلاب.</div>
        <button class="btn-primary" data-action="go-hash" data-hash="#home">العودة للرئيسية</button>
      </div>
    `;
  },

  examCenter(model = {}) {
    const summary = model.analyticsSummary || { attempted: 0, accuracy: 0 };
    const sourceFiles = model.sourceFiles || [];
    const officialList = model.officialList || [];
    const mistakes = model.mistakes || [];

    const cardButtons = (model.cards || []).map(card => `
      <button class="exam-card-btn" data-action="go-hash" data-hash="${card.hash}">
        <div class="exam-card-title">${card.title}</div>
        <div class="exam-card-desc">${card.desc}</div>
      </button>
    `).join('');

    const sourceCount = sourceFiles.length;
    const unreadablePagesCount = sourceFiles.reduce((acc, f) => acc + ((f.unreadablePages || []).length), 0);

    return `
      <div class="section-label">مركز الامتحانات</div>

      <div class="glass-card exam-center-head fade-in">
        <div class="exam-center-title">مركز الامتحانات</div>
        <div class="exam-center-subtitle">تدريب امتحاني منظم: أسئلة رسمية وممارسة آمنة مع تتبع أخطائك.</div>
        <div class="exam-source-meta" style="margin:0 0 8px 0;border:1px solid var(--border);border-radius:8px;padding:6px 8px;background:rgba(255,255,255,0.03)">
          تنبيه: تم تحميل ${sourceCount} ملف مصدر • صفحات غير مقروءة: ${unreadablePagesCount}
        </div>
        <div class="exam-center-stats">
          <div class="exam-stat-box">
            <div class="exam-stat-value">${model.totalQuestions || 0}</div>
            <div class="exam-stat-label">إجمالي الأسئلة</div>
          </div>
          <div class="exam-stat-box">
            <div class="exam-stat-value">${model.officialQuestions || 0}</div>
            <div class="exam-stat-label">أسئلة رسمية</div>
          </div>
          <div class="exam-stat-box">
            <div class="exam-stat-value">${model.syntheticQuestions || 0}</div>
            <div class="exam-stat-label">أسئلة تدريبية</div>
          </div>
        </div>
        <div class="exam-center-stats" style="margin-top:6px">
          <div class="exam-stat-box">
            <div class="exam-stat-value">${model.safeAutoGraded || 0}</div>
            <div class="exam-stat-label">أسئلة آمنة للتصحيح</div>
          </div>
          <div class="exam-stat-box">
            <div class="exam-stat-value">${model.needsManualReview || 0}</div>
            <div class="exam-stat-label">أسئلة تحتاج مراجعة</div>
          </div>
          <div class="exam-stat-box">
            <div class="exam-stat-value">${model.readiness || 0}%</div>
            <div class="exam-stat-label">نسبة الجاهزية</div>
          </div>
        </div>
        <div class="exam-source-meta" style="margin-top:8px">محاولاتك المسجلة: ${summary.attempted || 0} • دقة الحل: ${summary.accuracy || 0}% • أخطاء شائعة: ${mistakes.length}</div>
      </div>

      <div class="exam-center-grid fade-in">
        ${cardButtons}
      </div>

      ${model.loading ? '<div class="glass-card laws-empty">جاري تحميل بيانات الامتحانات...</div>' : ''}
      ${model.error ? `<div class="glass-card laws-empty">${model.error}</div>` : ''}

      <div class="section-label">نماذج الوزارة 2026 (عرض سريع)</div>
      <div class="exam-list fade-in">
        ${officialList.map(q => `
          <article class="exam-question-row">
            <div class="exam-question-meta">
              <span class="exam-badge">سؤال رسمي</span>
              <span class="exam-badge">${q.chapter}</span>
              <span class="exam-badge">${q.difficulty}</span>
              ${q.needsManualReview ? '<span class="exam-badge">يحتاج مراجعة</span>' : ''}
            </div>
            <div class="exam-question-text">${q.displayQuestion || q.question}</div>
            <button class="exam-open-btn" data-action="open-question" data-question-id="${q.id}">فتح السؤال</button>
          </article>
        `).join('')}
      </div>
    `;
  },

  examTraining(model = {}) {
    const chapters = model.chapters || [];
    const skills = model.skills || [];
    const difficulties = model.difficulties || [];
    const traps = model.traps || [];

    return `
      <div class="section-label">تدريب حسب الباب</div>

      <div class="glass-card exam-training-head fade-in">
        <div class="exam-center-title">اختر باب التدريب</div>
        <div class="exam-center-subtitle">يتم عرض الأسئلة الآمنة للتصحيح فقط.</div>
      </div>

      <div class="exam-chip-row fade-in">
        ${chapters.map(ch => `
          <button class="exam-chip ${model.chapter === ch.key ? 'active' : ''}" data-action="exam-open-chapter" data-chapter="${ch.key}">${ch.label}</button>
        `).join('')}
      </div>

      <div class="glass-card exam-filter-card fade-in">
        <div class="exam-filter-grid">
          <label>المهارة
            <select data-action="exam-filter-input" data-filter-key="skill">
              <option value="">الكل</option>
              ${skills.map(s => `<option value="${s}" ${model.selectedSkill === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </label>
          <label>الصعوبة
            <select data-action="exam-filter-input" data-filter-key="difficulty">
              <option value="">الكل</option>
              ${difficulties.map(d => `<option value="${d}" ${model.selectedDifficulty === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </label>
          <label>نوع الفخ
            <select data-action="exam-filter-input" data-filter-key="trap">
              <option value="">الكل</option>
              ${traps.map(t => `<option value="${t}" ${model.selectedTrap === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="exam-filter-actions">
          <button class="exam-open-btn" data-action="exam-clear-filters">مسح الفلاتر</button>
          <button class="qp-confirm-btn" data-action="exam-start-training">ابدأ التدريب (${model.matchedCount || 0})</button>
        </div>
      </div>

      <div class="glass-card laws-empty">إجمالي الأسئلة المتاحة للتدريب: ${model.matchedCount || 0} سؤال</div>
    `;
  },

  examWorkedExamples(model = {}) {
    const items = model.items || [];
    const focusedId = model.focusedId || '';
    return `
      <div class="section-label">أمثلة محلولة</div>
      <div class="exam-list fade-in">
        ${items.map(ex => `
          <article class="glass-card exam-worked-card ${focusedId === ex.id ? 'is-focused' : ''}">
            <div class="exam-question-meta">
              <span class="exam-badge">${ex.topic || 'عام'}</span>
              <span class="exam-badge">${ex.id}</span>
            </div>
            <div class="exam-worked-title">${ex.title}</div>
            <div class="exam-worked-q">${ex.question}</div>
            <div class="exam-worked-given">${(ex.given || []).join(' • ')}</div>
            <div class="qp-example-steps">
              ${(ex.steps || []).map((st, i) => `<div class="qp-example-step">${i + 1}) ${st}</div>`).join('')}
            </div>
            <div class="exam-worked-final">الإجابة النهائية: <span class="formula-ltr">${ex.finalAnswer || ''}</span></div>
            <div class="exam-worked-final">فحص سريع: ${ex.sanityCheck || ''}</div>
            <div class="exam-worked-final">خطأ شائع: ${ex.commonMistake || ''}</div>
            <div class="qp-actions">
              ${(ex.lawRefs || []).map(ref => `<button class="qp-law-btn" data-action="exam-review-law" data-law-ref="${ref}">مراجعة القانون: <span class="formula-ltr">${ref}</span></button>`).join('')}
              ${(ex.relatedQuestionIds || []).slice(0, 2).map(id => `<button class="exam-open-btn" data-action="open-question" data-question-id="${id}">فتح سؤال مرتبط</button>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    `;
  },

  examMistakes(model = {}) {
    const items = model.mistakes || [];
    return `
      <div class="section-label">أخطائي الشائعة</div>
      <div class="exam-list fade-in">
        ${items.map(m => `
          <article class="exam-question-row">
            <div class="exam-question-meta">
              <span class="exam-badge">${m.chapter || 'غير محدد'}</span>
              <span class="exam-badge">${m.topic || 'عام'}</span>
              <span class="exam-badge">التكرار: ${m.count || 1}</span>
            </div>
            <div class="exam-question-text">السؤال ${m.questionId}${m.questionText ? ` • ${m.questionText}` : ''}</div>
            <div class="qp-actions">
              <button class="exam-open-btn" data-action="exam-retry-mistake" data-question-id="${m.questionId}">إعادة المحاولة</button>
              ${(m.lawRefs || []).slice(0, 1).map(ref => `<button class="qp-law-btn" data-action="exam-review-law" data-law-ref="${ref}">مراجعة القانون</button>`).join('')}
              ${m.workedExampleRef ? `<button class="exam-open-btn" data-action="exam-open-related-worked" data-example-id="${m.workedExampleRef}">مثال محلول مرتبط</button>` : ''}
              ${((m.trapTags || [])[0]) ? `<button class="qp-law-btn" data-action="go-hash" data-hash="#exam-training">تدريب على نفس الفخ</button>` : ''}
            </div>
          </article>
        `).join('')}
        ${items.length === 0 ? '<div class="glass-card laws-empty">لا توجد أخطاء مسجلة بعد.</div>' : ''}
      </div>
    `;
  },

  examAnalytics(model = {}) {
    const s = model.summary || { attempted: 0, correct: 0, accuracy: 0 };
    const recent = model.recent || [];
    return `
      <div class="section-label">إحصائياتي</div>
      <div class="glass-card exam-center-head fade-in">
        <div class="exam-center-title">ملخص الأداء</div>
        <div class="exam-center-stats">
          <div class="exam-stat-box"><div class="exam-stat-value">${s.attempted || 0}</div><div class="exam-stat-label">إجمالي المحاولات</div></div>
          <div class="exam-stat-box"><div class="exam-stat-value">${s.accuracy || 0}%</div><div class="exam-stat-label">الدقة</div></div>
          <div class="exam-stat-box"><div class="exam-stat-value">${s.averageTimeSec || 0}s</div><div class="exam-stat-label">متوسط الزمن</div></div>
        </div>
        <div class="exam-analytics-kpis">
          <div>أضعف باب: ${s.weakestChapter || 'لا توجد بيانات كافية'}</div>
          <div>أكثر فخ متكرر: ${s.mostCommonTrap || 'لا توجد بيانات كافية'}</div>
          <div>التوصية: ${s.weakestChapter ? `ابدأ تدريبًا مركزًا على ${s.weakestChapter}` : 'أجب عن 10 أسئلة إضافية لإظهار توصية أدق.'}</div>
        </div>
      </div>

      <div class="section-label">آخر المحاولات</div>
      <div class="exam-list fade-in">
        ${recent.map(r => `
          <div class="exam-question-row">
            <div class="exam-question-meta">
              <span class="exam-badge">${r.chapter || 'غير محدد'}</span>
              <span class="exam-badge">${r.topic || 'عام'}</span>
              <span class="exam-badge">${r.correct ? 'صحيح' : 'خطأ'}</span>
            </div>
            <div class="exam-question-text">${r.questionId} • الزمن: ${r.timeSpentSec || '-'} ثانية</div>
          </div>
        `).join('')}
        ${recent.length === 0 ? '<div class="glass-card laws-empty">لا توجد محاولات مسجلة بعد.</div>' : ''}
      </div>
    `;
  },

  examMockResult(model = {}) {
    const s = model.summary || { attempted: 0, correct: 0, accuracy: 0 };
    return `
      <div class="section-label">نتيجة الامتحان</div>
      <div class="glass-card exam-center-head fade-in">
        <div class="exam-center-title">ملخص الامتحان التجريبي</div>
        <div class="exam-center-stats">
          <div class="exam-stat-box"><div class="exam-stat-value">${s.attempted || 0}</div><div class="exam-stat-label">محاولات</div></div>
          <div class="exam-stat-box"><div class="exam-stat-value">${s.correct || 0}</div><div class="exam-stat-label">إجابات صحيحة</div></div>
          <div class="exam-stat-box"><div class="exam-stat-value">${s.accuracy || 0}%</div><div class="exam-stat-label">الدقة</div></div>
        </div>
        ${model.note ? `<div class="laws-empty" style="margin-top:8px">${model.note}</div>` : ''}
        <div class="qp-actions" style="margin-top:10px">
          <button class="exam-open-btn" data-action="go-hash" data-hash="#exam-mistakes">مراجعة الأخطاء الشائعة</button>
          <button class="exam-open-btn" data-action="go-hash" data-hash="#exam-center">العودة إلى مركز الامتحانات</button>
        </div>
      </div>
    `;
  },

  renderQuestionVisualAid(aid) {
    if (!aid || typeof aid !== 'object') return '';

    const type = String(aid.type || '').toLowerCase();
    if (!type) return '';

    if (type === 'image') {
      const src = String(aid.imageUrl || '').trim();
      if (!src) return '';
      return `
        <section class="qp-aid-card">
          <div class="qp-aid-title">${aid.titleAr || 'معطيات السؤال'}</div>
          <img class="qp-aid-image" src="${src}" alt="${aid.altAr || 'صورة توضيحية'}" loading="lazy">
        </section>
      `;
    }

    if (type === 'table') {
      const headers = Array.isArray(aid.headers) ? aid.headers : [];
      const rows = Array.isArray(aid.rows) ? aid.rows : [];
      if (!rows.length) return '';
      return `
        <section class="qp-aid-card">
          <div class="qp-aid-title">${aid.titleAr || 'جدول المعطيات'}</div>
          <div class="qp-aid-table-wrap">
            <table class="qp-aid-table">
              ${headers.length ? `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>` : ''}
              ${rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </table>
          </div>
        </section>
      `;
    }

    if (type === 'line-chart-equilibrium') {
      const chartW = 300;
      const chartH = 170;
      const m = 28;
      const xMax = 10;
      const yMax = 10;
      const series = Array.isArray(aid.series) ? aid.series : [];
      const toPoint = (p) => {
        const xVal = Number(p?.x || 0);
        const yVal = Number(p?.y || 0);
        const x = m + ((Math.max(0, Math.min(xMax, xVal)) / xMax) * (chartW - (m * 2)));
        const y = chartH - m - ((Math.max(0, Math.min(yMax, yVal)) / yMax) * (chartH - (m * 2)));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      };
      const lines = series.map(s => {
        const points = (Array.isArray(s.points) ? s.points : []).map(toPoint).join(' ');
        return `<polyline class="qp-aid-line" points="${points}" stroke="${s.color || '#8fb3ff'}" />`;
      }).join('');
      const legends = series.map(s => `
        <span class="qp-aid-legend-item">
          <span class="qp-aid-legend-dot" style="background:${s.color || '#8fb3ff'}"></span>
          <span>${s.name || ''}</span>
        </span>
      `).join('');
      const eqTime = Number(aid.equilibriumTime);
      const eqX = Number.isFinite(eqTime) ? (m + ((Math.max(0, Math.min(xMax, eqTime)) / xMax) * (chartW - (m * 2)))) : null;
      return `
        <section class="qp-aid-card">
          <div class="qp-aid-title">${aid.titleAr || 'منحنى السؤال'}</div>
          <svg class="qp-aid-chart" viewBox="0 0 ${chartW} ${chartH}" xmlns="http://www.w3.org/2000/svg" aria-label="${aid.titleAr || 'منحنى'}">
            <line x1="${m}" y1="${m}" x2="${m}" y2="${chartH - m}" class="qp-aid-axis" />
            <line x1="${m}" y1="${chartH - m}" x2="${chartW - m}" y2="${chartH - m}" class="qp-aid-axis" />
            <line x1="${m}" y1="${chartH - m - ((chartH - (m * 2)) * 0.4)}" x2="${chartW - m}" y2="${chartH - m - ((chartH - (m * 2)) * 0.4)}" class="qp-aid-grid" />
            <line x1="${m}" y1="${chartH - m - ((chartH - (m * 2)) * 0.6)}" x2="${chartW - m}" y2="${chartH - m - ((chartH - (m * 2)) * 0.6)}" class="qp-aid-grid" />
            ${eqX !== null ? `<line x1="${eqX}" y1="${m}" x2="${eqX}" y2="${chartH - m}" class="qp-aid-eq-line" />` : ''}
            ${lines}
            <text x="${chartW - m}" y="${chartH - 8}" text-anchor="end" class="qp-aid-label">${aid.xLabelAr || 'الزمن'}</text>
            <text x="${8}" y="${m - 8}" class="qp-aid-label">${aid.yLabelAr || 'التركيز'}</text>
            ${eqX !== null ? `<text x="${eqX + 4}" y="${m + 10}" class="qp-aid-eq-text">منطقة الاتزان</text>` : ''}
          </svg>
          <div class="qp-aid-legend">${legends}</div>
          <div class="qp-aid-note">${aid.captionAr || 'معطيات بصرية مساعدة لفهم السؤال.'}</div>
        </section>
      `;
    }

    return '';
  },

  questionPlayer(vm) {
    if (!vm) {
      return '<div class="glass-card laws-empty">لا توجد بيانات سؤال متاحة.</div>';
    }

    const canConfirm = vm.selectedIndex >= 0 && !vm.confirmed;
    const sourceBadge = vm.sourceType === 'official'
      ? '<span class="search-kind-badge is-law">سؤال رسمي</span>'
      : '<span class="search-kind-badge is-worked-example">سؤال تدريبي</span>';

    let feedback = '';
    if (vm.confirmed) {
      if (!vm.canGrade) {
        feedback = '<div class="qp-feedback">هذا السؤال مستخرج من نموذج رسمي، لكنه يحتاج مراجعة قبل التصحيح الآلي.</div>';
      } else {
        feedback = `<div class="qp-feedback ${vm.isCorrect ? 'ok' : 'bad'}">${vm.isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</div>`;
      }
    }

    const explanationBlock = vm.confirmed
      ? `<div class="qp-example">
          <div class="qp-example-title">شرح الإجابة</div>
          <div class="qp-example-summary">${vm.explanation || 'لا يوجد شرح متاح الآن.'}</div>
          ${(vm.trapTags || []).length ? `<div class="qp-example-step">فخ شائع: ${(vm.trapTags || []).join(' • ')}</div>` : ''}
         </div>`
      : '';

    const workedPrimary = vm.workedExample
      ? `<div class="qp-example">
          <div class="qp-example-title">مثال محلول مرتبط: ${vm.workedExample.title || ''}</div>
          <div class="qp-example-summary">${vm.workedExample.question || ''}</div>
          <div class="qp-example-steps">${(vm.workedExample.steps || []).map((st, i) => `<div class="qp-example-step">${i + 1}) ${st}</div>`).join('')}</div>
          <div class="exam-worked-final">الإجابة النهائية: <span class="formula-ltr">${vm.workedExample.finalAnswer || ''}</span></div>
        </div>`
      : '';

    const relatedWorked = (vm.relatedWorked || []).filter(ex => !vm.workedExample || ex.id !== vm.workedExample.id);
    const visualAid = this.renderQuestionVisualAid(vm.visualAid);

    return `
      <div class="qp-wrap">
        <div class="glass-card qp-head fade-in">
          <div class="qp-title">السؤال ${vm.questionNumber} من ${vm.totalQuestions}</div>
          <div class="qp-meta">
            ${sourceBadge}
            ${!vm.canGrade ? '<span class="search-kind-badge is-worked-example">إجابة غير مؤكدة</span>' : ''}
            <span>${vm.chapter}</span>
            <span>•</span>
            <span>${vm.topic}</span>
            <span>•</span>
            <span>${vm.skill}</span>
            <span>•</span>
            <span>${vm.difficulty}</span>
            <span>•</span>
            <span>${vm.marks} درجة</span>
          </div>
          <div class="exam-source-ref">المصدر: ${vm.sourceRef || 'غير محدد'}</div>
          ${vm.needsManualReview ? '<div class="qp-feedback" style="margin-top:8px">هذا السؤال مستخرج من نموذج رسمي، لكنه يحتاج مراجعة قبل التصحيح الآلي.</div>' : ''}
        </div>

        <article class="glass-card qp-question-card fade-in">
          <div class="qp-stem">${vm.displayQuestion || vm.question}</div>
          ${visualAid}
          <div class="qp-choice-list">
            ${vm.choices.map(choice => `
              <button class="qp-choice-btn ${choice.status}" data-action="exam-select-choice" data-choice-index="${choice.index}" ${vm.confirmed ? 'disabled' : ''}>${choice.text}</button>
            `).join('')}
          </div>

          <div class="qp-actions">
            <button class="qp-confirm-btn" data-action="exam-confirm-answer" ${canConfirm ? '' : 'disabled'}>${vm.canGrade ? 'تأكيد الإجابة' : 'تسجيل كمراجعة'}</button>
            ${(vm.lawRefs || []).map(ref => `<button class="qp-law-btn" data-action="exam-review-law" data-law-ref="${ref}">مراجعة القانون: <span class="formula-ltr">${ref}</span></button>`).join('')}
            ${vm.hasNext ? '<button class="exam-open-btn" data-action="exam-next-question">السؤال التالي</button>' : ''}
            <button class="exam-open-btn" data-action="exam-train-same-chapter">تدريب على نفس الباب</button>
            <button class="qp-back-btn" data-action="go-hash" data-hash="#exam-center">العودة إلى مركز الامتحانات</button>
          </div>
        </article>

        ${feedback}
        ${explanationBlock}
        ${workedPrimary}

        ${relatedWorked.map(ex => `
          <div class="qp-example">
            <div class="qp-example-title">مثال إضافي: ${ex.title}</div>
            <div class="qp-example-summary">${ex.question || ''}</div>
            <button class="exam-open-btn" data-action="exam-open-related-worked" data-example-id="${ex.id}">فتح المثال</button>
          </div>
        `).join('')}
      </div>
    `;
  },

  laws(S) {
    const state = S || { query: '', category: 'all', focusLawId: null };
    const q = state.query || '';
    const category = state.category || 'all';
    const laws = LawsData.filterLaws(q, category);
    const focusLawId = state.focusLawId || '';
    const categoryOrder = LawsData.categories.filter(c => c.key !== 'all');

    const categoryIntro = {
      'acids-bases': 'مفاهيم التأين والثوابت Ka وKb تساعدك على فهم قوة الحمض أو القاعدة بدل الحفظ المباشر.',
      'ph-poh': 'هذه العلاقات تربط بين تركيز +H و -OH وتحدد طبيعة المحلول بسرعة.',
      electrolysis: 'قوانين فاراداي تربط التيار والزمن بكمية الكهرباء ثم بالكتلة المترسبة.',
      ksp: 'حاصل الإذابة يحدد الذوبانية والترسيب من خلال المعادلة الأيونية الصحيحة.',
      'mass-percent': 'تحويلات بين كتلة العنصر وكتلة العينة لفهم تركيب المواد.',
      titration: 'علاقة المعايرة تستخدم عند نقطة التكافؤ لمقارنة مكافئات الحمض والقاعدة.',
      'electrochemical-cells': 'قوانين فرق الجهد توضح اتجاه التفاعل في الخلايا الجلفانية.',
      moles: 'قوانين المولات تربط بين الكتلة والحجم وعدد الجسيمات والتركيز المولاري.',
    };

    const lawGuides = {
      law_strong_weak_electrolytes: {
        formulas: [
          '[H+] = Cacid × n(H+)',
          '[H3O+] = α × Ca = √(Ka × Ca)',
          'Ka = α² × Ca',
          'α = √(Ka / Ca)',
          'Kb = α² × Cb',
          'Ka = (α² × Ca) / (1 - α)  عندما α > 5%',
        ],
        steps: [
          'اكتب المعطيات: نوع المادة (حمض/قاعدة) والتركيز.',
          'حدد هل المادة قوية أم ضعيفة من نص السؤال.',
          'اختر العلاقة المناسبة لـ Ka أو Kb أو α.',
          'عوّض بالقيم واحسب التركيز أو درجة التأين.',
          'راجع منطق الناتج: قيمة α يجب أن تكون أصغر من 1.',
        ],
        example: 'مثال سريع: حمض ضعيف تركيزه Ca = 0.1 M و Ka = 1×10^-5 ⇒ [H3O+] ≈ √(Ka×Ca).',
      },
      law_ph_poh_kw: {
        formulas: [
          'Kw = [H+] [OH-] = 10^-14',
          'pH + pOH = 14',
          'pH = -log[H3O+]',
          'pOH = -log[OH-]',
        ],
        steps: [
          'حدد المعطى: pH أو pOH أو تركيز H+ أو OH-.',
          'استخدم اللوغاريتم للتحويل بين pH والتركيز إذا لزم.',
          'استخدم العلاقة pH + pOH = 14 للحصول على القيمة المجهولة.',
          'حدد نوع المحلول من القيمة النهائية.',
          'تحقق أن الناتج ضمن المدى 0 إلى 14 في مسائل المنهج القياسية.',
        ],
        example: 'مثال سريع: إذا كان pH = 3.5 إذن pOH = 10.5 والمحلول حمضي.',
      },
      law_faraday_electrolysis: {
        formulas: [
          'Q = I × t',
          'Q / 96500 = m / Equivalent Mass',
          'Equivalent Mass = Atomic Mass / Z',
          'Density = Mass / Volume',
        ],
        steps: [
          'حوّل الزمن إلى ثانية أولًا.',
          'احسب كمية الكهرباء: Q = I×t.',
          'حوّل Q إلى مولات إلكترونات باستخدام 96500.',
          'اربط مولات الإلكترونات بالكتلة المترسبة أو الكثافة حسب المطلوب.',
          'اكتب الوحدة النهائية بوضوح: C أو g أو mol.',
        ],
        example: 'مثال سريع: تيار 2A لمدة 600s ⇒ Q = 1200 C ثم نستخدم علاقة فاراداي للكتلة.',
      },
      law_ksp_general: {
        formulas: [
          'Ksp = [A^b+]^a [B^a-]^b',
          'أحادي + أحادي: Ksp = x²',
          'أحادي + ثنائي: Ksp = 4x³',
          'ثلاثي + أحادي: Ksp = 27x⁴',
          'ثنائي + ثلاثي: Ksp = 108x⁵',
        ],
        steps: [
          'اكتب معادلة التفكك الأيوني للملح أولًا.',
          'عبّر عن تركيز كل أيون بدلالة x أو التركيز المعطى.',
          'عوّض في قانون Ksp مع مراعاة الأسس.',
          'احسب x (الذوبانية) من العلاقة المناسبة.',
          'راجع أن الوحدات متسقة قبل النتيجة النهائية.',
        ],
        example: 'مثال سريع: ملح 1:1 إذا Ksp = 1×10^-8 ⇒ x = √Ksp = 1×10^-4 M.',
      },
      law_mass_percent: {
        formulas: [
          '% بالكتلة = (كتلة الجزء / كتلة الكل) × 100',
          'كتلة العنصر = (% العنصر × كتلة العينة) / 100',
        ],
        steps: [
          'حدد هل المطلوب نسبة مئوية أم كتلة عنصر.',
          'اكتب الكتلة الكلية للعينة أو الكتلة المولية للمركب.',
          'عوّض بالقانون المناسب مباشرة.',
          'احسب وتأكد أن النتيجة منطقية.',
          'في المركبات: مجموع النسب المئوية للعناصر = 100%.',
        ],
        example: 'مثال سريع: عينة 20g تحتوي 5g عنصر ⇒ % العنصر = (5/20)×100 = 25%.',
      },
      law_titration: {
        formulas: ['(Ma × Va)/na = (Mb × Vb)/nb'],
        steps: [
          'اكتب المعطيات: التركيزات والأحجام وقيم n.',
          'وحّد وحدات الحجم (غالبًا mL للطرفين أو L للطرفين).',
          'عوّض في علاقة المعايرة عند نقطة التكافؤ.',
          'احسب المجهول جبريًا.',
          'راجع أن الإجابة بوحدة تركيز أو حجم صحيحة.',
        ],
        example: 'مثال سريع: عند معرفة Ma وVa وna وVb وnb يمكن حساب Mb مباشرة.',
      },
      law_ecell: {
        formulas: [
          'E_cell = E°ox(anode) + E°red(cathode)',
          'E_cell = E°red(cathode) - E°red(anode)',
        ],
        steps: [
          'حدد الأنود والكاثود من نص المسألة.',
          'اكتب الجهود القياسية بالشكل المطلوب (أكسدة/اختزال).',
          'استخدم صيغة واحدة متسقة بدون خلط الإشارات.',
          'احسب E_cell ثم حدد إن كانت موجبة أم لا.',
          'القيمة الموجبة تعني خلية جلفانية تلقائية.',
        ],
        example: 'مثال سريع: E°red(cathode)=0.80 و E°red(anode)=0.34 ⇒ E_cell=0.46 V.',
      },
      law_moles: {
        formulas: [
          'n = m / M',
          'n = V(gas) / 22.4 L',
          'n = N / NA',
          'n = Volume(L) × Molarity',
        ],
        steps: [
          'حدد نوع المعطيات: كتلة/حجم غاز/عدد جسيمات/مولارية.',
          'اختر العلاقة المناسبة للمولات.',
          'حوّل الوحدات قبل التعويض (mL إلى L عند الحاجة).',
          'احسب n ثم استخدمها لباقي المسألة.',
          'راجع الأرقام العلمية خاصة مع عدد أفوجادرو.',
        ],
        example: 'مثال سريع: 11.2L غاز عند STP ⇒ n = 11.2/22.4 = 0.5 mol.',
      },
    };

    const kspCards = [
      { type: 'تفكك أحادي + أحادي', law: 'Ksp = x²', xLaw: 'x = √Ksp', example: 'مثل AgCl' },
      { type: 'تفكك ثنائي + ثنائي', law: 'Ksp = x²', xLaw: 'x = √Ksp', example: 'مثل PbSO4' },
      { type: 'تفكك أحادي + ثنائي', law: 'Ksp = 4x³', xLaw: 'x = ³√(Ksp/4)', example: 'مثل CaF2' },
      { type: 'تفكك ثلاثي + أحادي', law: 'Ksp = 27x⁴', xLaw: 'x = ⁴√(Ksp/27)', example: 'مثل Al(OH)3' },
      { type: 'تفكك ثنائي + ثلاثي', law: 'Ksp = 108x⁵', xLaw: 'x = ⁵√(Ksp/108)', example: 'مثل Ca3(PO4)2' },
    ];

    const renderPhScale = () => `
      <div class="law-visual-block">
        <div class="law-visual-title">علاقات pH الأساسية</div>
        <div class="law-formula-grid">
          <div class="law-formula-ltr law-formula-box">pH + pOH = 14</div>
          <div class="law-formula-ltr law-formula-box">Kw = [H+] [OH-] = 10^-14</div>
        </div>
        <div class="ph-scale">
          ${Array.from({ length: 15 }, (_, i) => {
            const cls = i < 7 ? 'acidic' : i === 7 ? 'neutral' : 'basic';
            return `<span class="ph-cell ${cls}">${i}</span>`;
          }).join('')}
        </div>
        <div class="ph-scale-labels">
          <span>حمضي (0 → 6)</span>
          <span>متعادل (7)</span>
          <span>قلوي (8 → 14)</span>
        </div>
      </div>
    `;

    const renderFaradayFlow = () => `
      <div class="law-visual-block">
        <div class="law-visual-title">تسلسل الحل في التحليل الكهربي</div>
        <div class="faraday-flow">
          <span class="faraday-node">تيار + زمن</span>
          <span class="faraday-arrow">←</span>
          <span class="faraday-node">كمية كهرباء Q</span>
          <span class="faraday-arrow">←</span>
          <span class="faraday-node">مولات إلكترونات</span>
          <span class="faraday-arrow">←</span>
          <span class="faraday-node">كتلة مترسبة</span>
        </div>
      </div>
    `;

    const renderKspCards = () => `
      <div class="law-visual-block">
        <div class="law-visual-title">أنماط Ksp المختصرة</div>
        <div class="ksp-grid">
          ${kspCards.map(item => `
            <div class="ksp-card">
              <div class="ksp-type">${item.type}</div>
              <div class="law-formula-ltr ksp-law">${item.law}</div>
              <div class="law-formula-ltr ksp-law">${item.xLaw}</div>
              <div class="ksp-example">${item.example}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const renderLawCard = (l, withCategoryHeader = false) => {
      const guide = lawGuides[l.id] || {};
      const formulas = guide.formulas || [l.formula, ...(l.lines || [])];
      const steps = guide.steps || [
        'اكتب المعطيات من السؤال.',
        'وحّد الوحدات المطلوبة.',
        'عوّض في القانون المناسب.',
        'احسب الناتج ثم راجع الوحدة.',
      ];
      const quickExample = guide.example || '';

      return `
        <article class="glass-card law-card fade-in ${focusLawId === l.id ? 'law-card-focus' : ''}" data-law-id="${l.id}">
          <div class="law-card-head">
            <h3 class="law-title">${l.title}</h3>
            <span class="law-cat">${LawsData.categoryLabel(l.category)}</span>
          </div>
          ${withCategoryHeader ? `<div class="law-section law-category-inline">${categoryIntro[l.category] || ''}</div>` : ''}

          <div class="law-section">
            <div class="law-label">الصيغة الأساسية</div>
            <div class="law-formula-stack">
              ${formulas.map(line => `<div class="law-formula-ltr law-formula-box">${line}</div>`).join('')}
            </div>
          </div>

          <div class="law-section">
            <div class="law-label">معنى الرموز</div>
            <div class="law-text">${l.symbols}</div>
          </div>

          <div class="law-section">
            <div class="law-label">متى أستخدمه؟</div>
            <div class="law-text">${l.whenToUse}</div>
          </div>

          <div class="law-section">
            <div class="law-label">طريقة الاستخدام</div>
            <div class="law-steps">
              ${steps.map((step, idx) => `
                <div class="law-step-item">
                  <span class="law-step-num">${idx + 1}</span>
                  <span class="law-text">${step}</span>
                </div>
              `).join('')}
            </div>
          </div>

          ${quickExample ? `
            <div class="law-section">
              <div class="law-label">مثال سريع</div>
              <div class="law-example">${quickExample}</div>
            </div>
          ` : ''}

          ${l.id === 'law_ph_poh_kw' ? renderPhScale() : ''}
          ${l.id === 'law_faraday_electrolysis' ? renderFaradayFlow() : ''}
          ${l.id === 'law_ksp_general' ? renderKspCards() : ''}

          <div class="law-section">
            <div class="law-label">ملاحظات مهمة</div>
            <div class="law-text">${l.notes}</div>
          </div>

          <div class="law-section">
            <div class="law-label">أخطاء شائعة</div>
            <div class="law-text">${l.mistakes}</div>
          </div>
        </article>
      `;
    };

    const groupedHtml = categoryOrder
      .filter(c => category === 'all' || c.key === category)
      .map(c => {
        const items = laws.filter(l => l.category === c.key);
        if (!items.length) return '';
        return `
          <section class="laws-category-block">
            <div class="glass-card laws-category-intro">
              <div class="laws-category-title">${c.label}</div>
              <div class="laws-category-text">${categoryIntro[c.key] || ''}</div>
            </div>
            <div class="laws-list">
              ${items.map(l => renderLawCard(l)).join('')}
            </div>
          </section>
        `;
      })
      .join('');

    return `
      <div class="section-label">مرجع القوانين</div>
      <div class="glass-card laws-head fade-in">
        <div class="laws-title">قوانين الكيمياء</div>
        <div class="laws-subtitle">مرجع سريع للقوانين والوحدات وطريقة الاستخدام</div>
        <div class="search-box laws-search-box">
          <input class="search-input" type="search" data-action="laws-search-input" placeholder="ابحث: pH, Ksp, Ka, Kb, E_cell, mol..." value="${q}" autocomplete="off"/>
          <span class="search-icon">🔎</span>
          <button class="laws-clear-btn laws-search-btn" data-action="laws-search-submit">بحث</button>
          <button class="laws-clear-btn" data-action="laws-clear-search">مسح</button>
        </div>
        <div class="laws-chip-row">
          ${LawsData.categories.map(c => `<button class="laws-chip ${category === c.key ? 'active' : ''}" data-action="laws-category" data-category="${c.key}">${c.label}</button>`).join('')}
        </div>
      </div>

      ${laws.length ? groupedHtml : '<div class="glass-card laws-empty">لا توجد نتائج مطابقة. جرّب كلمة أو رمزًا آخر.</div>'}
    `;
  },

  /* — SEARCH — */
  search(q) {
    const results = Search.query(q);
    const safeQ = (q || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    if (!q || q.length < 2) {
      return `<div class="search-box">
        <input class="search-input" type="search" id="si" data-action="search-input" placeholder="ابحث: معادلة، عنصر، تفاعل..." value="${safeQ}"
          autocomplete="off" autofocus/>
        <span class="search-icon">🔍</span>
      </div>
      <div class="search-hint">🔍<br>اكتب كلمتين على الأقل<br>للبحث في كل المحتوى</div>`;
    }
    const resHtml = results.length === 0
      ? '<div class="search-hint">😕 لا نتائج — جرب كلمة مختلفة</div>'
      : results.map(r => `
          <div class="search-result" ${r.kind === 'law'
            ? `data-action="open-law" data-law-id="${r.lawId}" data-law-category="${r.lawCategory}"`
            : r.kind === 'exam-question'
              ? `data-action="open-question" data-question-id="${r.examQuestionId}"`
              : r.kind === 'worked-example'
                ? `data-action="open-worked-example" data-example-id="${r.workedExampleId}" data-question-id="${r.examQuestionId || ''}"`
                : `data-action="jump-to" data-unit-id="${r.uid}" data-section-id="${r.sid}"`}>
            <div class="sr-title" style="color:${r.clr}">${r.nodeTitle}</div>
            <div class="sr-path">
              <span class="search-kind-badge ${r.kind === 'law' ? 'is-law' : r.kind === 'exam-question' ? 'is-exam-question' : r.kind === 'worked-example' ? 'is-worked-example' : ''}">
                ${r.kind === 'law' ? 'قانون' : r.kind === 'exam-question' ? 'سؤال' : r.kind === 'worked-example' ? 'مثال محلول' : 'درس'}
              </span>
              ${r.unitTitle} ← ${r.secTitle}
            </div>
            ${r.matchItems.map(it => {
              const ql = q.toLowerCase();
              const safe = it.replace(/</g,'&lt;');
              const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
              return `<div class="sr-preview">${safe.replace(re,'<mark>$1</mark>')}</div>`;
            }).join('')}
          </div>`).join('');

    return `<div class="search-box">
      <input class="search-input" type="search" id="si" data-action="search-input" placeholder="ابحث..." value="${safeQ}"
        autocomplete="off"/>
      <span class="search-icon">🔍</span>
    </div>
    ${results.length > 0 ? `<div class="search-count">${results.length} نتيجة</div>` : ''}
    ${resHtml}`;
  },

  /* — QUIZ — */
  quiz(S, route = QUIZ.map((_, idx) => idx)) {
    if (S.done) {
      const totalQs = route.length || QUIZ.length;
      const pct = Math.round(S.score / totalQs * 100);
      const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
      const msg = pct >= 80 ? 'ممتاز! أنت جاهز للامتحان' : pct >= 60 ? 'جيد، راجع المحتوى ثم أعد' : 'راجع المحتوى وأعد المحاولة';
      const easyCount = QUIZ.filter(x => x.level === 'سهل').length;
      const medCount = QUIZ.filter(x => x.level === 'متوسط').length;
      const hardCount = QUIZ.filter(x => x.level === 'صعب').length;
      return `
        <div class="quiz-result glass-card" style="padding:28px">
          <div class="quiz-result-score" style="color:${pct>=80?'var(--neon-green)':pct>=60?'var(--neon-amber)':'var(--neon-red)'}">${emoji}</div>
          <div class="quiz-result-label">${S.score} / ${totalQs}</div>
          <div class="quiz-result-sub">${pct}% صحيح — ${msg}</div>
          <div class="quiz-levels-summary">
            <span>سهل: ${easyCount}</span>
            <span>متوسط: ${medCount}</span>
            <span>صعب: ${hardCount}</span>
          </div>
          <div class="quiz-result-bar-wrap">
            <div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:${pct}%"></div></div>
          </div>
          <button class="btn-primary" data-action="restart-quiz">🔄 إعادة الاختبار</button>
        </div>`;
    }

    const qIdx = route[S.idx] ?? S.idx;
    const q = QUIZ[qIdx];
    const qLevel = q.difficulty || q.level || 'متوسط';
    const levelColor = qLevel === 'سهل' ? 'var(--neon-green)' : qLevel === 'متوسط' ? 'var(--neon-amber)' : 'var(--neon-red)';
    const pct = Math.round(S.idx / route.length * 100);
    const orderMap = (S.choiceOrders && Array.isArray(S.choiceOrders[String(qIdx)]) && S.choiceOrders[String(qIdx)].length === q.opts.length)
      ? S.choiceOrders[String(qIdx)]
      : q.opts.map((_, idx) => idx);
    const optsHtml = orderMap.map((originalIdx, visibleIdx) => {
      const o = q.opts[originalIdx];
      let cls = '';
      if (S.answered) {
        if (originalIdx === q.ans) cls = 'correct';
        else if (originalIdx === S.chosen && originalIdx !== q.ans) cls = 'wrong';
        else cls = 'revealed';
      }
      return `<button class="quiz-opt ${cls}" data-action="answer-quiz" data-index="${visibleIdx}" ${S.answered?'disabled':''}>${o}</button>`;
    }).join('');

    return `
      <div class="quiz-progress-wrap">
        <div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:${pct}%"></div></div>
        <div class="quiz-prog-label">السؤال ${S.idx+1} من ${route.length}</div>
      </div>
      <div class="glass-card quiz-card">
        <div class="quiz-level" style="color:${levelColor};border-color:${levelColor}66">المستوى: ${qLevel}</div>
        <div class="quiz-q">${q.q}</div>
        <div class="quiz-opts">${optsHtml}</div>
        ${S.answered && q.explain ? `<div class="quiz-explain">💡 ${q.explain}</div>` : ''}
        ${S.answered && S.suggestion ? `
          <div class="quiz-adaptive-suggest">
            <div class="quiz-adaptive-title">${S.suggestion.titleAr}</div>
            <div class="quiz-adaptive-actions">
              <button class="quiz-adapt-btn" data-action="start-adaptive-topic" data-topic="${S.suggestion.topic}">أسئلة مشابهة</button>
              <button class="quiz-adapt-btn" data-action="open-adaptive-flash" data-topic="${S.suggestion.topic}">بطاقات مرتبطة</button>
              <button class="quiz-adapt-btn" data-action="open-section" data-unit-id="${S.suggestion.unitId}" data-section-id="${S.suggestion.sectionId}">مراجعة الدرس</button>
            </div>
          </div>
        ` : ''}
        ${S.answered ? `<button class="btn-primary" style="margin-top:14px" data-action="next-quiz">التالي ←</button>` : ''}
      </div>`;
  },

  /* — FLASHCARDS — */
  flash(S, pool, dueNowIds = new Set()) {
    const card = CARDS[S.idx];
    const unit = DB.units.find(u => u.id === card.unit);
    const clr = unit ? unit.clr : '#3b9eff';
    const conf = Progress.getConf(S.idx);
    const dueNow = card?.id ? dueNowIds.has(card.id) : false;
    const dueLabel = dueNow ? 'مستحق الآن' : 'لاحقاً';
    const dueCls = dueNow ? 'is-due-now' : 'is-due-later';
    const topics = ['all', ...Array.from(new Set(CARDS.map(c => c.topic).filter(Boolean)))];
    const topicLabels = { all:'الكل' };

    return `
      <div class="fc-topics">
        ${topics.map(t => `
          <button class="fc-topic-btn ${S.topic === t ? 'active' : ''}" data-action="set-flash-topic" data-topic="${t}">
            ${topicLabels[t] || t}
          </button>
        `).join('')}
      </div>
      <div class="fc-counter">${pool.indexOf(S.idx) + 1} / ${pool.length} — ${unit ? unit.title : ''} ${card.topic ? `• ${card.topic}` : ''}</div>
      <div class="fc-due-status ${dueCls}">${dueLabel}</div>
      <div class="fc-scene" data-action="flip-card">
        <div class="fc-card ${S.flipped ? 'flipped' : ''}" style="min-height:200px;position:relative">
          <div class="fc-face" style="border-color:${clr}30;min-height:200px">
            <div class="fc-face-label">السؤال — انقر للإجابة</div>
            <div class="fc-face-text">${card.f}</div>
          </div>
          <div class="fc-face fc-face-back" style="border-color:${clr};min-height:200px">
            <div class="fc-face-label" style="color:${clr}">الإجابة ✓</div>
            <div class="fc-face-text">${card.b}</div>
          </div>
        </div>
      </div>
      <div class="fc-hint">${S.flipped ? 'كيف كانت درجة صعوبتها؟' : '👆 انقر على البطاقة لرؤية الإجابة'}</div>
      ${S.flipped ? `
        <div class="fc-confidence" style="margin-bottom:12px">
          <button class="fc-conf-btn fc-conf-hard" data-action="rate-card" data-level="hard">😓 صعب</button>
          <button class="fc-conf-btn fc-conf-ok" data-action="rate-card" data-level="ok">🤔 تقريباً</button>
          <button class="fc-conf-btn fc-conf-easy" data-action="rate-card" data-level="easy">✅ سهل</button>
        </div>` : ''}
      <div class="fc-nav">
        <button class="fc-nav-btn" data-action="prev-card">← السابق</button>
        <div style="color:var(--text-muted);font-size:11px;text-align:center">
          ${conf === 'easy' ? '✅ سهل' : conf === 'ok' ? '🤔 تقريباً' : conf === 'hard' ? '😓 صعب' : '⬜ لم تُقيَّم'}
        </div>
        <button class="fc-nav-btn" data-action="next-card">التالي →</button>
      </div>`;
  }
};


void PeriodicTable;

export { MindMap, Renderer };

