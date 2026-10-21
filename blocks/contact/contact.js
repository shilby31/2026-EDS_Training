const MULTILINE = /message|comment|details/i;

function buildField(label, index) {
  const id = `contact-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'contact-field';
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.className = 'contact-label';
  labelEl.textContent = label;
  let input;
  if (MULTILINE.test(label)) {
    input = document.createElement('textarea');
    input.rows = 5;
    wrapper.classList.add('contact-field-full');
  } else {
    input = document.createElement('input');
    if (/mail/i.test(label)) input.type = 'email';
    else if (/phone|tel/i.test(label)) input.type = 'tel';
    else input.type = 'text';
  }
  input.id = id;
  input.name = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  input.placeholder = label;
  input.required = /name|mail/i.test(label);
  wrapper.append(labelEl, input);
  return wrapper;
}

/**
 * Contact: rows with an icon cell are info cards; the row with a list
 * becomes the form (list items are field labels, the last paragraph is the submit label).
 * @param {Element} block the contact block
 */
export default function decorate(block) {
  const info = document.createElement('div');
  info.className = 'contact-info';
  const formWrap = document.createElement('div');
  formWrap.className = 'contact-form';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const list = row.querySelector('ul, ol');
    if (list) {
      cells.forEach((cell) => {
        if (!cell.contains(list)) formWrap.append(...cell.childNodes);
      });
      const form = document.createElement('form');
      form.noValidate = false;
      [...list.children].forEach((li, i) => form.append(buildField(li.textContent.trim(), i)));
      const submitLabel = [...list.parentElement.querySelectorAll('p')].pop()?.textContent.trim()
        || (list.nextSibling?.textContent || '').trim() || 'Submit';
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'button primary contact-submit';
      submit.textContent = submitLabel;
      const status = document.createElement('p');
      status.className = 'contact-status';
      status.setAttribute('role', 'status');
      form.append(submit, status);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        status.textContent = 'Thank you! Your request has been sent.';
        form.reset();
      });
      formWrap.append(form);
      return;
    }
    const card = document.createElement('div');
    card.className = 'contact-card';
    cells.forEach((cell) => {
      cell.className = cell.querySelector('.icon') && !cell.textContent.trim() ? 'contact-icon' : 'contact-text';
      card.append(cell);
    });
    info.append(card);
  });

  block.replaceChildren(info, formWrap);
}
