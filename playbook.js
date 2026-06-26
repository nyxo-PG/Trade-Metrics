// ============================================================
// Trade-Metrix · Playbook & Strategies — playbook.js
// ============================================================

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Seed data
  // ---------------------------------------------------------
  let strategies = [
    {
      id: 's1', name: 'VWAP Fade', direction: 'Short', session: 'NY',
      tags: ['Short', 'Fade'], pnl: 1250, winrate: 72.4, trades: 20,
      description: `VWAP Fade looks to capture mean-reversion moves when price stretches too far from the session VWAP without supporting volume.`,
      setup: ['Wait for price to deviate more than 2% from VWAP', 'Confirm RSI is in overbought or oversold territory', 'Look for a volume drop-off on the extension'],
      entryRules: ['VWAP deviation greater than 2%', 'RSI overbought or oversold', 'Volume declining into the extreme'],
      checklist: ['VWAP Deviation > 2%', 'RSI Overbought', 'Volume Declining', 'No major news in next 30min'],
      winRate: 72, profitFactor: 2.8, avgWin: 180, avgLoss: -90,
      examples: [
        { symbol: 'EURUSD', date: '10/23/2024', pnl: 250, status: 'Short' },
        { symbol: 'GBPJPY', date: '10/22/2024', pnl: 150, status: 'Short' },
        { symbol: 'GBPJPY', date: '10/25/2024', pnl: 150, status: 'Short' }
      ],
      graph: [40, 55, 50, 70, 65, 90, 85, 110, 100, 130, 120, 150, 145, 170, 160, 185]
    },
    {
      id: 's2', name: 'Opening Range Breakout', direction: 'Long', session: 'London',
      tags: ['Opening', 'Breakout'], pnl: 100, winrate: 82.0, trades: 7,
      description: `Opening Range Breakout trades the initial volatility expansion right after the session opens, entering once price clears the first 15-minute range.`,
      setup: ['Mark the high and low of the first 15 minutes after open', 'Wait for a clean break and close beyond the range', 'Enter on retest or immediate breakout candle close'],
      entryRules: ['Price closes beyond the opening range', 'Volume confirms the breakout', 'No conflicting higher-timeframe resistance nearby'],
      checklist: ['Opening range defined', 'Breakout candle closed beyond range', 'Volume above average', 'Stop placed at range midpoint'],
      winRate: 82, profitFactor: 3.4, avgWin: 95, avgLoss: -40,
      examples: [
        { symbol: 'GBPUSD', date: '10/18/2024', pnl: 100, status: 'Long' },
        { symbol: 'EURUSD', date: '10/19/2024', pnl: 80, status: 'Long' }
      ],
      graph: [20, 30, 28, 45, 50, 60, 58, 75, 80, 90, 88, 100, 105, 112, 110, 118]
    },
    {
      id: 's3', name: 'EMA Trend Follow', direction: 'Trend', session: 'NY',
      tags: ['Trend', 'Trend'], pnl: 150, winrate: 68.4, trades: 11,
      description: `EMA Trend Follow rides established trends by entering on pullbacks to a fast-moving average while the broader trend stays intact.`,
      setup: ['Confirm 20 EMA is sloping clearly in one direction', 'Wait for price to pull back to the 20 EMA', 'Enter on the first bullish or bearish rejection candle'],
      entryRules: ['Price pulls back to the 20 EMA', 'Trend EMA still sloping in trade direction', 'Rejection candle confirms continuation'],
      checklist: ['Trend EMA sloping clearly', 'Price tagged the 20 EMA', 'Rejection candle formed', 'Risk:reward at least 1:2'],
      winRate: 68, profitFactor: 2.1, avgWin: 130, avgLoss: -70,
      examples: [
        { symbol: 'USDJPY', date: '10/20/2024', pnl: 90, status: 'Long' },
        { symbol: 'EURUSD', date: '10/21/2024', pnl: 60, status: 'Long' }
      ],
      graph: [10, 15, 12, 22, 30, 28, 40, 45, 42, 55, 60, 58, 70, 75, 72, 85]
    },
    {
      id: 's4', name: 'VWAP Fade', direction: 'Short', session: 'London',
      tags: ['Short', 'Breakout'], pnl: -200, winrate: 72.3, trades: 2,
      description: `A London-session variant of the VWAP Fade, tested on lower liquidity hours; results show the edge weakens outside the NY session.`,
      setup: ['Same VWAP deviation trigger as the primary VWAP Fade', 'Reduced position size due to thinner liquidity', 'Tighter stop given wider spreads in this session'],
      entryRules: ['VWAP deviation greater than 2%', 'Confirm spread is within normal range', 'Reduce size by 50% versus NY session'],
      checklist: ['VWAP Deviation > 2%', 'Spread within normal range', 'Position size reduced', 'No major London news pending'],
      winRate: 72, profitFactor: 0.6, avgWin: 60, avgLoss: -130,
      examples: [
        { symbol: 'GBPJPY', date: '10/12/2024', pnl: -100, status: 'Short' },
        { symbol: 'EURGBP', date: '10/14/2024', pnl: -100, status: 'Short' }
      ],
      graph: [50, 45, 48, 40, 35, 38, 30, 25, 28, 20, 18, 15, 12, 10, 8, 5]
    },
    {
      id: 's5', name: 'EMA Trend Follow', direction: 'Short', session: 'Trend',
      tags: ['Short', 'Trend'], pnl: 50, winrate: 76.0, trades: 4,
      description: `A short-bias adaptation of EMA Trend Follow used specifically in confirmed downtrends, fading rallies back into the EMA.`,
      setup: ['Confirm 20 EMA sloping downward across multiple timeframes', 'Wait for a rally back up to the EMA', 'Enter on bearish rejection at the EMA'],
      entryRules: ['EMA slope confirmed bearish', 'Price rallies into EMA resistance', 'Bearish rejection candle confirms'],
      checklist: ['EMA sloping down', 'Price rallied to EMA', 'Bearish rejection formed', 'Risk:reward at least 1:2'],
      winRate: 76, profitFactor: 2.0, avgWin: 70, avgLoss: -35,
      examples: [
        { symbol: 'AUDUSD', date: '10/9/2024', pnl: 30, status: 'Short' },
        { symbol: 'NZDUSD', date: '10/10/2024', pnl: 20, status: 'Short' }
      ],
      graph: [5, 10, 8, 18, 22, 20, 30, 35, 32, 42, 45, 43, 52, 55, 53, 60]
    },
    {
      id: 's6', name: 'VWAP Fade', direction: 'Short', session: 'Trend',
      tags: ['Short', 'Trend'], pnl: -100, winrate: 50.0, trades: 2,
      description: `An experimental combination of VWAP Fade entries filtered by trend direction; sample size is still too small to draw firm conclusions.`,
      setup: ['Apply standard VWAP Fade trigger only when higher-timeframe trend agrees', 'Skip counter-trend fades entirely', 'Track results separately from the base strategy'],
      entryRules: ['VWAP deviation greater than 2%', 'Higher-timeframe trend agrees with fade direction', 'Skip if trend conflicts'],
      checklist: ['VWAP Deviation > 2%', 'HTF trend alignment confirmed', 'Sample size noted as small', 'Review after 20 trades'],
      winRate: 50, profitFactor: 0.9, avgWin: 80, avgLoss: -90,
      examples: [
        { symbol: 'EURUSD', date: '10/5/2024', pnl: -50, status: 'Short' },
        { symbol: 'GBPUSD', date: '10/6/2024', pnl: -50, status: 'Short' }
      ],
      graph: [30, 28, 32, 25, 27, 20, 22, 18, 20, 15, 17, 12, 14, 10, 11, 8]
    },
    {
      id: 's7', name: 'VWAP Fade', direction: 'Short', session: 'Trend',
      tags: ['Short', 'Trend'], pnl: 220, winrate: 75.3, trades: 2,
      description: `A trend-filtered VWAP Fade variant that only trades fades aligned with the dominant daily trend, improving consistency over the base version.`,
      setup: ['Confirm daily trend direction before looking for fades', 'Apply standard VWAP Fade trigger in that direction only', 'Hold for a full mean-reversion target back to VWAP'],
      entryRules: ['VWAP deviation greater than 2%', 'Daily trend agrees with fade direction', 'Target set at VWAP'],
      checklist: ['VWAP Deviation > 2%', 'Daily trend alignment confirmed', 'Target set at VWAP', 'Stop beyond recent swing'],
      winRate: 75, profitFactor: 2.5, avgWin: 140, avgLoss: -55,
      examples: [
        { symbol: 'GBPJPY', date: '10/3/2024', pnl: 110, status: 'Short' },
        { symbol: 'EURJPY', date: '10/4/2024', pnl: 110, status: 'Short' }
      ],
      graph: [15, 20, 18, 28, 35, 32, 45, 50, 48, 60, 65, 62, 75, 80, 78, 92]
    },
    {
      id: 's8', name: 'VWAP Fade', direction: 'Short', session: 'NY',
      tags: ['Short', 'NY'], pnl: null, winrate: null, trades: 0,
      description: `A newly added strategy slot with no logged trades yet — use this to track a fresh idea before committing real size.`,
      setup: ['Define the exact entry trigger for this idea', 'Decide on session and instrument scope', 'Log the first few trades as test cases before scaling size'],
      entryRules: ['To be defined after first test trades'],
      checklist: ['Entry trigger defined', 'Session scope defined', 'Risk per trade set', 'Review after 10 trades'],
      winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0,
      examples: [],
      graph: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
    }
  ];

  let activeId = 's1';

  // ---------------------------------------------------------
  // Element refs
  // ---------------------------------------------------------
  const tableBody = document.getElementById('strategyTableBody');

  const detailName = document.getElementById('detailName');
  const detailDirection = document.getElementById('detailDirection');
  const detailSession = document.getElementById('detailSession');
  const detailDescription = document.getElementById('detailDescription');
  const detailChecklist = document.getElementById('detailChecklist');

  const statWinRate = document.getElementById('statWinRate');
  const statProfitFactor = document.getElementById('statProfitFactor');
  const statAvgWinLoss = document.getElementById('statAvgWinLoss');

  const exampleTradesBody = document.getElementById('exampleTradesBody');
  const graphStrategyName = document.getElementById('graphStrategyName');
  const strategyGraph = document.getElementById('strategyGraph');

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatSigned(value) {
    if (value === null || value === undefined) return '—';
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  }

  function tagClass(tag) {
    const t = tag.toLowerCase();
    if (t === 'short') return 'tag-short';
    if (t === 'long') return 'tag-long';
    return 'tag-neutral';
  }

  // ---------------------------------------------------------
  // Render strategy list
  // ---------------------------------------------------------
  function renderStrategyTable() {
    tableBody.innerHTML = '';
    strategies.forEach((s) => {
      const tr = document.createElement('tr');
      tr.dataset.id = s.id;
      tr.className = s.id === activeId ? 'active-row' : '';
      tr.innerHTML = `
        <td>
          <div class="strategy-name-cell">
            <span class="name">${escapeHtml(s.name)}</span>
            <span class="tag-row">${s.tags.map((t) => `<span class="tag ${tagClass(t)}">${escapeHtml(t)}</span>`).join('')}</span>
          </div>
        </td>
        <td class="${s.pnl === null ? '' : s.pnl >= 0 ? 'pnl-cell positive' : 'pnl-cell negative'}">${s.pnl === null ? '—' : formatSigned(s.pnl)}</td>
        <td>${s.trades === 0 ? '—' : s.winrate.toFixed(1) + '%'}</td>
        <td>${s.trades}</td>
        <td class="actions-col">
          <div class="row-actions">
            <button class="action-btn edit" title="Edit strategy" data-action="edit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4v16h16v-7"/><path d="M17.5 3.5a1.5 1.5 0 0 1 2 2L11 14l-4 1 1-4z"/></svg>
            </button>
            <button class="action-btn delete" title="Delete strategy" data-action="delete">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ---------------------------------------------------------
  // Render strategy detail (right column)
  // ---------------------------------------------------------
  function renderDetail() {
    const s = strategies.find((x) => x.id === activeId);
    if (!s) return;

    detailName.textContent = s.name;
    detailDirection.textContent = `Direction: ${s.direction}`;
    detailSession.textContent = `Session: ${s.session}`;

    detailDescription.innerHTML = `
      <p>${escapeHtml(s.description)}</p>
      <p><strong>Setup</strong></p>
      <ul>${s.setup.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
      <p><strong>Entry criteria</strong></p>
      <ul>${s.entryRules.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
    `;

    detailChecklist.innerHTML = s.checklist.map((item) =>
      `<li><label><input type="checkbox" checked /> ${escapeHtml(item)}</label></li>`
    ).join('');

    statWinRate.textContent = s.trades === 0 ? '—' : `${s.winRate}%`;
    statProfitFactor.textContent = s.trades === 0 ? '—' : s.profitFactor.toFixed(1);
    statAvgWinLoss.innerHTML = s.trades === 0
      ? '—'
      : `<span class="text-green">${formatSigned(s.avgWin)}</span> / <span class="text-red">${formatSigned(s.avgLoss)}</span>`;

    if (s.examples.length === 0) {
      exampleTradesBody.innerHTML = `<tr><td colspan="4" class="empty-state" style="padding:16px 10px;">No example trades attached yet.</td></tr>`;
    } else {
      exampleTradesBody.innerHTML = s.examples.map((e) => `
        <tr>
          <td>${escapeHtml(e.symbol)}</td>
          <td>${escapeHtml(e.date)}</td>
          <td class="${e.pnl >= 0 ? 'pnl-cell positive' : 'pnl-cell negative'}">${formatSigned(e.pnl)}</td>
          <td><span class="status-pill ${e.status.toLowerCase()}">${escapeHtml(e.status)}</span></td>
        </tr>
      `).join('');
    }

    graphStrategyName.textContent = s.name;
    renderGraph(s.graph);
  }

  // ---------------------------------------------------------
  // Render the equity-curve-style SVG line graph
  // ---------------------------------------------------------
  function renderGraph(points) {
    const w = 320, h = 160, pad = 10;
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

    strategyGraph.innerHTML = `
      <defs>
        <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#graphFill)" stroke="none"></path>
      <path d="${linePath}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    `;
  }

  // ---------------------------------------------------------
  // Row click -> select strategy
  // ---------------------------------------------------------
  tableBody.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.action-btn');
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = tr.dataset.id;

    if (actionBtn) {
      const s = strategies.find((x) => x.id === id);
      if (actionBtn.dataset.action === 'delete') {
        if (confirm(`Delete the "${s.name}" strategy entry?`)) {
          strategies = strategies.filter((x) => x.id !== id);
          if (activeId === id && strategies.length) activeId = strategies[0].id;
          renderStrategyTable();
          renderDetail();
        }
      } else if (actionBtn.dataset.action === 'edit') {
        const newName = prompt('Edit strategy name', s.name);
        if (newName && newName.trim()) {
          s.name = newName.trim();
          renderStrategyTable();
          renderDetail();
        }
      }
      return;
    }

    activeId = id;
    renderStrategyTable();
    renderDetail();
  });

  // ---------------------------------------------------------
  // New Strategy button
  // ---------------------------------------------------------
  document.getElementById('newStrategyBtn').addEventListener('click', () => {
    const name = prompt('Name your new strategy', 'New Strategy');
    if (!name || !name.trim()) return;

    const newStrategy = {
      id: 's' + (strategies.length + 1) + '-' + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      direction: 'Long',
      session: 'NY',
      tags: ['New'],
      pnl: null,
      winrate: null,
      trades: 0,
      description: 'Describe the core idea behind this strategy.',
      setup: ['Define your setup conditions here.'],
      entryRules: ['Define your entry rules here.'],
      checklist: ['Define your checklist items here.'],
      winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0,
      examples: [],
      graph: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
    };

    strategies.unshift(newStrategy);
    activeId = newStrategy.id;
    renderStrategyTable();
    renderDetail();
  });

  // ---------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------
  let sortState = { key: null, dir: 'asc' };
  document.querySelectorAll('#strategyTable thead th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      sortState = sortState.key === key ? { key, dir: sortState.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' };
      const mult = sortState.dir === 'asc' ? 1 : -1;
      strategies.sort((a, b) => {
        let av = a[key === 'name' ? 'name' : key];
        let bv = b[key === 'name' ? 'name' : key];
        if (av === null) av = -Infinity;
        if (bv === null) bv = -Infinity;
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return -1 * mult;
        if (av > bv) return 1 * mult;
        return 0;
      });
      renderStrategyTable();
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
  renderStrategyTable();
  renderDetail();
})();
