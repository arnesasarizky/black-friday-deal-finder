// Midnight Deals — list rendering, search, filters, sort and hash routing.
// Deal data lives in deals.js; the detail page lives in detail.js.
import { CATEGORIES, CHECKED_LABEL, DEALS, STORE_LINKS } from "./deals.js";
import { dealById, renderDealDetail } from "./detail.js";

/** A price as $1,234.56. */
export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** The discount percent, computed from the two prices so it always adds up. */
export function discountPercent(deal) {
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

/** Dollars saved on one deal. */
export function savingsOf(deal) {
  return deal.usual - deal.sale;
}

/** Verdict text to a CSS class suffix. */
export function verdictClass(verdict) {
  return verdict.toLowerCase().replace(/ /g, "-");
}

/** Escape text for HTML output. */
export function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const state = { query: "", category: "All", store: "All", minDiscount: 0, sort: "pct" };

const grid = document.getElementById("dealGrid");
const resultsLine = document.getElementById("resultsLine");
const emptyNote = document.getElementById("emptyNote");
const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");
const searchBox = document.getElementById("searchBox");
const storeFilter = document.getElementById("storeFilter");
const sortSelect = document.getElementById("sortSelect");

/** Verdict strength for ranking: new lows first, then strong deals. */
function verdictRank(deal) {
  return { "NEW LOW": 0, "STRONG DEAL": 1, "ROUTINE": 2, "INFLATED": 3 }[deal.verdict] ?? 4;
}

/** The five best deals: best verdict first, then biggest discount. */
export function bestDeals() {
  return [...DEALS]
    .sort((a, b) => verdictRank(a) - verdictRank(b) || discountPercent(b) - discountPercent(a) || savingsOf(b) - savingsOf(a))
    .slice(0, 5);
}

/** One deal card. */
export function dealCard(deal) {
  const pct = discountPercent(deal);
  const storeLink = STORE_LINKS[deal.store] || "#";
  return `
    <article class="deal-card">
      <div class="deal-top"><span class="store-chip">${escapeHtml(deal.store)}</span><span class="cat-chip">${escapeHtml(deal.category)}</span></div>
      <h3><a href="#/deal/${deal.id}">${escapeHtml(deal.name)}</a></h3>
      <div class="price-row">
        <span class="sale-price">${money(deal.sale)}</span>
        <span class="usual-price">${money(deal.usual)}</span>
        <span class="pct-badge">${pct}% off</span>
      </div>
      <p class="save-line">You save ${money(savingsOf(deal))}</p>
      <span class="verdict verdict-${verdictClass(deal.verdict)}">${escapeHtml(deal.verdict)}</span>
      <p class="evidence">${escapeHtml(deal.evidence)}</p>
      <p class="checked-line">Checked ${CHECKED_LABEL} &middot; Source: ${escapeHtml(deal.source)}</p>
      <div class="card-links">
        <a href="${storeLink}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} &rarr;</a>
        <a href="#/deal/${deal.id}">Details</a>
      </div>
    </article>`;
}

/** The deals matching the current search and filters, sorted. */
export function visibleDeals() {
  const q = state.query.trim().toLowerCase();
  const list = DEALS.filter((d) => {
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (discountPercent(d) < state.minDiscount) return false;
    if (q && !(d.name + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
  const byPct = (a, b) => discountPercent(b) - discountPercent(a) || savingsOf(b) - savingsOf(a);
  if (state.sort === "pct") list.sort(byPct);
  else if (state.sort === "save") list.sort((a, b) => savingsOf(b) - savingsOf(a) || byPct(a, b));
  else if (state.sort === "priceAsc") list.sort((a, b) => a.sale - b.sale || byPct(a, b));
  else if (state.sort === "priceDesc") list.sort((a, b) => b.sale - a.sale || byPct(a, b));
  return list;
}

/** Render the top-5 strip. */
export function renderBestStrip() {
  const strip = document.getElementById("bestStrip");
  strip.innerHTML = bestDeals().map((deal, i) => `
    <li class="best-card">
      <span class="best-rank">#${i + 1}</span>
      <h3><a href="#/deal/${deal.id}">${escapeHtml(deal.name)}</a></h3>
      <div><span class="best-price">${money(deal.sale)}</span><span class="best-was">${money(deal.usual)}</span></div>
      <span class="verdict verdict-${verdictClass(deal.verdict)}">${escapeHtml(deal.verdict)}</span><span class="pct-badge">${discountPercent(deal)}% off</span>
      <p class="best-meta">${escapeHtml(deal.store)} &middot; checked ${CHECKED_LABEL}</p>
    </li>`).join("");
}

/** Render the deal list for the current state. */
export function renderList() {
  const list = visibleDeals();
  grid.innerHTML = list.map(dealCard).join("");
  const totalSave = list.reduce((sum, d) => sum + savingsOf(d), 0);
  resultsLine.innerHTML = `<strong>${list.length} deal${list.length === 1 ? "" : "s"}</strong> shown &middot; ${money(totalSave)} total savings &middot; Prices checked ${CHECKED_LABEL}`;
  emptyNote.hidden = list.length !== 0;
  grid.hidden = list.length === 0;
}

/** Build the category chips with per-category counts. */
function buildCategoryChips() {
  const wrap = document.getElementById("categoryChips");
  const counts = {};
  DEALS.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });
  const chips = ["All", ...CATEGORIES].map((c) => {
    const n = c === "All" ? DEALS.length : counts[c] || 0;
    return `<button type="button" class="chip${c === state.category ? " active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)} (${n})</button>`;
  }).join("");
  wrap.innerHTML = chips;
  wrap.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.cat;
      wrap.querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b === btn));
      renderList();
    });
  });
}

