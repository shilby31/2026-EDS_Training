/**
 * Latest news cards. Each row: image | category link, title heading, excerpt, read-more link.
 * @param {Element} block the blog block
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const image = [...row.children].find((c) => c.querySelector('picture') && !c.textContent.trim());
    const body = [...row.children].find((c) => c !== image);
    if (image) {
      image.className = 'blog-image';
      li.append(image);
    }
    if (body) {
      body.className = 'blog-body';
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      // a short link paragraph above the title is the category tag, shown over the image
      const tag = heading?.previousElementSibling;
      if (tag?.tagName === 'P' && tag.querySelector('a')) {
        tag.className = 'blog-tag';
        (image || li).append(tag);
      }
      li.append(body);
    }
    list.append(li);
  });
  block.replaceChildren(list);
}
