const toSlug = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Filterable image gallery.
 * Rows: image | comma-separated categories. A row without an image sets the "all" filter label.
 * @param {Element} block the gallery block
 */
export default function decorate(block) {
  let allLabel = 'All';
  const categories = new Map();
  const grid = document.createElement('ul');
  grid.className = 'gallery-grid';

  [...block.children].forEach((row) => {
    const picture = row.querySelector('picture');
    if (!picture) {
      if (row.textContent.trim()) allLabel = row.textContent.trim();
      return;
    }
    const meta = [...row.children].find((cell) => !cell.querySelector('picture'));
    const tags = (meta?.textContent || '').split(',').map((t) => t.trim()).filter(Boolean);
    const item = document.createElement('li');
    item.className = 'gallery-item';
    item.dataset.categories = tags.map(toSlug).join(' ');
    tags.forEach((tag) => categories.set(toSlug(tag), tag));
    item.append(picture);
    grid.append(item);
  });

  const filters = document.createElement('div');
  filters.className = 'gallery-filters';
  filters.setAttribute('role', 'toolbar');
  filters.setAttribute('aria-label', 'Filter gallery');
  const options = [['*', allLabel], ...[...categories.entries()].sort((a, b) => a[1].localeCompare(b[1]))];
  options.forEach(([slug, label], i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', i === 0);
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === button));
      grid.querySelectorAll('.gallery-item').forEach((item) => {
        item.hidden = slug !== '*' && !item.dataset.categories.split(' ').includes(slug);
      });
    });
    filters.append(button);
  });

  block.replaceChildren(filters, grid);
}
