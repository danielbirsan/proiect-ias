(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text, attribute, value, className = 'task-action') => {
    const node = element('button', className, text);
    node.type = 'button';
    node.setAttribute(attribute, value);
    return node;
  };
  const icons = {
    meter: '<path d="M13 2 4 14h7l-1 8 10-12h-7l1-8Z"/>',
    air: '<path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6a3 3 0 1 1-3 3"/>',
    bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    document: '<path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v5h5M9 12h6M9 16h4"/>',
  };
  function icon(name) {
    const wrapper = element('span', 'task-icon');
    wrapper.setAttribute('aria-hidden', 'true');
    // These SVG paths are fixed local constants, never user-provided content.
    wrapper.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.document}</svg>`;
    return wrapper;
  }

  const live = element('div', 'sr-only');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  document.body.append(live);
  const announce = (message) => { live.textContent = message; };

  const state = {
    tab: 'overview',
    completed: new Set(),
    paid: new Set(['internet']),
    extracted: false,
    reminderCreated: false,
  };
  const bills = [
    { id: 'electricity', name: 'Electricity', amount: 148.90, meta: 'Due in 5 days · sample' },
    { id: 'gas', name: 'Gas', amount: 96.80, meta: 'Due in 8 days · sample' },
    { id: 'internet', name: 'Internet', amount: 59, meta: 'This month · sample' },
  ];
  const tasks = [
    { id: 'meter', title: 'Send meter reading', meta: 'Electricity · in 2 days', icon: 'meter' },
    { id: 'air', title: 'Book an AC service', meta: 'Recommended this month', icon: 'air' },
    { id: 'electricity', title: 'Pay electricity bill', meta: '148.90 lei · due in 5 days', icon: 'bill' },
  ];
  const money = (amount) => `${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;
  const taskDone = (id) => id === 'electricity' ? state.paid.has(id) : state.completed.has(id);
  const panel = $('#demo-panel');

  function demoHeader(title, subtitle, badge) {
    const head = element('div', 'demo-heading');
    const copy = element('div');
    copy.append(element('h3', '', title), element('p', 'demo-subtitle', subtitle));
    head.append(copy);
    if (badge) head.append(element('span', 'demo-badge', badge));
    return head;
  }

  function renderOverview() {
    const remaining = tasks.filter((task) => !taskDone(task.id)).length;
    panel.append(demoHeader('A little attention. A calmer home.', `${remaining} ${remaining === 1 ? 'thing' : 'things'} to take care of`, 'Live demo'));
    const list = element('ul', 'task-list');
    for (const task of tasks) {
      const done = taskDone(task.id);
      const row = element('li', `task-row${done ? ' task-done' : ''}`);
      const copy = element('div', 'task-copy');
      copy.append(element('span', 'task-title', task.title), element('span', 'task-meta', done ? 'All taken care of · sample' : task.meta));
      const action = button(done ? 'Done' : 'Done?', 'data-complete-task', task.id);
      action.disabled = done;
      action.setAttribute('aria-label', done ? `${task.title}: completed in this demo` : `Mark ${task.title.toLowerCase()} as complete in this demo`);
      row.append(icon(done ? 'check' : task.icon), copy, action);
      list.append(row);
    }
    panel.append(list);
    const footer = element('div', 'demo-footer');
    footer.append(element('p', 'demo-note', remaining ? 'A small preview of a lighter mental load.' : 'You’re all caught up. Enjoy being home.'));
    footer.append(button('Reset demo', 'data-reset-demo', '', 'text-button'));
    panel.append(footer);
  }

  function renderBills() {
    const remaining = bills.filter((bill) => !state.paid.has(bill.id)).reduce((sum, bill) => sum + bill.amount, 0);
    panel.append(demoHeader('Your bills, all together.', 'Sample monthly bills', 'Live demo'));
    const summary = element('div', 'demo-summary');
    summary.append(element('span', '', 'Left to pay'), element('strong', 'demo-total', money(remaining)));
    panel.append(summary);
    const list = element('ul', 'task-list');
    for (const bill of bills) {
      const paid = state.paid.has(bill.id);
      const row = element('li', `task-row${paid ? ' task-done' : ''}`);
      const copy = element('div', 'task-copy');
      copy.append(element('span', 'task-title', bill.name), element('span', 'task-meta', paid ? 'Paid · sample' : bill.meta));
      const action = button(paid ? 'Paid' : 'Mark paid', 'data-pay-bill', bill.id);
      action.disabled = paid;
      action.setAttribute('aria-label', `${paid ? 'Paid' : 'Mark paid'}: ${bill.name}, ${money(bill.amount)}. Sample bill.`);
      row.append(icon(paid ? 'check' : 'bill'), copy, element('span', 'bill-amount', money(bill.amount)), action);
      list.append(row);
    }
    panel.append(list, element('p', 'demo-note', 'Try marking a bill paid. No payments are processed.'));
  }

  function renderDocuments() {
    panel.append(demoHeader('Less paperwork. More peace of mind.', 'Try a sample document', 'AI preview'));
    const card = element('div', 'document-card');
    const details = element('div', 'document-details');
    details.append(element('strong', '', 'Home insurance.pdf'), element('span', 'task-meta', 'Sample policy · no upload needed'));
    card.append(icon('document'), details);
    panel.append(card);
    if (!state.extracted) {
      const action = button('Find the important details', 'data-extract-doc', '', 'document-action');
      panel.append(action, element('p', 'demo-note', 'A simulated AI extraction. You always confirm the details.'));
      return;
    }
    const extraction = element('div', 'extraction-card');
    const fields = element('dl', 'extraction-grid');
    for (const [label, value] of [['Document', 'Home insurance policy'], ['Sample expiry', '31 March 2027'], ['Suggested reminder', '30 days before expiry']]) {
      const field = element('div', 'extraction-field');
      field.append(element('dt', '', label), element('dd', '', value));
      fields.append(field);
    }
    extraction.append(fields);
    if (state.reminderCreated) {
      extraction.append(element('p', 'demo-badge', '✓ Sample reminder added to your calendar'));
    } else {
      extraction.append(button('Confirm & add sample reminder', 'data-confirm-doc', '', 'document-action'));
    }
    panel.append(extraction);
    const footer = element('div', 'demo-footer');
    footer.append(element('p', 'demo-note', 'Illustrative data. No real file is read or stored.'), button('Hide details', 'data-extract-doc', '', 'text-button'));
    panel.append(footer);
  }

  function renderDemo() {
    if (!panel) return;
    panel.replaceChildren();
    const tabs = $$('[data-demo-tab]');
    tabs.forEach((tab) => {
      const active = tab.dataset.demoTab === state.tab;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && tab.id) panel.setAttribute('aria-labelledby', tab.id);
    });
    if (state.tab === 'bills') renderBills();
    else if (state.tab === 'documents') renderDocuments();
    else renderOverview();
  }

  function focusDemo(selector) {
    if (!panel) return;
    const target = $(selector, panel) || $('h3', panel) || panel;
    if (!target.matches('button, a, input, [tabindex]')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }

  const audiences = {
    home: {
      title: 'For the place you call home.',
      copy: 'Your first apartment. Your family home. That place you’re making your own. FirstFlat Home would bring the everyday admin together, so you can get on with living.',
      items: ['Homeowners & first-time buyers', 'Tenants & shared households', 'Families with one home or a few'],
    },
    business: {
      title: 'More homes. Less busywork.',
      copy: 'FirstFlat Business is the proposed next step for property managers and residential portfolios: shared oversight, clearer responsibilities, and less time spent chasing details.',
      items: ['Property owners & professional managers', 'Real estate agencies & residential portfolios', 'Student housing & multi-home operators'],
    },
  };
  function selectAudience(value) {
    const content = audiences[value];
    if (!content) return;
    $$('[data-audience]').forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.audience === value)));
    if ($('#audience-title')) $('#audience-title').textContent = content.title;
    if ($('#audience-copy')) $('#audience-copy').textContent = content.copy;
    if ($('#audience-list')) $('#audience-list').replaceChildren(...content.items.map((item) => element('li', '', item)));
  }

  const roadmap = {
    1: { phase: 'Concept', title: 'First, a home that remembers.', copy: 'Start with the essentials. Our first product would bring your home’s information and recurring responsibilities into one simple place.', items: ['Home profile & essential documents', 'Bill and meter-reading reminders', 'A personal maintenance calendar'] },
    2: { phase: 'Next', title: 'Then, a little intelligence.', copy: 'Turn documents into useful next steps, with your confirmation. The goal is an assistant that understands your home and helps the whole household stay in sync.', items: ['AI-assisted document extraction', 'Shared family calendars', 'Spending history & maintenance insights'] },
    3: { phase: 'Long-term', title: 'Finally, help that comes to you.', copy: 'Connect a reminder to its next action. We envision an ecosystem that helps you find authorized professionals and keep every service record close.', items: ['Authorized maintenance professionals', 'Insurance & service partnerships', 'A connected home services ecosystem'] },
  };
  function selectRoadmap(value) {
    const content = roadmap[value];
    if (!content) return;
    $$('[data-roadmap]').forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.roadmap === String(value))));
    for (const [id, key] of [['roadmap-title', 'title'], ['roadmap-copy', 'copy'], ['roadmap-phase', 'phase']]) {
      if ($(`#${id}`)) $(`#${id}`).textContent = content[key];
    }
    if ($('#roadmap-list')) $('#roadmap-list').replaceChildren(...content.items.map((item) => element('li', '', item)));
  }

  const dialog = $('#setup-dialog');
  const form = $('#setup-form');
  let setupStep = 1;
  let setupOpener = null;
  const setupHeadings = ['First, tell us about your home.', 'How do you live here?', 'What keeps your home running?'];
  function updateSetup(showResult = false) {
    if (!form) return;
    form.hidden = showResult;
    dialog?.setAttribute('aria-labelledby', showResult ? 'setup-result-title' : 'setup-heading');
    $$('[data-setup-step]', form).forEach((step) => {
      const active = !showResult && Number(step.dataset.setupStep) === setupStep;
      step.hidden = !active;
      if (step.tagName === 'FIELDSET') step.disabled = !active;
    });
    if ($('#setup-result')) $('#setup-result').hidden = !showResult;
    $$('[data-setup-next]', form).forEach((item) => { item.hidden = showResult || setupStep === 3; });
    $$('[data-setup-back]', form).forEach((item) => { item.hidden = showResult || setupStep === 1; });
    $$('[data-setup-finish]', form).forEach((item) => { item.hidden = showResult || setupStep !== 3; });
    if ($('#setup-step-label')) $('#setup-step-label').textContent = showResult ? 'Your sample home is ready' : `Step ${setupStep} of 3`;
    if ($('#setup-heading')) $('#setup-heading').textContent = showResult ? 'A calmer home starts here.' : setupHeadings[setupStep - 1];
    const progress = $('#setup-progress');
    if (progress) {
      if (progress.tagName === 'PROGRESS') { progress.max = 3; progress.value = showResult ? 3 : setupStep; }
      else { progress.style.width = `${(showResult ? 3 : setupStep) / 3 * 100}%`; progress.setAttribute('role', 'progressbar'); }
      progress.setAttribute('aria-valuenow', String(showResult ? 3 : setupStep));
      progress.setAttribute('aria-valuemin', '0');
      progress.setAttribute('aria-valuemax', '3');
      progress.setAttribute('aria-label', 'Home setup progress');
    }
  }

  function focusStep() {
    const target = $(`[data-setup-step="${setupStep}"] input`, form);
    target?.focus();
  }
  function validateSetupStep() {
    if (!form || setupStep === 3) return true;
    const name = setupStep === 1 ? 'homeType' : 'tenure';
    if ($(`input[name="${name}"]:checked`, form)) return true;
    const first = $(`input[name="${name}"]`, form);
    if (first) { first.required = true; first.reportValidity(); }
    return false;
  }
  function openSetup(opener, plan = 'Free') {
    if (!dialog || !form) return;
    const mobileNavOpener = nav?.contains(opener) && menu && getComputedStyle(menu).display !== 'none';
    if (mobileNavOpener) closeMenu();
    setupOpener = mobileNavOpener ? menu : opener;
    form.reset();
    setupStep = 1;
    if ($('#setup-plan')) $('#setup-plan').value = ['Free', 'Plus', 'Family', 'Business'].includes(plan) ? plan : 'Free';
    updateSetup();
    if (!dialog.open) dialog.showModal();
    focusStep();
  }
  function finishSetup() {
    if (!form) return;
    const home = $('input[name="homeType"]:checked', form)?.value || 'apartment';
    const tenure = $('input[name="tenure"]:checked', form)?.value || 'owner';
    const equipment = new Set($$('input[name="equipment"]:checked', form).map((item) => item.value));
    const plan = $('#setup-plan')?.value || 'Free';
    const reminders = ['Utility bills & meter readings — add your provider’s dates'];
    if (tenure === 'owner') reminders.push('Home insurance & property tax — confirm dates from your documents');
    else reminders.push('Rental agreement & shared responsibilities — confirm with your landlord');
    if (home === 'house') reminders.push('Seasonal home upkeep — set the schedule that suits your house');
    if (equipment.has('heating')) reminders.push('Heating system inspection — add the due date from your service record');
    if (equipment.has('ac')) reminders.push('Air conditioning maintenance — choose a service reminder');
    if (equipment.has('boiler')) reminders.push('Boiler maintenance — check the manufacturer’s service guidance');
    if ($('#setup-result-title')) $('#setup-result-title').textContent = `Your ${home === 'house' ? 'house' : 'apartment'}, a little more organized.`;
    if ($('#setup-result-copy')) $('#setup-result-copy').textContent = `Here’s a sample starting point for a ${tenure === 'tenant' ? 'tenant' : 'homeowner'} on FirstFlat ${plan}. These are suggested reminders: confirm each date from your documents, providers, and applicable requirements. No account has been created.`;
    if ($('#setup-result-list')) $('#setup-result-list').replaceChildren(...reminders.map((item) => element('li', '', item)));
    updateSetup(true);
    const title = $('#setup-result-title');
    if (title) { title.tabIndex = -1; title.focus(); }
    announce('Your sample home setup is ready. No information has been sent or stored.');
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, a');
    if (!target) return;
    if (target.matches('[data-demo-tab]')) { state.tab = target.dataset.demoTab; renderDemo(); }
    if (target.matches('[data-complete-task]')) {
      const task = tasks.find((item) => item.id === target.dataset.completeTask);
      if (!task) return;
      if (task.id === 'electricity') state.paid.add(task.id); else state.completed.add(task.id);
      renderDemo();
      focusDemo('[data-complete-task]:not(:disabled)');
      announce(`${task.title} completed in the demo.`);
    }
    if (target.matches('[data-pay-bill]')) {
      const bill = bills.find((item) => item.id === target.dataset.payBill);
      if (!bill) return;
      state.paid.add(bill.id);
      renderDemo();
      focusDemo('[data-pay-bill]:not(:disabled)');
      announce(`${bill.name} marked paid in this demo. No payment was processed.`);
    }
    if (target.matches('[data-reset-demo]')) {
      state.completed.clear(); state.paid = new Set(['internet']); state.extracted = false; state.reminderCreated = false;
      renderDemo(); focusDemo('[data-reset-demo]'); announce('The example home has been reset.');
    }
    if (target.matches('[data-extract-doc]')) { state.extracted = !state.extracted; renderDemo(); focusDemo(state.extracted ? '[data-confirm-doc]' : '[data-extract-doc]'); announce(state.extracted ? 'Sample policy details extracted. Review and confirm the suggested reminder.' : 'Sample details hidden.'); }
    if (target.matches('[data-confirm-doc]')) { state.reminderCreated = true; renderDemo(); focusDemo('[data-extract-doc]'); announce('Sample insurance reminder added. No real reminder was created.'); }
    if (target.matches('[data-audience]')) selectAudience(target.dataset.audience);
    if (target.matches('[data-roadmap]')) selectRoadmap(target.dataset.roadmap);
    if (target.matches('[data-open-setup], [data-select-plan]')) { event.preventDefault(); openSetup(target, target.dataset.selectPlan || 'Free'); }
    if (target.matches('[data-setup-next]')) { event.preventDefault(); if (validateSetupStep()) { setupStep = Math.min(3, setupStep + 1); updateSetup(); focusStep(); } }
    if (target.matches('[data-setup-back]')) { event.preventDefault(); setupStep = Math.max(1, setupStep - 1); updateSetup(); focusStep(); }
    if (target.matches('[data-setup-finish]')) { event.preventDefault(); finishSetup(); }
    if (target.matches('[data-restart-setup]')) { event.preventDefault(); const plan = $('#setup-plan')?.value || 'Free'; form?.reset(); if ($('#setup-plan')) $('#setup-plan').value = plan; setupStep = 1; updateSetup(); focusStep(); }
  });

  $$('[data-demo-tab]').forEach((tab) => tab.addEventListener('keydown', (event) => {
    const tabs = $$('[data-demo-tab]');
    const current = tabs.indexOf(tab);
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    state.tab = tabs[next].dataset.demoTab;
    renderDemo(); tabs[next].focus();
  }));

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateSetupStep()) return;
    if (setupStep < 3) { setupStep += 1; updateSetup(); focusStep(); }
    else finishSetup();
  });
  $('#setup-close')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('close', () => { setupOpener?.focus(); });
  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  const menu = $('#menu-toggle');
  const nav = $('#nav-links');
  function closeMenu() { menu?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); nav?.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { threshold: 0.08 });
    $$('.reveal').forEach((node) => observer.observe(node));
    document.documentElement.classList.add('has-reveal');
  }

  renderDemo();
  selectAudience($('[data-audience][aria-pressed="true"]')?.dataset.audience || 'home');
  selectRoadmap($('[data-roadmap][aria-pressed="true"]')?.dataset.roadmap || '1');
  updateSetup();
})();
