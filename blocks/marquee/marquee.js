/**
 * Scrolling ticker of outlined words. Each row holds one phrase.
 * @param {Element} block the marquee block
 */
export default function decorate(block) {
  const phrases = [...block.children].map((row) => row.textContent.trim()).filter(Boolean);
  const track = document.createElement('div');
  track.className = 'marquee-track';
  // two copies so the loop is seamless; the copy is hidden from assistive tech
  [false, true].forEach((copy) => {
    const group = document.createElement('ul');
    group.className = 'marquee-group';
    if (copy) group.setAttribute('aria-hidden', 'true');
    phrases.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      group.append(li);
    });
    track.append(group);
  });
  block.replaceChildren(track);
}