/** Build the store dropdown with per-store counts. */
function buildStoreFilter() {
  const counts = {};
  DEALS.forEach((d) => { counts[d.store] = (counts[d.store] || 0) + 1; });
  const stores = Object.keys(counts).sort();
  storeFilter.innerHTML = `<option value="All">All stores (${DEALS.length})</option>` +
    stores.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)} (${counts[s]})</option>`).join("");
}

/** Wire the discount chips. */
function buildDiscountChips() {
  const wrap = document.getElementById("discountChips");
  wrap.querySelectorAll(".discount-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.minDiscount = Number(btn.dataset.min);
      wrap.querySelectorAll(".discount-chip").forEach((b) => b.classList.toggle("active", b === btn));
      renderList();
    });
  });
}

/** Show the list view or one deal's detail page, from the hash route. */
export function route() {
  const hash = window.location.hash || "#/";
  const match = hash.match(/^#\/deal\/(\d+)$/);
  if (match) {
    const deal = dealById(Number(match[1]));
    if (deal) {
      document.title = `${deal.name} — ${money(deal.sale)} at ${deal.store} | Midnight Deals`;
      listView.hidden = true;
      detailView.hidden = false;
      detailView.innerHTML = renderDealDetail(deal);
      document.querySelector(".site-footer").hidden = true;
      window.scrollTo(0, 0);
      return;
    }
  }
  document.title = "Midnight Deals — Black Friday Deal Finder 2026";
  detailView.hidden = true;
  listView.hidden = false;
  document.querySelector(".site-footer").hidden = false;
  renderList();
}

/** Fill the masthead stats: deal count and total savings across all deals. */
function renderMasthead() {
  document.getElementById("statDeals").textContent = String(DEALS.length);
  document.getElementById("statSavings").textContent = money(DEALS.reduce((sum, d) => sum + savingsOf(d), 0));
}

searchBox.addEventListener("input", () => { state.query = searchBox.value; renderList(); });
storeFilter.addEventListener("change", () => { state.store = storeFilter.value; renderList(); });
sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; renderList(); });
window.addEventListener("hashchange", route);

buildCategoryChips();
buildStoreFilter();
buildDiscountChips();
renderBestStrip();
renderMasthead();
route();
