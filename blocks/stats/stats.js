/**
 * Counts a number up from zero once it scrolls into view.
 * @param {Element} el element whose text is the target number
 */
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  if (Number.isNaN(target) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = performance.now();
  const duration = 1500;
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * progress);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Stats: each row is icon | number (with optional suffix like "+") | label.
 * @param {Element} block the stats block
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    const item = document.createElement('div');
    item.className = 'stats-item';
    const icon = cells.find((c) => c.querySelector('.icon') && !c.textContent.trim());
    const value = cells.find((c) => /\d/.test(c.textContent));
    const label = cells.find((c) => c !== icon && c !== value && c.textContent.trim());

    if (icon) {
      icon.className = 'stats-icon';
      item.append(icon);
    }
    if (value) {
      const [, num, suffix] = value.textContent.trim().match(/^(\d+)\s*(.*)$/) || [null, value.textContent.trim(), ''];
      const number = document.createElement('p');
      number.className = 'stats-number';
      const count = document.createElement('span');
      count.dataset.target = num;
      count.textContent = num;
      number.append(count);
      if (suffix) {
        const suf = document.createElement('span');
        suf.className = 'stats-suffix';
        suf.textContent = suffix;
        number.append(suf);
      }
      item.append(number);
    }
    if (label) {
      label.className = 'stats-label';
      item.append(label);
    }
    return item;
  });
  block.replaceChildren(...items);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      block.querySelectorAll('[data-target]').forEach(countUp);
    });
  }, { threshold: 0.4 });
  observer.observe(block);
}
