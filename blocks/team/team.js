/**
 * Team members. Each row: photo | name heading, role, short bio, social links.
 * @param {Element} block the team block
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'team-photo';
      } else {
        cell.className = 'team-body';
        const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading?.nextElementSibling?.tagName === 'P') heading.nextElementSibling.classList.add('team-role');
        cell.querySelectorAll('p').forEach((p) => {
          if (p.querySelector('a .icon') && !p.textContent.trim()) p.className = 'team-social';
        });
      }
      li.append(cell);
    });
    list.append(li);
  });
  block.replaceChildren(list);
}
