'use strict';

// Progressive enhancement: the page remains readable if JavaScript is unavailable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.querySelectorAll('.hero-copy .reveal, .steps .reveal').forEach((element, index) => {
    element.style.setProperty('--delay', `${(index % 6) * 65}ms`);
  });
  document.documentElement.classList.add('motion-ready');
}

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const mobileViewport = window.matchMedia('(max-width: 800px)');
const surfaceAnimations = new WeakMap();

// Preserve the currently rendered frame when a visitor reverses an animation.
function animateSurface(element, opening, finished = () => {}) {
  const previous = surfaceAnimations.get(element);
  const current = getComputedStyle(element);
  const from = previous
    ? { opacity: current.opacity, transform: current.transform }
    : { opacity: opening ? 0 : 1, transform: opening ? 'translateY(-10px) scale(.98)' : 'none' };
  previous?.cancel();
  surfaceAnimations.delete(element);
  if (reducedMotion.matches || !element.animate) { finished(); return; }
  const animation = element.animate([from, {
    opacity: opening ? 1 : 0,
    transform: opening ? 'none' : 'translateY(-10px) scale(.98)'
  }], { duration: opening ? 240 : 180, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
  surfaceAnimations.set(element, animation);
  animation.onfinish = () => {
    if (surfaceAnimations.get(element) !== animation) return;
    surfaceAnimations.delete(element);
    finished();
    animation.cancel();
  };
}

function closeMenu(restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  navigation.inert = mobileViewport.matches;
  if (navigation.classList.contains('is-open')) {
    animateSurface(navigation, false, () => {
      navigation.classList.remove('is-open');
      navigation.inert = false;
    });
  } else navigation.inert = false;
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') return closeMenu();
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Cerrar menú');
  navigation.classList.add('is-open');
  navigation.inert = false;
  document.body.classList.add('menu-open');
  animateSurface(navigation, true);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key === 'Tab') {
    const links = [...navigation.querySelectorAll('a')];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === menuToggle) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuToggle.focus(); }
  }
});
mobileViewport.addEventListener('change', event => { if (!event.matches) closeMenu(); });

// Animate the small accordion container, including its layout, in both directions.
// Native details/summary semantics and keyboard activation remain available.
const accordionStates = new WeakMap();
const accordions = [...document.querySelectorAll('details')];
function setAccordion(detail, opening) {
  const state = accordionStates.get(detail);
  if (state.expanded === opening) return;
  const startHeight = detail.getBoundingClientRect().height;
  state.animation?.cancel();
  state.animation = null;
  state.expanded = opening;
  detail.dataset.expanded = String(opening);
  state.summary.setAttribute('aria-expanded', String(opening));
  state.panel.inert = !opening;
  if (!opening && state.panel.contains(document.activeElement)) state.summary.focus();
  if (opening) detail.open = true;
  if (reducedMotion.matches || !detail.animate) {
    detail.open = opening;
    return;
  }
  const endHeight = opening
    ? detail.getBoundingClientRect().height
    : state.summary.getBoundingClientRect().height + parseFloat(getComputedStyle(detail).borderTopWidth || 0) + parseFloat(getComputedStyle(detail).borderBottomWidth || 0);
  detail.classList.add('is-animating');
  const animation = detail.animate([
    { height: `${startHeight}px` }, { height: `${endHeight}px` }
  ], { duration: opening ? 260 : 200, easing: 'cubic-bezier(.23,1,.32,1)' });
  state.animation = animation;
  animation.onfinish = () => {
    if (state.animation !== animation) return;
    detail.open = state.expanded;
    detail.classList.remove('is-animating');
    state.animation = null;
    animation.cancel();
  };
}
accordions.forEach(detail => {
  const summary = detail.querySelector('summary');
  const panel = document.createElement('div');
  panel.className = 'accordion-panel';
  [...detail.children].filter(child => child !== summary).forEach(child => panel.append(child));
  detail.append(panel);
  accordionStates.set(detail, { expanded: detail.open, summary, panel, animation: null });
  detail.dataset.expanded = String(detail.open);
  summary.setAttribute('aria-expanded', String(detail.open));
  panel.inert = !detail.open;
  summary.addEventListener('click', event => {
    event.preventDefault();
    const opening = !accordionStates.get(detail).expanded;
    if (opening && detail.closest('.practice')) {
      accordions.filter(other => other !== detail && other.closest('.practice')).forEach(other => setAccordion(other, false));
    }
    setAccordion(detail, opening);
  });
});
reducedMotion.addEventListener('change', event => {
  if (!event.matches) return;
  accordions.forEach(detail => {
    const state = accordionStates.get(detail);
    state.animation?.cancel();
    state.animation = null;
    detail.open = state.expanded;
    detail.classList.remove('is-animating');
  });
});
document.querySelectorAll('[data-area]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#area').value = link.dataset.area;
  updateAreaPicker();
}));

