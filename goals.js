// ============================================================
// Trade-Metrix · Goals & Risk Management — goals.js
// ============================================================

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Goal progress rings
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
  // Risk Per Trade slider
  // ---------------------------------------------------------
  const riskSlider = document.getElementById('riskPerTradeFull');
  const riskLabel = document.getElementById('riskPerTradeLabel');
  if (riskSlider) {
    riskSlider.addEventListener('input', () => {
      riskLabel.textContent = `${parseFloat(riskSlider.value).toFixed(1)}%`;
    });
  }

  // ---------------------------------------------------------
  // Stop Loss / Take Profit ratio slider
  // ---------------------------------------------------------
  const slTpSlider = document.getElementById('slTpDefaults');
  const slTpLabel = document.getElementById('slTpLabel');
  if (slTpSlider) {
    slTpSlider.addEventListener('input', () => {
      slTpLabel.textContent = `1:${parseFloat(slTpSlider.value).toFixed(1)}`;
    });
  }

  // ---------------------------------------------------------
  // Recent Daily Goals table
  // ---------------------------------------------------------
  let goals = [
    { name: 'Daily Profit Goal', date: 'Dec 24, 2024', target: '$500', status: 'Achieved' },
    { name: 'Weekly Daily Goal', date: 'Nov 21, 2024', target: '$2500', status: 'Failed' },
    { name: 'Monthly Goal', date: 'Sep 23, 2024', target: '$10000', status: 'Achieved' },
    { name: 'Daily Profit Goal', date: 'Sep 20, 2024', target: '$500', status: 'In Progress' },
    { name: 'Weekly Daily Goal', date: 'Sep 14, 2024', target: '$2500', status: 'Achieved' }
  ];

  const goalsTableBody = document.getElementById('goalsTableBody');

  function statusClass(status) {
    const s = status.toLowerCase().replace(' ', '-');
    return s;
  }

  function renderGoalsTable() {
    goalsTableBody.innerHTML = goals.map((g) => `
      <tr>
        <td>${g.name}</td>
        <td>${g.date}</td>
        <td>${g.target}</td>
        <td><span class="status-pill ${statusClass(g.status)}">${g.status}</span></td>
      </tr>
    `).join('');
  }

  let sortState = { key: null, dir: 'asc' };
  document.querySelectorAll('#goalsTable thead th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      sortState = sortState.key === key ? { key, dir: sortState.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' };
      const mult = sortState.dir === 'asc' ? 1 : -1;
      goals.sort((a, b) => {
        const map = { name: 'name', date: 'date', target: 'target', status: 'status' };
        let av = a[map[key]].toLowerCase();
        let bv = b[map[key]].toLowerCase();
        if (av < bv) return -1 * mult;
        if (av > bv) return 1 * mult;
        return 0;
      });
      renderGoalsTable();
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
  initRings();
  renderGoalsTable();
})();
