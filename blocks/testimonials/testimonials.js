import { setupSlider } from '../../scripts/slider.js';

/**
 * Testimonials slider. Each row: photo | name heading, role, rating line, quote.
 * @param {Element} block the testimonials block
 */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'testimonials-track';
  [...block.children].forEach((row) => {
    const card = document.createElement('li');
    card.className = 'testimonials-card';
    const photo = [...row.children].find((c) => c.querySelector('picture') && !c.textContent.trim());
    const body = [...row.children].find((c) => c !== photo);
    const header = document.createElement('div');
    header.className = 'testimonials-header';
    if (photo) {
      photo.className = 'testimonials-photo';
      header.append(photo);
    }
    if (body) {
      body.className = 'testimonials-body';
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const who = document.createElement('div');
        who.className = 'testimonials-author';
        const role = heading.nextElementSibling;
        who.append(heading);
        if (role?.tagName === 'P' && !role.querySelector('.icon')) {
          role.className = 'testimonials-role';
          who.append(role);
        }
        header.append(who);
      }
      body.querySelector('p .icon')?.closest('p')?.classList.add('testimonials-rating');
    }
    card.append(header);
    if (body) card.append(body);
    track.append(card);
  });
  block.replaceChildren(track);
  setupSlider(block, track, { dots: true, autoplay: 5000 });
}
