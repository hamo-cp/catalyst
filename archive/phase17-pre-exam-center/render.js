'use strict';

import { ItemParser, DB, QUIZ, CARDS } from './data.js';
import { Search } from './search.js';
import { Progress } from './progress.js';
import { PeriodicTable } from './periodic-table.js';
import { ReactionPlayer } from './reaction-player.js';
import { LawsData } from './laws.js';

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


const Renderer = {

  /* — HOME — */
  home(adaptiveHome = null) {
    const totalSeen = Progress.totalSeen();
    const totalNodes = Progress.totalNodes();
    const pct = totalNodes > 0 ? Math.round(totalSeen / totalNodes * 100) : 0;

    const hero = `
      <div class="home-hero fade-in">
        <svg class="hero-molecules" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
          <circle cx="20" cy="20" r="6" fill="#00ffb3" class="anim-float"/>
          <circle cx="280" cy="90" r="8" fill="#3b9eff" class="anim-float" style="animation-delay:1s"/>
          <circle cx="150" cy="10" r="5" fill="#b97aff" class="anim-float" style="animation-delay:0.5s"/>
          <line x1="20" y1="20" x2="150" y2="10" stroke="#00ffb3" stroke-width="0.8" opacity="0.5"/>
          <line x1="150" y1="10" x2="280" y2="90" stroke="#3b9eff" stroke-width="0.8" opacity="0.5"/>
          <circle cx="60" cy="100" r="4" fill="#ffcc44" class="anim-float" style="animation-delay:1.5s"/>
          <circle cx="240" cy="30" r="7" fill="#ff6eb4" class="anim-float" style="animation-delay:0.8s"/>
          <line x1="60" y1="100" x2="240" y2="30" stroke="#ff6eb4" stroke-width="0.8" opacity="0.4"/>
        </svg>
        <div class="hero-title">⚗️ Chemistry<br>MindMap Pro</div>
        <div class="hero-sub">كيمياء الثانوية — الطريقة الذكية</div>
      </div>`;

    const stats = `
      <div class="stats-row fade-in fade-in-delay-1">
        <div class="stat-chip">
          <div class="stat-val" style="color:var(--neon-cyan)">${totalSeen}</div>
          <div class="stat-label">موضوع تمت مراجعته</div>
        </div>
        <div class="stat-chip">
          <div class="stat-val" style="color:var(--neon-green)">${pct}%</div>
          <div class="stat-label">الإنجاز الكلي</div>
        </div>
        <div class="stat-chip">
          <div class="stat-val" style="color:var(--neon-amber)">${CARDS.length}</div>
          <div class="stat-label">بطاقات تذكر</div>
        </div>
      </div>`;

    const learningTracks = `
      <div class="home-track-grid fade-in fade-in-delay-1">
        <div class="glass-card home-track">
          <div class="home-track-title">مسار الفهم</div>
          <div class="home-track-desc">افتح الوحدة ثم ابدأ بالعقد الأساسية قبل التفاصيل.</div>
        </div>
        <div class="glass-card home-track">
          <div class="home-track-title">مسار التطبيق</div>
          <div class="home-track-desc">جرّب أسئلة الفهم ثم ارجع لنقاط الضعف مباشرة.</div>
        </div>
      </div>`;

    const weeklyFocus = `
      <div class="glass-card home-focus fade-in fade-in-delay-2">
        <div class="home-focus-title">خطة مراجعة سريعة</div>
        <div class="home-focus-list">
          <span>1) الهيدروكربونات: أنماط التفاعل</span>
          <span>2) المشتقات: التمييز بين المجموعات الوظيفية</span>
          <span>3) الحديد والتحليل النوعي: الكواشف المهمة</span>
        </div>
      </div>`;

    const quickActions = `
      <div class="home-quick-grid fade-in fade-in-delay-2">
        <button class="glass-card home-quick-btn" data-action="tab" data-tab="search">بحث ذكي</button>
        <button class="glass-card home-quick-btn" data-action="tab" data-tab="periodic">الجدول الدوري</button>
        <button class="glass-card home-quick-btn" data-action="open-periodic-filter" data-filter="transition">السلسلة الانتقالية</button>
        <button class="glass-card home-quick-btn" data-action="tab" data-tab="laws">القوانين</button>
        <button class="glass-card home-quick-btn" data-action="tab" data-tab="quiz">اختبار سريع</button>
        <button class="glass-card home-quick-btn" data-action="tab" data-tab="flash">مراجعة بطاقات</button>
        <button class="glass-card home-quick-btn" data-action="tab" data-tab="organic">رحلة العضوية</button>
      </div>`;

    const weakUnits = DB.units
      .map(u => {
        const totalN = u.sections.reduce((a, s) => a + s.nodes.length, 0);
        const uPct = Progress.getPct(u.id, totalN);
        return { id: u.id, title: u.title, pct: uPct, clr: u.clr };
      })
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 2);
    const weakBox = `
      <div class="glass-card home-weak fade-in fade-in-delay-3">
        <div class="home-weak-title">نقاط تحتاج دعم</div>
        ${weakUnits.map(w => `
          <div class="home-weak-item" data-action="open-unit" data-unit-id="${w.id}">
            <span>${w.title}</span>
            <span style="color:${w.clr}">${w.pct}%</span>
          </div>
        `).join('')}
      </div>`;

    const plan = adaptiveHome?.plan || { dateKey: '', tasks: [], completedTaskIds: [] };
    const completed = adaptiveHome?.completedCount || 0;
    const totalTasks = adaptiveHome?.totalTasks || 0;
    const dueFlashCount = adaptiveHome?.dueFlashCount || 0;
    const retryCount = adaptiveHome?.retryCount || 0;
    const weakTopics = adaptiveHome?.weakTopics || [];
    const doneSet = new Set(plan.completedTaskIds || []);
    const planHtml = `
      <div class="glass-card today-plan fade-in fade-in-delay-2">
        <div class="today-plan-head">
          <div>
            <div class="today-plan-title">خطة اليوم</div>
            <div class="today-plan-date">${plan.dateKey || ''}</div>
          </div>
          <div class="today-plan-progress">${completed}/${totalTasks}</div>
        </div>
        <div class="today-plan-meta">
          <span>بطاقات مستحقة الآن: ${dueFlashCount}</span>
          <div class="today-plan-actions">
            ${retryCount > 0 ? `<button class="today-plan-weak-btn" data-action="start-retry-quiz">مراجعة أخطائي (${retryCount})</button>` : ''}
            ${weakTopics[0] ? `<button class="today-plan-weak-btn" data-action="start-adaptive-topic" data-topic="${weakTopics[0].topic}">ابدأ أضعف موضوع</button>` : ''}
          </div>
        </div>
        <div class="today-plan-list">
          ${(plan.tasks || []).map(task => `
            <div class="today-task ${doneSet.has(task.id) ? 'done' : ''}">
              <button class="today-task-check" data-action="toggle-plan-task" data-task-id="${task.id}">${doneSet.has(task.id) ? '✓' : '○'}</button>
              <div class="today-task-body">
                <div class="today-task-title">${task.titleAr}</div>
                <div class="today-task-desc">${task.descAr}</div>
              </div>
              <button class="today-task-start" data-action="start-plan-task" data-task-id="${task.id}">ابدأ</button>
            </div>
          `).join('')}
        </div>
      </div>`;

    const unitsHtml = DB.units.map((u, i) => {
      const totalN = u.sections.reduce((a, s) => a + s.nodes.length, 0);
      const pct = Progress.getPct(u.id, totalN);
      const delay = i === 0 ? '' : `fade-in-delay-${Math.min(i, 3)}`;
      return `
        <div class="glass-card unit-card fade-in ${delay}" data-action="open-unit" data-unit-id="${u.id}" style="border-color:${u.clr}30">
          <div class="unit-card-icon" style="background:${u.clr}15">${u.icon}</div>
          <div class="unit-card-body">
            <div class="unit-card-title" style="color:${u.clr}">${u.title}</div>
            <div class="unit-card-meta">${u.description}</div>
            <div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${u.clr}"></div></div>
          </div>
          <div class="unit-card-arrow">←</div>
        </div>`;
    }).join('');

    return hero + stats + learningTracks + weeklyFocus + quickActions + weakBox + planHtml + `<div class="section-label">الوحدات الدراسية</div><div class="units-grid">${unitsHtml}</div>`;
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
      return `<div class="bond-demo" style="margin-top:12px">
        <div class="bond-demo-label">🔬 آلية تفاعل الإضافة</div>
        ${MindMap.bondFormationSVG('alkene_addition')}
      </div>`;
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
  organic() {
    const pw = DB.units[0].sections.find(s => s.id === 'alkynes')?.nodes.find(n => n.isPathway);
    const w = document.getElementById('view')?.clientWidth || 320;
    const pwSVG = pw ? MindMap.renderPathwaySVG(pw.pathway, w - 28) : '';
    const mapSVG = MindMap.renderOrganicNetwork(w - 8);
    const fgChips = [
      { fg:'-OH', clr:'#b97aff', name:'كحول' },
      { fg:'-CHO', clr:'#ffcc44', name:'ألدهيد' },
      { fg:'>C=O', clr:'#ff7c35', name:'كيتون' },
      { fg:'-COOH', clr:'#ff4d6d', name:'حمض كربوكسيلي' },
      { fg:'-COO-', clr:'#00e5ff', name:'استر' },
      { fg:'-NH₂', clr:'#59b894', name:'أمين' },
    ].map(c => `<span class="fg-chip" style="color:${c.clr};border-color:${c.clr}55;background:${c.clr}10">${c.fg} ${c.name}</span>`).join('');

    const relationRows = [
      ['-OH (كحول)', 'أكسدة', 'K₂Cr₂O₇ / H₂SO₄', 'ألدهيد ثم حمض'],
      ['C=C (كين)', 'إضافة', 'Br₂/CCl₄', 'هاليد ثنائي'],
      ['-COOH + كحول', 'استرة', 'H₂SO₄ + تسخين', 'استر + ماء'],
      ['ألكان', 'إحلال', 'UV + Cl₂', 'هاليد ألكيل'],
      ['C≡C (كاين)', 'إضافة/هدرجة', 'Ni + H₂', 'كين ثم ألكان'],
    ];

    const compareRows = [
      ['الكانات', 'إحلال', 'مشبعة (σ فقط)', 'لا تزيل بروم بدون UV'],
      ['الكينات', 'إضافة', 'رابطة π نشطة', 'تزيل لون البروم'],
      ['الألدهيدات', 'أكسدة سهلة', 'طرف السلسلة', 'تولنز (+)'],
      ['الكيتونات', 'أصعب في الأكسدة', 'وسط السلسلة', 'تولنز (-)'],
      ['الأحماض', 'تعادل + استرة', 'حمضية أعلى', 'تتفاعل مع NaHCO₃'],
      ['الاسترات', 'تحلل مائي/صابرة', 'رائحة فاكهية غالبًا', 'عكسية مع الماء'],
    ];

    const commonMistakes = [
      'اعتبار كل تسخين مع H₂SO₄ يعطي نفس الناتج: 110°C يختلف عن 140°C.',
      'الخلط بين تفاعل الإضافة (على π) والإحلال (على σ).',
      'نسيان أن اختبار تولنز يميز الألدهيد عن الكيتون.',
      'اعتبار الاسترة غير عكسية: العكس صحيح إلا في الصابرة.',
      'نسيان دور الشرط (Ni/H₂) في الهدرجة التدريجية.',
    ];

    const quickQuestions = [
      'لماذا تتفاعل الكينات أسرع من الكانات؟',
      'كيف تفرّق بين ألدهيد وكيتون في تجربة بسيطة؟',
      'لماذا نزيل الماء لتحسين ناتج الاسترة؟',
      'ما أثر UV في إحلال الكلور بالميثان؟',
      'في أي خطوة نستخدم قاعدة ماركوفنيكوف؟',
    ];

    const animations = ReactionPlayer.getLessons();

    return `
      <div class="section-label">Organic Learning Window</div>

      <div class="glass-card organic-roadmap fade-in">
        <div class="organic-roadmap-title">خريطة تعلّم العضوية</div>
        <div class="organic-roadmap-grid">
          <button class="organic-step" data-action="open-section" data-unit-id="hydrocarbons" data-section-id="alkanes">الكانات</button>
          <button class="organic-step" data-action="open-section" data-unit-id="hydrocarbons" data-section-id="alkenes">الكينات</button>
          <button class="organic-step" data-action="open-section" data-unit-id="hydrocarbons" data-section-id="alkynes">الكاينات</button>
          <button class="organic-step" data-action="open-section" data-unit-id="org_derivatives" data-section-id="alcohols_sec">الكحولات</button>
          <button class="organic-step" data-action="open-section" data-unit-id="org_derivatives" data-section-id="carbonyl_sec">ألدهيد/كيتون</button>
          <button class="organic-step" data-action="open-section" data-unit-id="org_derivatives" data-section-id="acids_esters_sec">أحماض/استرات</button>
        </div>
      </div>

      <div class="section-label">خريطة المجموعات الوظيفية</div>
      <div class="glass-card glow-green fade-in" style="padding:14px;margin-bottom:10px">
        <div style="margin-bottom:8px">${fgChips}</div>
        <div class="pathway-scroll">${mapSVG}</div>
      </div>

      <div class="section-label">التحويلات العضوية</div>
      <div class="glass-card fade-in" style="padding:14px;margin-bottom:10px">
        <div class="organic-subtitle">مسار C₂ من الكربيد إلى مشتقات مهمة</div>
        <div class="pathway-scroll">${pwSVG}</div>
        <div class="organic-mini-cards">
          <div class="organic-mini-card">CaC₂ → C₂H₂: توليد الكاين من الكربيد.</div>
          <div class="organic-mini-card">C₂H₂ → C₂H₄ → C₂H₆: هدرجة تدريجية.</div>
          <div class="organic-mini-card">C₂H₄ → C₂H₅OH: هدرة في وسط حمضي.</div>
          <div class="organic-mini-card">C₂H₅OH → CH₃CHO → CH₃COOH: أكسدة متدرجة.</div>
        </div>
      </div>

      <div class="section-label">شروط التفاعل</div>
      <div class="glass-card fade-in" style="padding:14px;margin-bottom:10px">
        <div class="table-scroll">
          <table class="chem-table">
            <tr><th>الموقف</th><th>الشرط</th><th>لماذا؟</th></tr>
            ${relationRows.map(r => `<tr><td>${r[0]}</td><td>${r[2]}</td><td>${r[1]} ⟶ ${r[3]}</td></tr>`).join('')}
          </table>
        </div>
      </div>

      <div class="section-label">المقارنات المهمة</div>
      <div class="glass-card fade-in" style="padding:14px;margin-bottom:10px">
        <div class="table-scroll">
          <table class="chem-table">
            <tr><th>العائلة</th><th>النمط</th><th>الفكرة</th><th>دليل عملي</th></tr>
            ${compareRows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
          </table>
        </div>
      </div>

      <div class="section-label">أخطاء شائعة</div>
      <div class="glass-card fade-in" style="padding:14px;margin-bottom:10px">
        ${commonMistakes.map(m => `<div class="node-item"><span class="item-bullet">•</span><span>${m}</span></div>`).join('')}
      </div>

      <div class="section-label">أسئلة فهم سريعة</div>
      <div class="glass-card fade-in" style="padding:14px;margin-bottom:10px">
        ${quickQuestions.map((q, i) => `<div class="expected-item"><span class="expected-num">س${i+1}</span><span>${q}</span></div>`).join('')}
        <button class="btn-ghost" style="margin-top:10px" data-action="tab" data-tab="quiz">اذهب لاختبار الفهم</button>
      </div>

      <div class="section-label">رسوم متحركة تعليمية</div>
      ${animations.map(a => ReactionPlayer.renderLessonCard(a)).join('')}

      <div class="glass-card fade-in" style="padding:12px;margin-top:10px">
        <button class="home-quick-btn" style="width:100%" data-action="open-periodic-filter" data-filter="transition">السلسلة الانتقالية</button>
      </div>
    `;
  },

  periodic(S) {
    return PeriodicTable.render(S || {});
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
    const safeQ = (q || '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
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
            : `data-action="jump-to" data-unit-id="${r.uid}" data-section-id="${r.sid}"`}>
            <div class="sr-title" style="color:${r.clr}">${r.nodeTitle}</div>
            <div class="sr-path">${r.unitTitle} ← ${r.secTitle}</div>
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
          <button class="btn-ghost" data-action="tab" data-tab="flash">🃏 مراجعة بالبطاقات</button>
        </div>`;
    }

    const qIdx = route[S.idx] ?? S.idx;
    const q = QUIZ[qIdx];
    const qLevel = q.difficulty || q.level || 'متوسط';
    const levelColor = qLevel === 'سهل' ? 'var(--neon-green)' : qLevel === 'متوسط' ? 'var(--neon-amber)' : 'var(--neon-red)';
    const pct = Math.round(S.idx / route.length * 100);
    const optsHtml = q.opts.map((o, i) => {
      let cls = '';
      if (S.answered) {
        if (i === q.ans) cls = 'correct';
        else if (i === S.chosen && i !== q.ans) cls = 'wrong';
        else cls = 'revealed';
      }
      return `<button class="quiz-opt ${cls}" data-action="answer-quiz" data-index="${i}" ${S.answered?'disabled':''}>${o}</button>`;
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

