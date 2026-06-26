// ============================================================
// Trade-Metrix · Trading Journal / Notes — notes.js
// ============================================================

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Seed data
  // ---------------------------------------------------------
  let notes = [
    {
      id: 'n1', date: 'Nov 15, 2024', symbol: 'EURUSD', pnl: 1250,
      summary: 'Clean trend day, followed the plan and sized up on the highest-conviction setup.',
      premarketPlan: ['Mark key levels from the London session', 'Plan to trade NY open only if VWAP deviation triggers', 'Keep size at 1% risk per trade until 2 wins confirmed'],
      sentiment: ['green', 'green', 'yellow', 'red', 'red'],
      postSession: 'Performance was strong on the VWAP Fade setups. RSI overbought signals lined up cleanly with the deviation triggers, and exits were taken at the planned VWAP target rather than chasing extra profit.',
      postSessionPoints: ['VWAP deviation exceeded 2% on both entries', 'Exit rules were followed without hesitation'],
      lessons: ['Waited for confirmation before entering, avoided FOMO', 'Sized appropriately after the first winning trade', 'Stuck to the daily loss limit without overriding it'],
      focusTomorrow: 'Focus on tightening entries during the London-NY overlap and journaling the exact deviation percentage at entry.',
      mood: ['Calm', 'Confident'],
      confidence: 10,
      linkedTrades: [
        { symbol: 'EURUSD', date: '10/23/2024', pnl: 250 },
        { symbol: 'GBPJPY', date: '10/23/2024', pnl: 150 },
        { symbol: 'GBPJPY', date: '10/25/2024', pnl: 120 }
      ],
      moodGraph: [40, 55, 50, 70, 65, 90, 85, 110, 100, 130, 120, 150, 145, 170, 160, 185]
    },
    {
      id: 'n2', date: 'Nov 15, 2024', symbol: 'EURUSD', pnl: -100,
      summary: 'Pre-market plan was solid, but execution slipped on the second trade after a quick loss.',
      premarketPlan: ['Watch for a retest of yesterday\'s high before committing size', 'Limit to two trades max for the session', 'Avoid trading the first 10 minutes after open'],
      sentiment: ['green', 'yellow', 'yellow', 'red', 'red'],
      postSession: 'First trade played out exactly to plan. Second trade was taken too early, before the retest fully confirmed, which led to a stop-out.',
      postSessionPoints: ['First entry matched the plan precisely', 'Second entry broke the retest confirmation rule'],
      lessons: ['Re-entering immediately after a loss added risk without an edge', 'Need a hard rule: no re-entry within 15 minutes of a stop-out'],
      focusTomorrow: 'Add a cooldown rule after any losing trade before considering a new entry.',
      mood: ['Fearful', 'FOMO'],
      confidence: 5,
      linkedTrades: [
        { symbol: 'EURUSD', date: '10/24/2024', pnl: -100 }
      ],
      moodGraph: [60, 55, 58, 50, 45, 48, 40, 35, 38, 30, 28, 25, 22, 20, 18, 15]
    },
    {
      id: 'n3', date: 'Nov 16, 2024', symbol: 'EURUSD', pnl: -1200,
      summary: 'Difficult session — oversized a counter-trend trade and held past the stop-loss level.',
      premarketPlan: ['Stay flat unless a clear breakout forms', 'Cap risk at 1% per trade regardless of conviction', 'No trading after two consecutive losses'],
      sentiment: ['red', 'red', 'yellow', 'red', 'red'],
      postSession: 'Broke the daily loss limit rule after moving the stop-loss further away on a losing position. The setup itself was not invalid, but risk management broke down mid-trade.',
      postSessionPoints: ['Stop-loss was moved twice during the trade', 'Position size exceeded the 1% risk rule'],
      lessons: ['Never move a stop-loss further from entry once a trade is live', 'Daily loss limit must trigger an automatic stop for the day'],
      focusTomorrow: 'Re-read the risk management rules before the next session and reduce size by half until consistency returns.',
      mood: ['Irritated', 'Fearful'],
      confidence: 3,
      linkedTrades: [
        { symbol: 'EURUSD', date: '10/24/2024', pnl: -1200 }
      ],
      moodGraph: [70, 65, 60, 55, 45, 40, 35, 28, 22, 18, 15, 12, 10, 8, 6, 5]
    },
    {
      id: 'n4', date: 'Nov 15, 2024', symbol: 'GBPJPY', pnl: -1200,
      summary: 'Strategy held up but emotional discipline slipped after an early drawdown.',
      premarketPlan: ['Trade only the London session breakout setup', 'Reduce size after any red day', 'Journal every entry reason before clicking buy or sell'],
      sentiment: ['yellow', 'red', 'red', 'yellow', 'green'],
      postSession: 'The breakout setup triggered correctly, but the trade was closed early out of fear rather than at the planned target, locking in a smaller loss than the stop would have allowed — though it also gave up a winning trade taken later in the day.',
      postSessionPoints: ['Breakout trigger matched plan criteria', 'Exit timing was driven by emotion, not the plan'],
      lessons: ['Pre-defining the exit removes the temptation to exit early out of fear', 'A short walk after a loss helped reset focus for the next setup'],
      focusTomorrow: 'Set hard take-profit and stop-loss orders at entry instead of managing exits manually.',
      mood: ['Fearful', 'Calm'],
      confidence: 6,
      linkedTrades: [
        { symbol: 'GBPJPY', date: '10/23/2024', pnl: -1200 }
      ],
      moodGraph: [50, 48, 52, 45, 40, 42, 38, 44, 40, 46, 50, 48, 55, 52, 58, 60]
    }
  ];

  let activeId = 'n1';

  // ---------------------------------------------------------
  // Element refs
  // ---------------------------------------------------------
  const notesList = document.getElementById('notesList');
  const noteViewTitle = document.getElementById('noteViewTitle');
  const premarketBlock = document.getElementById('premarketBlock');
  const lessonsList = document.getElementById('lessonsList');
  const postSessionBlock = document.getElementById('postSessionBlock');
  const focusBlock = document.getElementById('focusBlock');
  const moodTags = document.getElementById('moodTags');
  const confidenceGauge = document.getElementById('confidenceGauge');
  const linkedTradesBody = document.getElementById('linkedTradesBody');
  const moodGraph = document.getElementById('moodGraph');

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatSigned(value) {
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const sentimentColor = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

  // ---------------------------------------------------------
  // Render note list
  // ---------------------------------------------------------
  function renderNotesList() {
    notesList.innerHTML = '';
    notes.forEach((n) => {
      const row = document.createElement('div');
      row.className = `note-row ${n.id === activeId ? 'active' : ''}`;
      row.dataset.id = n.id;
      row.innerHTML = `
        <div>
          <div class="note-row-date">${escapeHtml(n.date)}</div>
          <div class="note-row-pnl ${n.pnl >= 0 ? 'text-green' : 'text-red'}">${formatSigned(n.pnl)}</div>
        </div>
        <div>
          <div class="note-row-symbol">${escapeHtml(n.symbol)}</div>
          <div class="note-row-summary">${escapeHtml(n.summary)}</div>
        </div>
        <div class="note-row-actions">
          <button class="action-btn edit" title="Edit note" data-action="edit">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4v16h16v-7"/><path d="M17.5 3.5a1.5 1.5 0 0 1 2 2L11 14l-4 1 1-4z"/></svg>
          </button>
          <button class="action-btn delete" title="Delete note" data-action="delete">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      `;
      notesList.appendChild(row);
    });
  }

  // ---------------------------------------------------------
  // Render note detail
  // ---------------------------------------------------------
  function renderDetail() {
    const n = notes.find((x) => x.id === activeId);
    if (!n) return;

    noteViewTitle.textContent = `Note View : ${n.date}`;

    premarketBlock.innerHTML = `
      <p><strong>Plan:</strong></p>
      <ul>${n.premarketPlan.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
      <p><strong>Sentiment indicators:</strong></p>
      <div class="sentiment-dots">
        ${n.sentiment.map((c) => `<span class="sentiment-dot" style="background:${sentimentColor[c]}"></span>`).join('')}
      </div>
    `;

    lessonsList.innerHTML = n.lessons.map((l) =>
      `<li><label><input type="checkbox" checked /> ${escapeHtml(l)}</label></li>`
    ).join('');

    postSessionBlock.innerHTML = `
      <p>${escapeHtml(n.postSession)}</p>
      <ul>${n.postSessionPoints.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
    `;

    focusBlock.textContent = n.focusTomorrow;

    const allMoods = ['Calm', 'Confident', 'Fearful', 'FOMO', 'Irritated'];
    moodTags.innerHTML = allMoods.map((m) => {
      const isSelected = n.mood.includes(m);
      return `<span class="mood-tag ${isSelected ? 'selected ' + m.toLowerCase() : ''}">${m}</span>`;
    }).join('');

    renderGauge(n.confidence);

    if (n.linkedTrades.length === 0) {
      linkedTradesBody.innerHTML = `<tr><td colspan="3" class="empty-state" style="padding:14px 10px;">No trades linked to this note.</td></tr>`;
    } else {
      linkedTradesBody.innerHTML = n.linkedTrades.map((t) => `
        <tr>
          <td>${escapeHtml(t.symbol)}</td>
          <td>${escapeHtml(t.date)}</td>
          <td class="${t.pnl >= 0 ? 'pnl-cell positive' : 'pnl-cell negative'}">${formatSigned(t.pnl)}</td>
        </tr>
      `).join('');
    }

    renderMoodGraph(n.moodGraph);
  }

  // ---------------------------------------------------------
  // Confidence gauge (semi-circle, 0-10 scale)
  // ---------------------------------------------------------
  function renderGauge(score) {
    const cx = 60, cy = 60, r = 50;
    const pct = Math.max(0, Math.min(score, 10)) / 10;
    const startAngle = Math.PI; // 180deg (left)
    const endAngle = Math.PI - pct * Math.PI; // sweep toward 0deg (right)

    const startX = cx + r * Math.cos(startAngle);
    const startY = cy + r * Math.sin(startAngle);
    const endX = cx + r * Math.cos(endAngle);
    const endY = cy + r * Math.sin(endAngle);

    const largeArc = pct > 0.5 ? 1 : 0;

    const trackPath = `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`;
    const progressPath = pct === 0 ? '' : `M${startX},${startY} A${r},${r} 0 ${largeArc} 1 ${endX},${endY}`;

    const color = score >= 7 ? '#22c55e' : score >= 4 ? '#eab308' : '#ef4444';

    confidenceGauge.innerHTML = `
      <path d="${trackPath}" fill="none" stroke="#e3e6eb" stroke-width="10" stroke-linecap="round"></path>
      ${progressPath ? `<path d="${progressPath}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"></path>` : ''}
      <text x="60" y="55" text-anchor="middle" font-size="22" font-weight="700" fill="#16181d">${score}</text>
    `;
  }

  // ---------------------------------------------------------
  // Mood / mindset line graph
  // ---------------------------------------------------------
  function renderMoodGraph(points) {
    const w = 320, h = 120, pad = 10;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const stepX = (w - pad * 2) / (points.length - 1);

    const coords = points.map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y];
    });

    const linePath = coords.map((c, i) => (i === 0 ? `M${c[0]},${c[1]}` : `L${c[0]},${c[1]}`)).join(' ');
    const areaPath = `${linePath} L${coords[coords.length - 1][0]},${h - pad} L${coords[0][0]},${h - pad} Z`;

    moodGraph.innerHTML = `
      <defs>
        <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#moodFill)" stroke="none"></path>
      <path d="${linePath}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    `;
  }

  // ---------------------------------------------------------
  // Interactions
  // ---------------------------------------------------------
  notesList.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.action-btn');
    const row = e.target.closest('.note-row');
    if (!row) return;
    const id = row.dataset.id;

    if (actionBtn) {
      const n = notes.find((x) => x.id === id);
      if (actionBtn.dataset.action === 'delete') {
        if (confirm(`Delete the note from ${n.date} (${n.symbol})?`)) {
          notes = notes.filter((x) => x.id !== id);
          if (activeId === id && notes.length) activeId = notes[0].id;
          renderNotesList();
          renderDetail();
        }
      } else if (actionBtn.dataset.action === 'edit') {
        const newSummary = prompt('Edit note summary', n.summary);
        if (newSummary !== null && newSummary.trim()) {
          n.summary = newSummary.trim();
          renderNotesList();
        }
      }
      return;
    }

    activeId = id;
    renderNotesList();
    renderDetail();
  });

  document.getElementById('newNoteBtn').addEventListener('click', () => {
    const symbol = prompt('Symbol for this daily note', 'EURUSD');
    if (!symbol || !symbol.trim()) return;

    const newNote = {
      id: 'n' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      symbol: symbol.trim().toUpperCase(),
      pnl: 0,
      summary: 'New daily note — add your pre-market plan and review.',
      premarketPlan: ['Add your plan for the session.'],
      sentiment: ['yellow', 'yellow', 'yellow', 'yellow', 'yellow'],
      postSession: 'Add your post-session review here.',
      postSessionPoints: [],
      lessons: ['Add a lesson learned from today.'],
      focusTomorrow: 'Add your focus for the next session.',
      mood: ['Calm'],
      confidence: 5,
      linkedTrades: [],
      moodGraph: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
    };

    notes.unshift(newNote);
    activeId = newNote.id;
    renderNotesList();
    renderDetail();
  });

  // ---------------------------------------------------------
  // Sorting (Date / Symbol header)
  // ---------------------------------------------------------
  document.querySelectorAll('.notes-table-head [data-sort]').forEach((el) => {
    let dir = 'asc';
    el.addEventListener('click', () => {
      const key = el.dataset.sort;
      dir = dir === 'asc' ? 'desc' : 'asc';
      const mult = dir === 'asc' ? 1 : -1;
      notes.sort((a, b) => {
        let av = a[key].toLowerCase ? a[key].toLowerCase() : a[key];
        let bv = b[key].toLowerCase ? b[key].toLowerCase() : b[key];
        if (av < bv) return -1 * mult;
        if (av > bv) return 1 * mult;
        return 0;
      });
      renderNotesList();
    });
  });

  // ---------------------------------------------------------
  // Quick Add Trade (topbar)
  // ---------------------------------------------------------
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', () => {
      window.location.href = 'tradelog.html';
    });
  }

  // ---------------------------------------------------------
  // Init
  // ---------------------------------------------------------
  renderNotesList();
  renderDetail();
})();