// Enhance the native select only when JavaScript is available.
const areaSelect = document.querySelector('#area');
const areaPicker = document.createElement('div');
areaPicker.className = 'area-picker';
const areaTrigger = document.createElement('button');
areaTrigger.type = 'button';
areaTrigger.id = 'area-picker-trigger';
areaTrigger.className = 'area-trigger';
areaTrigger.setAttribute('role', 'combobox');
areaTrigger.setAttribute('aria-label', '¿En qué podemos orientarte?');
areaTrigger.setAttribute('aria-required', 'true');
areaTrigger.setAttribute('aria-haspopup', 'listbox');
areaTrigger.setAttribute('aria-expanded', 'false');
areaTrigger.setAttribute('aria-controls', 'area-options');
const areaOptions = document.createElement('div');
areaOptions.id = 'area-options';
areaOptions.className = 'area-options';
areaOptions.setAttribute('role', 'listbox');
areaOptions.setAttribute('aria-label', 'Especialidades');
areaOptions.hidden = true;
const availableAreas = [...areaSelect.options].filter(option => option.value);
let areaIsOpen = false;
let activeArea = 0;
const areaItems = availableAreas.map((option, index) => {
  const item = document.createElement('div');
  item.id = `area-option-${index}`;
  item.className = 'area-option';
  item.setAttribute('role', 'option');
  item.textContent = option.textContent;
  item.addEventListener('click', event => {
    event.preventDefault();
    areaSelect.value = option.value;
    updateAreaPicker();
    closeAreaPicker();
    areaTrigger.focus();
  });
  areaOptions.append(item);
  return item;
});
areaPicker.append(areaTrigger, areaOptions);
areaSelect.after(areaPicker);
areaSelect.hidden = true;
areaSelect.required = false;
areaSelect.closest('label').htmlFor = areaTrigger.id;

function updateAreaPicker() {
  areaTrigger.textContent = areaSelect.selectedOptions[0].textContent;
  areaTrigger.removeAttribute('aria-invalid');
  areaItems.forEach((item, index) => item.setAttribute('aria-selected', String(availableAreas[index].value === areaSelect.value)));
}
function highlightArea(index) {
  activeArea = (index + areaItems.length) % areaItems.length;
  areaItems.forEach((item, i) => item.classList.toggle('is-active', i === activeArea));
  areaTrigger.setAttribute('aria-activedescendant', areaItems[activeArea].id);
  areaItems[activeArea].scrollIntoView({ block: 'nearest' });
}
function openAreaPicker() {
  areaIsOpen = true;
  areaOptions.hidden = false;
  areaOptions.inert = false;
  areaTrigger.setAttribute('aria-expanded', 'true');
  highlightArea(Math.max(0, availableAreas.findIndex(option => option.value === areaSelect.value)));
  animateSurface(areaOptions, true);
}
function closeAreaPicker() {
  if (!areaIsOpen) return;
  areaIsOpen = false;
  areaTrigger.setAttribute('aria-expanded', 'false');
  areaTrigger.removeAttribute('aria-activedescendant');
  areaOptions.inert = true;
  animateSurface(areaOptions, false, () => { areaOptions.hidden = true; });
}
areaTrigger.addEventListener('click', () => areaIsOpen ? closeAreaPicker() : openAreaPicker());
areaTrigger.addEventListener('keydown', event => {
  if (event.key === 'Escape' || event.key === 'Tab') {
    if (event.key === 'Escape' && areaIsOpen) event.preventDefault();
    closeAreaPicker();
    return;
  }
  if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
    event.preventDefault();
    if (!areaIsOpen) { openAreaPicker(); return; }
    if (event.key === 'ArrowDown') highlightArea(activeArea + 1);
    if (event.key === 'ArrowUp') highlightArea(activeArea - 1);
    if (event.key === 'Home') highlightArea(0);
    if (event.key === 'End') highlightArea(areaItems.length - 1);
    if (event.key === 'Enter' || event.key === ' ') {
      areaSelect.value = availableAreas[activeArea].value;
      updateAreaPicker();
      closeAreaPicker();
    }
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const index = availableAreas.findIndex(option => option.textContent.toLocaleLowerCase('es').startsWith(event.key.toLocaleLowerCase('es')));
    if (index >= 0) { if (!areaIsOpen) openAreaPicker(); highlightArea(index); }
  }
});
document.addEventListener('pointerdown', event => {
  if (!areaPicker.contains(event.target)) closeAreaPicker();
});
areaSelect.addEventListener('change', updateAreaPicker);
updateAreaPicker();

const form = document.querySelector('#consultation-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!areaSelect.value) {
    areaTrigger.setAttribute('aria-invalid', 'true');
    areaTrigger.focus();
    openAreaPicker();
    return;
  }
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const name = fields.get('name').trim();
  const message = fields.get('message').trim();
  if (!name || message.length < 15) {
    const field = !name ? form.elements.name : form.elements.message;
    field.setCustomValidity(!name ? 'Escribe tu nombre.' : 'Describe tu situación con al menos 15 caracteres.');
    field.reportValidity();
    field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
    return;
  }
  const text = `Hola, VERA. Quisiera realizar una consulta legal.\n\nNombre: ${name}\nCorreo: ${fields.get('email').trim()}\nÁrea: ${fields.get('area')}\n\nMi consulta:\n${message}`;
  window.location.assign(`https://wa.me/51999999999?text=${encodeURIComponent(text)}`);
});

document.querySelector('.bubble-close').addEventListener('click', () => {
  const bubble = document.querySelector('#whatsapp-bubble');
  bubble.inert = true;
  animateSurface(bubble, false, () => { bubble.hidden = true; });
});
animateSurface(document.querySelector('#whatsapp-bubble'), true);

const privacyDialog = document.querySelector('#privacy-dialog');
function closePrivacy() {
  animateSurface(privacyDialog, false, () => privacyDialog.close());
}
document.querySelector('#privacy-open').addEventListener('click', () => {
  privacyDialog.showModal();
  animateSurface(privacyDialog, true);
});
privacyDialog.querySelector('.dialog-close').addEventListener('click', closePrivacy);
privacyDialog.addEventListener('cancel', event => {
  event.preventDefault();
  closePrivacy();
});
privacyDialog.addEventListener('click', event => {
  if (event.target !== privacyDialog) return;
  const bounds = privacyDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePrivacy();
});
document.querySelector('#year').textContent = new Date().getFullYear();
