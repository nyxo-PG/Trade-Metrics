// ============================================================
// Trade-Metrix · Calendar View — calendar.js
// ============================================================

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Seed data: per-day trade summary for the visible month
  // key: "YYYY-M-D" (month 0-indexed)
  // ---------------------------------------------------------
  const dayData = {
    '2024-10-1':  { trades: 5, pnl: 450 },
    '2024-10-2':  { trades: 3, pnl: 450 },
    '2024-10-3':  { trades: 1, pnl: -50 },
    '2024-10-4':  { trades: 5, pnl: 100 },
    '2024-10-6':  { trades: 5, pnl: 100 },
    '2024-10-7':  { trades: 5, pnl: 500 },
    '2024-10-8':  { trades: 3, pnl: 400 },
    '2024-10-9':  { trades: 6, pnl: 250 },
    '2024-10-11': { trades: 3, pnl: 200 },
    '2024-10-12': { trades: 3, pnl: 100 },
    '2024-10-13': { trades: 4, pnl: 380, streak: true },
    '2024-10-14': { trades: 4, pnl: 410, streak: true },
    '2024-10-15': { trades: 4, pnl: 390, streak: true },
    '2024-10-16': { trades: 1, pnl: -50 },
    '2024-10-18': { trades: 3, pnl: 250 },
    '2024-10-19': { trades: 5, pnl: 250 },
    '2024-10-20': { trades: 1, pnl: -80 },
    '2024-10-21': { trades: 3, pnl: 100 },
    '2024-10-22': { trades: 3, pnl: 200 },
    '2024-10-23': { trades: 5, pnl: 250 },
    '2024-10-25': { trades: 3, pnl: 150 },
    '2024-10-26': { trades: 1, pnl: -90 },
    '2024-10-27': { trades: 1, pnl: 0 },
    '2024-10-28': { trades: 5, pnl: 250 },
    '2024-10-29': { trades: 3, pnl: 400 }
  };

  // Per-day trade list (for the rail detail) — sample for the default selected day
  const dayTrades = {
    '2024-10-15': [
      { symbol: 'EURUSD', pnl: 250 },
      { symbol: 'GBPJPY', pnl: 140 }
    ],
    '2024-10-13': [
      { symbol: 'EURUSD', pnl: 180 },
      { symbol: 'USDJPY', pnl: 200 }
    ]
  };

  let viewDate = new Date(2024, 10, 1); // November 2024
  let selectedKey = '2024-10-15';

  const monthGrid = document.getElementById('monthGrid');
  const monthLabel = document.getElementById('monthLabel');
  const monthPrev = document.getElementById('monthPrev');
  const monthNext = document.getElementById('monthNext');
  const selectedDayLabel = document.getElementById('selectedDayLabel');
  const dayRailDetail = document.getElementById('dayRailDetail');

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function pnlClass(pnl) {
    if (pnl === undefined) return '';
    if (pnl === 0) return '';
    if (pnl > 0) {
      if (pnl >= 400) return 'profit-high';
      if (pnl >= 150) return 'profit-mid';
      return 'profit-low';
    }
    if (pnl <= -80) return 'loss-mid';
    return 'loss-low';
  }

  function formatSigned(value) {
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}$${Math.abs(value)}`;
  }

  // Render a 6-column Mon-Sat grid (mirrors the mock-up's layout, which omits Sunday)
  function renderMonth() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    // JS getDay(): 0=Sun..6=Sat. We want columns Mon..Sat (6 cols), skip Sundays.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Build a flat list of {day, month, year, inCurrentMonth} for Mon-Sat cells only,
    // padding the start with trailing days of the previous month.
    const firstOfMonth = new Date(year, month, 1);
    let firstDow = firstOfMonth.getDay(); // 0=Sun
    // We render Mon-Sat columns; if the 1st is Sunday, treat as needing 6 lead cells (whole prev week shown minus Sunday)
    // Compute how many Mon-Sat slots precede day 1 in its week.
    let leadCells;
    if (firstDow === 0) leadCells = 6; // Sunday -> all 6 Mon-Sat slots before it are "previous"
    else leadCells = firstDow - 1; // Mon=1 -> 0 lead cells, Tue=2 -> 1, etc.

    const cells = [];

    for (let i = leadCells; i > 0; i--) {
      cells.push({ day: daysInPrevMonth - i + 1, month: month - 1, year, inCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      if (dow === 0) continue; // skip Sundays — mock-up shows Mon-Sat only
      cells.push({ day: d, month, year, inCurrentMonth: true });
    }

    // Trailing cells to complete the last row (pad to multiple of 6)
    const remainder = cells.length % 6;
    if (remainder !== 0) {
      const toAdd = 6 - remainder;
      for (let i = 1; i <= toAdd; i++) {
        cells.push({ day: i, month: month + 1, year, inCurrentMonth: false });
      }
    }

    monthGrid.innerHTML = '';

    cells.forEach((cell) => {
      const normMonth = ((cell.month % 12) + 12) % 12;
      const key = `${cell.year}-${normMonth}-${cell.day}`;
      const data = cell.inCurrentMonth ? dayData[key] : undefined;

      const el = document.createElement('div');
      el.className = `day-cell ${cell.inCurrentMonth ? '' : 'other-month'} ${pnlClass(data?.pnl)}`.trim();
      el.dataset.key = key;

      if (key === selectedKey) el.classList.add('selected');

      let metaHtml = '';
      if (data) {
        const dir = data.pnl > 0 ? 'up' : data.pnl < 0 ? 'down' : 'flat';
        const arrow = dir === 'up' ? '↗' : dir === 'down' ? '↘' : '⇄';
        metaHtml = `<span class="day-meta ${dir}">${arrow} ${data.trades} T, ${formatSigned(data.pnl)}</span>`;
      }

      const streakHtml = data?.streak ? `<span class="day-streak-tag">5-Day Win Streak</span>` : '';

      el.innerHTML = `
        <span class="day-num">${cell.day}</span>
        ${metaHtml}
        ${streakHtml}
      `;

      if (cell.inCurrentMonth) {
        el.addEventListener('click', () => {
          selectedKey = key;
          renderMonth();
          renderDayRail();
        });
      } else {
        el.classList.add('empty');
      }

      monthGrid.appendChild(el);
    });
  }

  function renderDayRail() {
    const [y, m, d] = selectedKey.split('-').map(Number);
    selectedDayLabel.textContent = `${monthNames[m]} ${d}`;

    const data = dayData[selectedKey];
    const trades = dayTrades[selectedKey];

    if (!data) {
      dayRailDetail.innerHTML = `<p class="day-empty">No trades logged this day.</p>`;
      return;
    }

    let html = `
      <div class="day-stat">
        <div class="day-stat-label">Net P&amp;L</div>
        <div class="day-stat-value ${data.pnl >= 0 ? 'positive' : 'negative'}">${formatSigned(data.pnl)}</div>
      </div>
      <div class="day-stat">
        <div class="day-stat-label">Trades Taken</div>
        <div class="day-stat-value">${data.trades}</div>
      </div>
    `;

    if (trades && trades.length) {
      html += `<div class="day-stat">`;
      trades.forEach((t) => {
        html += `<div class="day-trade-mini">${t.symbol} &nbsp; <strong class="${t.pnl >= 0 ? 'day-stat-value positive' : 'day-stat-value negative'}" style="font-size:12.5px;">${formatSigned(t.pnl)}</strong></div>`;
      });
      html += `</div>`;
    }

    dayRailDetail.innerHTML = html;
  }

  monthPrev.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderMonth();
  });

  monthNext.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderMonth();
  });

  // ---------------------------------------------------------
  // Goal progress rings (reused pattern from analytics page)
  // ---------------------------------------------------------
  function initRings() {
    document.querySelectorAll('.ring').forEach((svg) => {
      const pct = parseFloat(svg.dataset.pct) || 0;
      const max = parseFloat(svg.dataset.max) || 100;
      const circle = svg.querySelector('.ring-progress');
      const radius = 42;
      const circumference = 2 * Math.PI * radius;
      const ratio = Math.min(Math.abs(pct) / max, 1);

      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${circumference}`;

      requestAnimationFrame(() => {
        circle.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
      });
    });
  }

  // ---------------------------------------------------------
  // Risk per trade slider
  // ---------------------------------------------------------
  const riskSlider = document.getElementById('riskSlider');
  const riskPctLabel = document.getElementById('riskPctLabel');
  if (riskSlider) {
    riskSlider.addEventListener('input', () => {
      riskPctLabel.textContent = `${parseFloat(riskSlider.value).toFixed(1)}%`;
    });
  }

  // ---------------------------------------------------------
  // Quick Add Trade (topbar) — jump to the Trade Log form
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
  renderMonth();
  renderDayRail();
  initRings();
})();
