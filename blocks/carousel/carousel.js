const AUTOPLAY_MS = 6000;

function showSlide(block, index) {
  const slides = [...block.querySelectorAll('.carousel-slide')];
  const next = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const active = i === next;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a, button').forEach((el) => { el.tabIndex = active ? 0 : -1; });
  });
  block.querySelectorAll('.carousel-dots button').forEach((dot, i) => {
    dot.setAttribute('aria-current', i === next);
  });
  block.dataset.activeSlide = next;
  // restart the progress bar animation
  const progress = block.querySelector('.carousel-progress');
  if (progress) {
    progress.classList.remove('running');
    // eslint-disable-next-line no-unused-expressions
    progress.offsetWidth;
    progress.classList.add('running');
  }
}

function buildNavButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `carousel-${direction}`;
  button.setAttribute('aria-label', label);
  return button;
}

/**
 * Hero slider: each row is a slide with an image cell and a content cell.
 * @param {Element} block the carousel block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'carousel-slides';

  rows.forEach((row, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${rows.length}`);
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'carousel-slide-image';
        // the first slide image is the LCP candidate
        if (i === 0) cell.querySelector('img')?.setAttribute('loading', 'eager');
      } else {
        cell.className = 'carousel-slide-content';
        const social = [...cell.querySelectorAll('p')].find((p) => p.querySelector('.icon') && !p.textContent.trim());
        if (social) social.classList.add('carousel-social');
        // consecutive buttons share one row
        const buttons = [...cell.querySelectorAll(':scope > p')].filter((p) => p.querySelector(':scope > strong > a, :scope > em > a, :scope > a.button'));
        if (buttons.length) {
          const group = document.createElement('div');
          group.className = 'carousel-buttons';
          buttons[0].before(group);
          group.append(...buttons);
        }
      }
      slide.append(cell);
    });
    track.append(slide);
  });

  block.replaceChildren(track);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', 'Highlights');

  if (rows.length > 1) {
    const prev = buildNavButton('prev', 'Previous slide');
    const next = buildNavButton('next', 'Next slide');
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    rows.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show slide ${i + 1}`);
      dot.addEventListener('click', () => showSlide(block, i));
      dots.append(dot);
    });
    const progress = document.createElement('div');
    progress.className = 'carousel-progress';
    progress.style.setProperty('--carousel-duration', `${AUTOPLAY_MS}ms`);
    block.append(progress, prev, next, dots);

    const current = () => Number(block.dataset.activeSlide || 0);
    prev.addEventListener('click', () => showSlide(block, current() - 1));
    next.addEventListener('click', () => showSlide(block, current() + 1));

    let timer;
    const start = () => {
      clearInterval(timer);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(() => showSlide(block, current() + 1), AUTOPLAY_MS);
    };
    block.addEventListener('mouseenter', () => clearInterval(timer));
    block.addEventListener('mouseleave', start);
    block.addEventListener('focusin', () => clearInterval(timer));
    start();
  }
  showSlide(block, 0);
}
