/**
 * FAQ: the first row is image | intro (eyebrow, heading, text);
 * every following row is question | answer, rendered as an accordion.
 * @param {Element} block the faq block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'faq-media';
  const content = document.createElement('div');
  content.className = 'faq-content';
  const accordion = document.createElement('div');
  accordion.className = 'faq-accordion';

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const isIntro = i === 0 && cells.some((c) => c.querySelector('picture'));
    if (isIntro) {
      cells.forEach((cell) => {
        if (cell.querySelector('picture') && !cell.textContent.trim()) {
          media.append(...cell.childNodes);
        } else {
          const intro = document.createElement('div');
          intro.className = 'faq-intro';
          intro.append(...cell.childNodes);
          const heading = intro.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading?.previousElementSibling?.tagName === 'P') heading.previousElementSibling.className = 'faq-eyebrow';
          content.prepend(intro);
        }
      });
      return;
    }
    const [question, answer] = cells;
    if (!question) return;
    const details = document.createElement('details');
    details.className = 'faq-item';
    const summary = document.createElement('summary');
    summary.textContent = question.textContent.trim();
    const body = document.createElement('div');
    body.className = 'faq-answer';
    if (answer) body.append(...answer.childNodes);
    details.append(summary, body);
    accordion.append(details);
  });

  // the first question starts open, like the source design; opening one closes the others
  const items = [...accordion.querySelectorAll('details')];
  if (items[0]) items[0].open = true;
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  content.append(accordion);
  block.replaceChildren(...[media.childNodes.length ? media : null, content].filter(Boolean));
}
