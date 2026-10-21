import { setupSlider } from '../../scripts/slider.js';

/**
 * Portfolio slider: image with an overlapping caption card.
 * Each row: image | title heading and subtitle.
 * @param {Element} block the portfolio block
 */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'portfolio-track';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((cell) => {
      cell.className = cell.querySelector('picture') && !cell.textContent.trim() ? 'portfolio-image' : 'portfolio-caption';
      li.append(cell);
    });
    track.append(li);
  });
  block.replaceChildren(track);
  setupSlider(block, track, { autoplay: 4000 });
}
