import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapses every open dropdown in the nav.
 * @param {Element} sections the nav sections container
 * @param {Element} [except] a dropdown button to leave untouched
 */
function closeDropdowns(sections, except) {
  sections?.querySelectorAll('.nav-drop > button[aria-expanded="true"]').forEach((button) => {
    if (button !== except) button.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Opens or closes the mobile menu.
 * @param {Element} nav the nav element
 * @param {boolean} [force] desired state; toggles when omitted
 */
function toggleMenu(nav, force) {
  const expanded = force ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', expanded);
  const button = nav.querySelector('.nav-hamburger button');
  button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  if (!expanded) closeDropdowns(nav.querySelector('.nav-sections'));
}

function decorateTopbar(section) {
  section.querySelectorAll('ul').forEach((ul, i) => ul.classList.add(i === 0 ? 'topbar-contact' : 'topbar-meta'));
  section.querySelectorAll('li').forEach((li) => {
    if (li.querySelector('a .icon') && !li.textContent.trim()) li.classList.add('topbar-social');
  });
}

function decorateSections(section, nav) {
  // list items may arrive with their content wrapped in paragraphs
  section.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  section.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((item) => {
    const subList = item.querySelector(':scope > ul');
    if (!subList) return;
    item.classList.add('nav-drop');
    // the dropdown label becomes a button so it is announced as expandable
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.textContent = [...item.childNodes].filter((n) => n !== subList).map((n) => n.textContent).join('').trim();
    [...item.childNodes].forEach((n) => { if (n !== subList) n.remove(); });
    item.prepend(button);
    // mark the dropdown that contains the current page
    const path = window.location.pathname.replace(/\/index$/, '/');
    if ([...subList.querySelectorAll('a')].some((a) => new URL(a.href).pathname === path)) item.classList.add('active');
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      closeDropdowns(section, button);
      button.setAttribute('aria-expanded', !expanded);
    });
  });
  section.querySelectorAll(':scope .default-content-wrapper > ul > li > a').forEach((a) => {
    if (new URL(a.href).pathname === window.location.pathname) a.closest('li').classList.add('active');
  });
  nav.addEventListener('focusout', (e) => {
    if (!nav.contains(e.relatedTarget)) closeDropdowns(section);
  });
}

function decorateTools(section) {
  const search = [...section.querySelectorAll('p')].find((p) => p.querySelector('.icon-search'));
  if (search) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-search-toggle';
    button.setAttribute('aria-label', 'Search');
    button.append(...search.childNodes);
    const form = document.createElement('form');
    form.className = 'nav-search';
    form.action = '/search';
    form.role = 'search';
    form.innerHTML = '<label><span class="nav-search-label">Search</span><input type="search" name="q" placeholder="Search here..."></label>';
    button.addEventListener('click', () => {
      const open = form.classList.toggle('open');
      button.setAttribute('aria-expanded', open);
      if (open) form.querySelector('input').focus();
    });
    search.replaceWith(button, form);
  }
}

/**
 * loads and decorates the header: top bar, brand, navigation and tools
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const sections = [...fragment.children];
  // the top bar is optional: it is the first section when four are authored
  const topbarSection = sections.length > 3 ? sections.shift() : null;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  ['brand', 'sections', 'tools'].forEach((name, i) => {
    if (sections[i]) {
      sections[i].classList.add(`nav-${name}`);
      nav.append(sections[i]);
    }
  });

  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-wrapper')?.classList.remove('button-wrapper');
    brandLink.setAttribute('aria-label', 'Home');
  }
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) decorateSections(navSections, nav);
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) decorateTools(navTools);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);
  toggleMenu(nav, false);
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    closeDropdowns(navSections);
    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);

  if (topbarSection) {
    topbarSection.className = 'topbar';
    decorateTopbar(topbarSection);
    block.append(topbarSection);
  }
  block.append(navWrapper);

  // the nav sticks to the top once the page scrolls past it
  const sentinel = document.createElement('div');
  sentinel.className = 'nav-sentinel';
  block.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    navWrapper.classList.toggle('sticky', !entry.isIntersecting);
  }, { rootMargin: '200px 0px 0px 0px' }).observe(sentinel);
}
