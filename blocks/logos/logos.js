import { setupSlider } from '../../scripts/slider.js';

/**
 * Client logo strip. Every image in the block becomes a slide.
 * @param {Element} block the logos block
 */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'logos-track';
  block.querySelectorAll('picture').forEach((picture) => {
    const li = document.createElement('li');
    li.append(picture);
    track.append(li);
  });
  block.replaceChildren(track);
  setupSlider(block, track, { autoplay: 3000 });
}
