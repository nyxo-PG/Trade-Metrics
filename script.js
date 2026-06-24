/* ============================================================
   TRADE-METRIX — app.js
   ============================================================ */

"use strict";

/* ── DEMO DATA ─────────────────────────────────────────────── */
const TRADES = [
  { symbol: "EURUSD", type: "Long",  pnl:  1200, status: "win"  },
  { symbol: "GBPJPY", type: "Short", pnl:  1200, status: "win"  },
  { symbol: "GBPJPY", type: "Short", pnl:  -350, status: "loss" },
  { symbol: "XAUUSD", type: "Long",  pnl:   870, status: "win"  },
  { symbol: "NAS100", type: "Long",  pnl:  -210, status: "loss" },
  { symbol: "US30",   type: "Short", pnl:   540, status: "win"  },
  { symbol: "GBPUSD", type: "Long",  pnl:   320, status: "win"  },
];

const EQUITY_DATA = {
  daily: {
    labels: ["00:00","02:00","04:00","06:00","08:00","09:00","10:00","11:00",
             "12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00",
             "20:00","21:00","22:00","23:00","00:00"],
    data:   [0,150,200,420,600,800,1100,1350,1600,2100,2700,3500,4200,
             5000,5800,6500,7400,8100,9500,10800,12450],
  },
  weekly: {
    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    data:   [0, 1800, 4200, 5900, 8400, 11000, 12450],
  },
  monthly: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    data:   [0,800,2100,3400,4800,5500,6700,7900,8800,9600,11200,12450],
  },
};

const SNAPSHOT_DATA = {
  labels: ["Today", "This Week", "This Month"],
  wins:   [3, 8, 98],
  losses: [1, 4, 37],
  be:     [0, 2, 10],
};


/* ── NAV ───────────────────────────────────────────────────── */
document.querySelectorAll(".nav-item[data-page]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.dataset.page;

    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    link.classList.add("active");

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const page = document.getElementById(`page-${target}`);
    if (page) page.classList.add("active");

    // close mobile sidebar
    document.getElementById("sidebar").classList.remove("open");
  });
});

/* ── MOBILE SIDEBAR TOGGLE ─────────────────────────────────── */
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

/* Close sidebar when clicking outside on mobile */
document.addEventListener("click", e => {
  const sidebar = document.getElementById("sidebar");
  const toggle  = document.getElementById("menuToggle");
  if (window.innerWidth <= 768 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)) {
    sidebar.classList.remove("open");
  }
});


/* ── STAT COUNTER ANIMATION ────────────────────────────────── */
function animateCount(el) {
  const target  = parseFloat(el.dataset.count);
  const prefix  = el.dataset.prefix  || "";
  const suffix  = el.dataset.suffix  || "";
  const duration = 1200;
  const start   = performance.now();

  const update = now => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value  = Math.round(eased * target);
    el.textContent = prefix + value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

document.querySelectorAll(".stat-value[data-count]").forEach(el => {
  // Trigger when card enters viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(el);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(el);
});


/* ── TRADES TABLE ──────────────────────────────────────────── */
function renderTrades() {
  const tbody = document.getElementById("tradesBody");
  tbody.innerHTML = "";

  TRADES.forEach(t => {
    const isPnlPos = t.pnl >= 0;
    const pnlStr   = (isPnlPos ? "+" : "") + "$" + Math.abs(t.pnl).toLocaleString();

    const statusLabel = { win: "Target", loss: "SL Hit", open: "Open" }[t.status] || t.status;
    const statusClass = `status-${t.status}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="symbol-badge">${t.symbol}</span></td>
      <td>${t.type}</td>
      <td class="${isPnlPos ? "pnl-pos" : "pnl-neg"}">${pnlStr}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

renderTrades();


/* ── CHART.JS SETUP ────────────────────────────────────────── */
const GREEN      = "#22c55e";
const GREEN_FADE = "rgba(34,197,94,0.12)";
const BLUE       = "#3b7ef8";
const GREY       = "#515d7a";
const TEXT_MUTED = "#8a96b0";
const TEXT_GRID  = "#2a3348";

Chart.defaults.color = TEXT_MUTED;
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size   = 11;


/* ── EQUITY CURVE CHART ────────────────────────────────────── */
const eqCtx = document.getElementById("equityChart").getContext("2d");

const equityGradient = eqCtx.createLinearGradient(0, 0, 0, 280);
equityGradient.addColorStop(0,   "rgba(34,197,94,0.28)");
equityGradient.addColorStop(1,   "rgba(34,197,94,0.00)");

let equityChart = new Chart(eqCtx, {
  type: "line",
  data: {
    labels: EQUITY_DATA.daily.labels,
    datasets: [{
      data:            EQUITY_DATA.daily.data,
      borderColor:     GREEN,
      backgroundColor: equityGradient,
      borderWidth:     2.5,
      fill:            true,
      tension:         0.4,
      pointRadius:     0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: GREEN,
      pointHoverBorderColor: "#fff",
      pointHoverBorderWidth: 2,
    }],
  },
  options: {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:  { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1c2333",
        borderColor:     "#2a3348",
        borderWidth:     1,
        padding:         10,
        titleColor:      "#8a96b0",
        bodyColor:       "#22c55e",
        callbacks: {
          label: ctx => " $" + ctx.parsed.y.toLocaleString(),
        },
      },
    },
    scales: {
      x: {
        grid:  { color: TEXT_GRID, drawBorder: false },
        ticks: { maxTicksLimit: 7 },
      },
      y: {
        grid:  { color: TEXT_GRID, drawBorder: false },
        ticks: { callback: v => "$" + (v >= 1000 ? (v/1000).toFixed(0)+"k" : v) },
      },
    },
  },
});

/* Tab switching for equity chart */
document.querySelectorAll(".tab[data-chart]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab[data-chart]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const key  = btn.dataset.chart;
    const d    = EQUITY_DATA[key];
    equityChart.data.labels         = d.labels;
    equityChart.data.datasets[0].data = d.data;
    equityChart.update("active");
  });
});


/* ── SNAPSHOT CHART ────────────────────────────────────────── */
const snCtx = document.getElementById("snapshotChart").getContext("2d");

new Chart(snCtx, {
  type: "bar",
  data: {
    labels: SNAPSHOT_DATA.labels,
    datasets: [
      {
        label: "Wins",
        data:  SNAPSHOT_DATA.wins,
        backgroundColor: BLUE,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "Losses",
        data:  SNAPSHOT_DATA.losses,
        backgroundColor: GREEN,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "B/E",
        data:  SNAPSHOT_DATA.be,
        backgroundColor: GREY,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  },
  options: {
    responsive:          true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1c2333",
        borderColor:     "#2a3348",
        borderWidth:     1,
        padding:         8,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: TEXT_GRID, drawBorder: false } },
    },
  },
});


/* ── MODAL ─────────────────────────────────────────────────── */
const overlay   = document.getElementById("modalOverlay");
const quickAdd  = document.getElementById("quickAddBtn");
const modalClose = document.getElementById("modalClose");
const cancelBtn  = document.getElementById("cancelBtn");

function openModal()  { overlay.classList.add("open"); }
function closeModal() { overlay.classList.remove("open"); }

quickAdd.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});


/* ── CHART CANVAS HEIGHTS ──────────────────────────────────── */
document.getElementById("equityChart").style.height = "240px";
document.getElementById("snapshotChart").style.height = "200px";