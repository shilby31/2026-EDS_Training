/**
 * Turns a horizontally scrolling, scroll-snapped track into a slider with
 * optional dots and autoplay. Layout (items per view) is left to block CSS.
 * @param {Element} block the block that hosts the slider
 * @param {Element} track the scrolling element whose children are slides
 * @param {Object} [options]
 * @param {boolean} [options.dots] render pagination dots
 * @param {number} [options.autoplay] autoplay interval in ms (0 disables)
 */
// eslint-disable-next-line import/prefer-default-export
export function setupSlider(block, track, { dots = false, autoplay = 0 } = {}) {
  const slides = () => [...track.children];
  const perView = () => {
    const first = slides()[0];
    if (!first) return 1;
    return Math.max(1, Math.round(track.clientWidth / first.getBoundingClientRect().width));
  };
  const pageCount = () => Math.max(1, slides().length - perView() + 1);
  const current = () => {
    const first = slides()[0];
    if (!first) return 0;
    const step = slides()[1] ? slides()[1].offsetLeft - first.offsetLeft : first.offsetWidth;
    return Math.round(track.scrollLeft / step);
  };
  const goTo = (index) => {
    const count = pageCount();
    const target = slides()[((index % count) + count) % count];
    if (target) track.scrollTo({ left: target.offsetLeft - slides()[0].offsetLeft, behavior: 'smooth' });
  };

  let nav;
  const renderDots = () => {
    if (!dots) return;
    nav?.remove();
    nav = document.createElement('div');
    nav.className = 'slider-dots';
    const count = pageCount();
    if (count < 2) return;
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      nav.append(dot);
    }
    block.append(nav);
  };
  const updateDots = () => {
    nav?.querySelectorAll('button').forEach((dot, i) => dot.setAttribute('aria-current', i === current()));
  };

  renderDots();
  updateDots();
  track.addEventListener('scroll', () => window.requestAnimationFrame(updateDots), { passive: true });
  new ResizeObserver(() => { renderDots(); updateDots(); }).observe(track);

  if (autoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let timer;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => { if (pageCount() > 1) goTo(current() + 1); }, autoplay);
    };
    const stop = () => clearInterval(timer);
    block.addEventListener('mouseenter', stop);
    block.addEventListener('mouseleave', start);
    block.addEventListener('focusin', stop);
    block.addEventListener('focusout', start);
    start();
  }
  return { goTo };
}
