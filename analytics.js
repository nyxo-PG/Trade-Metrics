// ============================================================
// Trade-Metrix · Analytics & Statistics — analytics.js
// ============================================================

(function () {
  'use strict';

  // ---------------------------------------------------------
  // 1. Session performance rings
  // ---------------------------------------------------------
  function initRings() {
    document.querySelectorAll('.ring').forEach((svg) => {
      const pct = parseFloat(svg.dataset.pct) || 0;
      const max = parseFloat(svg.dataset.max) || 10;
      const circle = svg.querySelector('.ring-progress');
      const radius = 42;
      const circumference = 2 * Math.PI * radius;
      const ratio = Math.min(Math.abs(pct) / max, 1);

      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${circumference}`;

      // animate in on next frame
      requestAnimationFrame(() => {
        circle.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
      });
    });
  }

  // ---------------------------------------------------------
  // 2. Heatmap calendar (Daily P&L)
  // ---------------------------------------------------------
  const calGrid = document.getElementById('calGrid');
  const calMonthLabel = document.getElementById('calMonthLabel');
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');

  // Seed daily P&L data keyed by "YYYY-M-D" (month is 0-indexed)
  // Matches the mock-up's November 2024 heat pattern.
  const dailyPnl = {
    '2024-10-1': 480,
    '2024-10-2': 1240,
    '2024-10-3': 2100,
    '2024-10-4': 90,
    '2024-10-5': -60,
    '2024-10-6': 30,
    '2024-10-7': -150,
    '2024-10-8': 60,
    '2024-10-9': -1900,
    '2024-10-10': 120,
    '2024-10-11': 210,
    '2024-10-12': -40,
    '2024-10-13': 700,
    '2024-10-14': -300,
    '2024-10-15': 50,
    '2024-10-16': 90,
    '2024-10-17': 1500,
    '2024-10-18': -2200,
    '2024-10-19': 320,
    '2024-10-20': -80,
    '2024-10-21': 40,
    '2024-10-22': 60,
    '2024-10-23': -120,
    '2024-10-24': 980,
    '2024-10-25': 150,
    '2024-10-26': -200,
    '2024-10-28': -3100
  };

  let calViewDate = new Date(2024, 10, 1); // November 2024 (month index 10)

  function heatClass(value) {
    if (value === undefined) return 'heat-0';
    if (value === 0) return 'heat-0';
    if (value > 0) {
      if (value >= 1000) return 'heat-pos-3';
      if (value >= 300) return 'heat-pos-2';
      return 'heat-pos-1';
    }
    if (value <= -1000) return 'heat-neg-3';
    if (value <= -300) return 'heat-neg-2';
    return 'heat-neg-1';
  }

  function renderCalendar() {
    const year = calViewDate.getFullYear();
    const month = calViewDate.getMonth();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    calMonthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calGrid.innerHTML = '';

    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      calGrid.appendChild(el);
    });

    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'cal-cell empty';
      calGrid.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${month}-${day}`;
      const value = dailyPnl[key];
      const el = document.createElement('div');
      el.className = `cal-cell ${heatClass(value)}`;
      el.textContent = day;
      if (value !== undefined) {
        const sign = value > 0 ? '+' : '';
        el.title = `${sign}$${value.toLocaleString('en-US')}`;
      }
      calGrid.appendChild(el);
    }
  }

  calPrev.addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() - 1);
    calViewDate = new Date(calViewDate);
    renderCalendar();
  });

  calNext.addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() + 1);
    calViewDate = new Date(calViewDate);
    renderCalendar();
  });

  // ---------------------------------------------------------
  // 3. Performance Breakdown by Symbol — table
  // ---------------------------------------------------------
  let breakdown = [
    { id: id(), symbol: 'EURUSD', trades: 20, winrate: 68.4, pf: 3.2, dd: -5.2, pnl: 1250 },
    { id: id(), symbol: 'GBPJPY', trades: 15, winrate: 82.0, pf: 1.0, dd: -5.2, pnl: 1200 },
    { id: id(), symbol: 'GBPJPY', trades: 14, winrate: 68.4, pf: 1.0, dd: -5.2, pnl: 1200 }
  ];

  function id() {
    return 'row-' + Math.random().toString(36).slice(2, 9);
  }

  let sortState = { key: null, dir: 'asc' };
  let filterText = '';

  const tableBody = document.getElementById('breakdownTableBody');
  const emptyState = document.getElementById('emptyState');
  const filterInput = document.getElementById('filterInput');

  function formatCurrency(value) {
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    const abs = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${sign}$${abs}`;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getSortedFiltered() {
    let list = breakdown.slice();

    if (filterText.trim()) {
      const q = filterText.trim().toLowerCase();
      list = list.filter((r) => r.symbol.toLowerCase().includes(q));
    }

    if (sortState.key) {
      const mult = sortState.dir === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        let av = a[sortState.key];
        let bv = b[sortState.key];
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return -1 * mult;
        if (av > bv) return 1 * mult;
        return 0;
      });
    }

    return list;
  }

  function renderTable() {
    const list = getSortedFiltered();
    tableBody.innerHTML = '';
    emptyState.hidden = list.length !== 0;

    list.forEach((row) => {
      const tr = document.createElement('tr');
      tr.dataset.id = row.id;
      tr.innerHTML = `
        <td>${escapeHtml(row.symbol)}</td>
        <td>${row.trades}</td>
        <td>${row.winrate.toFixed(1)}%</td>
        <td>${row.pf.toFixed(1)}</td>
        <td class="text-red">${row.dd.toFixed(1)}%</td>
        <td class="pnl-cell ${row.pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(row.pnl)}</td>
        <td class="actions-col">
          <div class="row-actions">
            <button class="action-btn edit" title="Edit row" data-action="edit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4v16h16v-7"/><path d="M17.5 3.5a1.5 1.5 0 0 1 2 2L11 14l-4 1 1-4z"/></svg>
            </button>
            <button class="action-btn delete" title="Delete row" data-action="delete">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  document.querySelectorAll('#breakdownTable thead th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortState.key === key) {
        sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
      } else {
        sortState.key = key;
        sortState.dir = 'asc';
      }
      renderTable();
    });
  });

  filterInput.addEventListener('input', (e) => {
    filterText = e.target.value;
    renderTable();
  });

  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.action-btn');
    if (!btn) return;
    const tr = btn.closest('tr');
    const rowId = tr.dataset.id;
    const row = breakdown.find((r) => r.id === rowId);
    if (!row) return;

    if (btn.dataset.action === 'delete') {
      if (confirm(`Remove ${row.symbol} from the breakdown?`)) {
        breakdown = breakdown.filter((r) => r.id !== rowId);
        renderTable();
      }
    } else if (btn.dataset.action === 'edit') {
      const newWinrate = prompt(`Edit win rate % for ${row.symbol}`, row.winrate);
      if (newWinrate !== null && !isNaN(parseFloat(newWinrate))) {
        row.winrate = parseFloat(newWinrate);
        renderTable();
      }
    }
  });

  // ---------------------------------------------------------
  // Init
  // ---------------------------------------------------------
  initRings();
  renderCalendar();
  renderTable();
})();