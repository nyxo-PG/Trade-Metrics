// ============================================================
// Trade-Metrix · Trade Log (Journal) — script.js
// ============================================================

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Seed data (mirrors the mock-up's sample rows)
  // ---------------------------------------------------------
  let trades = [
    {
      id: cryptoRandomId(),
      symbol: 'EURUSD',
      dateOpen: '2024-11-21T13:00',
      direction: 'Long',
      pnl: 1200,
      lot: 1.00,
      strategy: 'Breakout',
      emotion: 'Confident',
      notes: 'Clean trend entry, followed the plan.'
    },
    {
      id: cryptoRandomId(),
      symbol: 'GBPJPY',
      dateOpen: '2024-11-21T13:00',
      direction: 'Manual',
      pnl: 1200,
      lot: 1.00,
      strategy: 'Reversal',
      emotion: 'Patient',
      notes: 'Waited for the retest before entering.'
    },
    {
      id: cryptoRandomId(),
      symbol: 'GBPJPY',
      dateOpen: '2024-11-21T13:00',
      direction: 'Manual',
      pnl: -350,
      lot: 1.00,
      strategy: 'Reversal',
      emotion: 'Hesitant',
      notes: 'Hesitated on the exit, gave back profit.'
    }
  ];

  let sortState = { key: 'date', dir: 'desc' };
  let filterText = '';

  // ---------------------------------------------------------
  // Element refs
  // ---------------------------------------------------------
  const form = document.getElementById('trade-form');
  const tableBody = document.getElementById('tradeTableBody');
  const emptyState = document.getElementById('emptyState');
  const filterInput = document.getElementById('filterInput');
  const directionToggle = document.getElementById('directionToggle');
  const swapSymbolBtn = document.getElementById('swapSymbol');
  const symbolSelect = document.getElementById('symbol');
  const pnlPreview = document.getElementById('pnlPreview');

  const entryPriceEl = document.getElementById('entryPrice');
  const exitPriceEl = document.getElementById('exitPrice');
  const lotSizeEl = document.getElementById('lotSize');
  const feesEl = document.getElementById('fees');

  let currentDirection = 'Long';

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------
  function cryptoRandomId() {
    return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function formatCurrency(value) {
    const sign = value < 0 ? '-' : '+';
    const abs = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${value === 0 ? '' : sign}$${abs}`;
  }

  function formatPlainCurrency(value) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  function calcLivePnl() {
    const entry = parseFloat(entryPriceEl.value) || 0;
    const exit = parseFloat(exitPriceEl.value) || 0;
    const lot = parseFloat(lotSizeEl.value) || 0;
    const fees = parseFloat(feesEl.value) || 0;

    // Simplified P&L model: (exit - entry) * lot * 1000 - fees, sign flips on Short
    let raw = (exit - entry) * lot * 1000;
    if (currentDirection === 'Short') raw = -raw;
    const net = raw - fees;
    return net;
  }

  function updatePnlPreview() {
    const value = calcLivePnl();
    pnlPreview.textContent = formatCurrency(value);
    pnlPreview.classList.toggle('negative', value < 0);
  }

  // ---------------------------------------------------------
  // Direction segmented control
  // ---------------------------------------------------------
  directionToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.segment');
    if (!btn) return;
    directionToggle.querySelectorAll('.segment').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    currentDirection = btn.dataset.value;
    updatePnlPreview();
  });

  // ---------------------------------------------------------
  // Symbol swap button (flips base/quote, purely cosmetic)
  // ---------------------------------------------------------
  swapSymbolBtn.addEventListener('click', () => {
    const val = symbolSelect.value;
    const parts = val.split('/');
    if (parts.length === 2) {
      const newOption = `${parts[1]}/${parts[0]}`;
      let existing = Array.from(symbolSelect.options).find((o) => o.value === newOption);
      if (!existing) {
        existing = document.createElement('option');
        existing.value = newOption;
        existing.textContent = newOption;
        symbolSelect.appendChild(existing);
      }
      symbolSelect.value = newOption;
    }
  });

  // ---------------------------------------------------------
  // Live P&L recalculation
  // ---------------------------------------------------------
  [entryPriceEl, exitPriceEl, lotSizeEl, feesEl].forEach((el) => {
    el.addEventListener('input', updatePnlPreview);
  });

  // ---------------------------------------------------------
  // Render table
  // ---------------------------------------------------------
  function getSortedFilteredTrades() {
    let list = trades.slice();

    if (filterText.trim()) {
      const q = filterText.trim().toLowerCase();
      list = list.filter((t) =>
        [t.symbol, t.direction, t.strategy, t.emotion, t.notes]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    const { key, dir } = sortState;
    const mult = dir === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      let av, bv;
      switch (key) {
        case 'symbol': av = a.symbol; bv = b.symbol; break;
        case 'date': av = a.dateOpen; bv = b.dateOpen; break;
        case 'direction': av = a.direction; bv = b.direction; break;
        case 'pnl': av = a.pnl; bv = b.pnl; break;
        case 'lot': av = a.lot; bv = b.lot; break;
        case 'strategy': av = a.strategy; bv = b.strategy; break;
        case 'emotion': av = a.emotion; bv = b.emotion; break;
        case 'notes': av = a.notes; bv = b.notes; break;
        default: av = a.dateOpen; bv = b.dateOpen;
      }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return -1 * mult;
      if (av > bv) return 1 * mult;
      return 0;
    });

    return list;
  }

  function directionBadgeClass(direction) {
    if (direction === 'Long') return 'long';
    if (direction === 'Short') return 'short';
    return 'manual';
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  }

  function renderTable() {
    const list = getSortedFilteredTrades();
    tableBody.innerHTML = '';

    if (list.length === 0) {
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
    }

    list.forEach((t) => {
      const tr = document.createElement('tr');
      tr.dataset.id = t.id;

      tr.innerHTML = `
        <td>${escapeHtml(t.symbol)}</td>
        <td>${formatDate(t.dateOpen)}</td>
        <td><span class="direction-badge ${directionBadgeClass(t.direction)}">${escapeHtml(t.direction)}</span></td>
        <td class="pnl-cell ${t.pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(t.pnl)}</td>
        <td>${t.lot.toFixed(2)}</td>
        <td>${escapeHtml(t.strategy) || '—'}</td>
        <td>${escapeHtml(t.emotion) || '—'}</td>
        <td>
          <span class="expand-cell" title="${escapeHtml(t.notes)}">
            ${escapeHtml(truncate(t.notes, 18)) || 'Expand in note'}
          </span>
        </td>
        <td class="actions-col">
          <div class="row-actions">
            <button class="action-btn edit" title="Edit trade" data-action="edit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4v16h16v-7"/><path d="M17.5 3.5a1.5 1.5 0 0 1 2 2L11 14l-4 1 1-4z"/></svg>
            </button>
            <button class="action-btn delete" title="Delete trade" data-action="delete">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------------------------------------------------------
  // Sorting via header clicks
  // ---------------------------------------------------------
  document.querySelectorAll('#tradeTable thead th[data-sort]').forEach((th) => {
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

  // ---------------------------------------------------------
  // Filter input
  // ---------------------------------------------------------
  filterInput.addEventListener('input', (e) => {
    filterText = e.target.value;
    renderTable();
  });

  // ---------------------------------------------------------
  // Row actions: edit (loads into form) / delete
  // ---------------------------------------------------------
  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.action-btn');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr.dataset.id;
    const trade = trades.find((t) => t.id === id);
    if (!trade) return;

    if (btn.dataset.action === 'delete') {
      if (confirm(`Delete the ${trade.symbol} trade from ${formatDate(trade.dateOpen)}?`)) {
        trades = trades.filter((t) => t.id !== id);
        renderTable();
      }
    } else if (btn.dataset.action === 'edit') {
      loadTradeIntoForm(trade);
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  function loadTradeIntoForm(trade) {
    document.getElementById('strategy').value = trade.strategy || '';
    document.getElementById('emotion').value = trade.emotion || '';
    document.getElementById('notes').value = trade.notes || '';
    lotSizeEl.value = trade.lot;

    // Best-effort symbol match
    const opt = Array.from(symbolSelect.options).find(
      (o) => o.value.replace('/', '') === trade.symbol
    );
    if (opt) symbolSelect.value = opt.value;

    directionToggle.querySelectorAll('.segment').forEach((s) => {
      s.classList.toggle('active', s.dataset.value === trade.direction);
    });
    currentDirection = trade.direction;

    // Tag the form so submit knows we're editing
    form.dataset.editingId = trade.id;
    updatePnlPreview();
  }

  // ---------------------------------------------------------
  // Form submit: add (or save edit of) a trade
  // ---------------------------------------------------------
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dateOpenInput = document.getElementById('dateOpen').value || new Date().toISOString().slice(0, 10);
    const symbol = symbolSelect.value.replace('/', '');
    const strategy = document.getElementById('strategy').value.trim();
    const emotion = document.getElementById('emotion').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const lot = parseFloat(lotSizeEl.value) || 0;
    const pnl = calcLivePnl();

    const editingId = form.dataset.editingId;

    if (editingId) {
      const trade = trades.find((t) => t.id === editingId);
      if (trade) {
        Object.assign(trade, {
          symbol,
          dateOpen: `${dateOpenInput}T${new Date().toTimeString().slice(0, 5)}`,
          direction: currentDirection,
          pnl,
          lot,
          strategy,
          emotion,
          notes
        });
      }
      delete form.dataset.editingId;
    } else {
      trades.unshift({
        id: cryptoRandomId(),
        symbol,
        dateOpen: `${dateOpenInput}T${new Date().toTimeString().slice(0, 5)}`,
        direction: currentDirection,
        pnl,
        lot,
        strategy,
        emotion,
        notes
      });
    }

    renderTable();
    form.reset();
    document.getElementById('dateOpen').value = dateOpenInput;
    directionToggle.querySelectorAll('.segment').forEach((s) => s.classList.remove('active'));
    directionToggle.querySelector('.segment[data-value="Long"]').classList.add('active');
    currentDirection = 'Long';
    updatePnlPreview();
  });

  // ---------------------------------------------------------
  // Init
  // ---------------------------------------------------------
  updatePnlPreview();
  renderTable();
})();