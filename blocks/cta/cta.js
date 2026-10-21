/**
 * CTA banner: background image cell plus a content cell (eyebrow, heading, button).
 * @param {Element} block the cta block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const media = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
  const content = cells.find((c) => c !== media);
  if (media) media.className = 'cta-background';
  if (content) {
    content.className = 'cta-content';
    const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
    const eyebrow = heading?.previousElementSibling;
    if (eyebrow?.tagName === 'P') eyebrow.className = 'cta-eyebrow';
    const text = document.createElement('div');
    text.className = 'cta-text';
    const button = content.querySelector('.button-wrapper');
    text.append(...[...content.children].filter((el) => el !== button));
    content.prepend(text);
  }
  block.replaceChildren(...[media, content].filter(Boolean));
}
