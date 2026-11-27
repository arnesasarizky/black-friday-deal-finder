// Deal detail view: one deal on its own page, with full evidence,
// a store link, and the same product at other stores when it is listed twice.
import { CHECKED_LABEL, DEALS, STORE_LINKS } from "./deals.js";
import { discountPercent, money, savingsOf, verdictClass } from "./app.js";

/** The deal with this id, or undefined. */
export function dealById(id) {
  return DEALS.find((d) => d.id === id);
}

/** Other listings of the exact same product at another store, for cross-store comparison. */
export function sameProductElsewhere(deal) {
  return DEALS.filter((d) => d.name === deal.name && d.id !== deal.id);
}

/** The full detail page for one deal, as HTML. */
export function renderDealDetail(deal) {
  const pct = discountPercent(deal);
  const save = savingsOf(deal);
  const others = sameProductElsewhere(deal);
  const storeLink = STORE_LINKS[deal.store] || "#";
  const compare = others.length === 0 ? "" : `
    <div class="detail-block">
      <h3>Same product at other stores</h3>
      <ul class="compare-list">
        ${others.map((o) => `<li><strong>${o.store}</strong> — ${money(o.sale)} <span class="usual-price">was ${money(o.usual)}</span> <span class="pct-badge">${discountPercent(o)}% off</span> <span class="verdict verdict-${verdictClass(o.verdict)}">${o.verdict}</span></li>`).join("")}
      </ul>
    </div>`;
  return `
    <a class="back-link" href="#/">&larr; Back to all deals</a>
    <article class="detail-card">
      <span class="store-chip">${deal.store}</span> &middot; <span class="cat-chip">${deal.category}</span>
      <h2>${deal.name}</h2>
      <span class="verdict verdict-${verdictClass(deal.verdict)}">${deal.verdict}</span><span class="pct-badge">${pct}% off</span>
      <div class="detail-prices">
        <span class="sale-price">${money(deal.sale)}</span>
        <span class="usual-price">usual ${money(deal.usual)}</span>
      </div>
      <p class="detail-save">You save <strong>${money(save)}</strong> — ${pct}% off the usual price.</p>
      <div class="detail-block">
        <h3>Is it really a deal?</h3>
        <p>${deal.evidence}</p>
      </div>
      <div class="detail-block">
        <h3>Checked</h3>
        <p>Prices checked ${CHECKED_LABEL}. Source: ${deal.source}.</p>
      </div>
      ${compare}
      <a class="shop-button" href="${storeLink}" target="_blank" rel="noopener">Shop at ${deal.store} &rarr;</a>
    </article>`;
}
