/**
 * Pricing plans. Each row: plan name | price + period | feature list | call to action.
 * @param {Element} block the pricing block
 */
export default function decorate(block) {
  const plans = [...block.children].map((row) => {
    const plan = document.createElement('div');
    plan.className = 'pricing-plan';
    [...row.children].forEach((cell) => {
      if (cell.querySelector('ul, ol')) {
        cell.className = 'pricing-features';
      } else if (cell.querySelector('a')) {
        cell.className = 'pricing-action';
        // single-paragraph cells are unwrapped, so buttonize the link here
        const link = cell.querySelector('a');
        if (!link.classList.contains('button')) {
          link.className = 'button primary';
          const wrapper = document.createElement('p');
          wrapper.className = 'button-wrapper';
          wrapper.append(link);
          cell.replaceChildren(wrapper);
        }
      } else if (/\d/.test(cell.textContent) && !cell.querySelector('h1, h2, h3, h4, h5, h6')) {
        cell.className = 'pricing-price';
        const first = cell.querySelector('p') || cell;
        const [, symbol, amount] = first.textContent.trim().match(/^(\D*)(\d[\d.,]*)$/) || [];
        if (amount) {
          first.className = 'pricing-amount';
          first.innerHTML = '';
          if (symbol) {
            const currency = document.createElement('span');
            currency.className = 'pricing-currency';
            currency.textContent = symbol;
            first.append(currency);
          }
          first.append(amount);
        }
      } else {
        cell.className = 'pricing-title';
      }
      plan.append(cell);
    });
    return plan;
  });
  block.replaceChildren(...plans);
}
