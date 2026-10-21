import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer: widget columns, copyright row and a back-to-top button
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const sections = [...fragment.children];
  // the last single-paragraph section is the copyright row
  const last = sections[sections.length - 1];
  const copyright = sections.length > 1 && !last.querySelector('h1, h2, h3, h4, h5, h6, ul') ? sections.pop() : null;

  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  sections.forEach((section, i) => {
    section.classList.add('footer-column');
    if (i === 0) section.classList.add('footer-about');
    section.querySelectorAll('p').forEach((p) => {
      if (p.querySelector('a .icon') && !p.textContent.trim()) p.classList.add('footer-social');
    });
    // list items that start with an image are post teasers
    section.querySelectorAll('li').forEach((li) => {
      if (li.firstElementChild?.tagName === 'PICTURE') li.classList.add('footer-post');
    });
    columns.append(section);
  });
  block.append(columns);

  if (copyright) {
    copyright.className = 'footer-copyright';
    block.append(copyright);
  }

  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'footer-to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  block.append(toTop);
  const toggleToTop = () => toTop.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();
}
