/* Мастер на выезде — заявка в WhatsApp без бэкенда */
(function () {
  'use strict';

  /* Тема: состояние уже выставлено в <head>, здесь только кнопка и сохранение */
  var root = document.documentElement;
  var themeButton = document.getElementById('themeToggle');

  function syncThemeButton() {
    var dark = root.getAttribute('data-theme') === 'dark';
    themeButton.setAttribute('aria-pressed', dark ? 'true' : 'false');
    themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    themeButton.querySelector('.theme-toggle__label').textContent = dark ? 'Светлая' : 'Тёмная';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#000000' : '#FFFFFF');
  }

  syncThemeButton();
  themeButton.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    try {
      localStorage.setItem('theme', dark ? 'light' : 'dark');
    } catch (error) {
      /* приватный режим — просто переключаем без сохранения */
    }
    syncThemeButton();
  });

  /* Анимация при прокрутке: появление блоков, параллакс и прогресс */
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var progressFill = document.getElementById('scrollProgressFill');
    var targets = [];

    ['section .kicker', 'section h2', '.step', '.problem', '.order__copy', '.order-card', '.footer__inner'].forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {
        if (targets.indexOf(element) === -1) targets.push(element);
      });
    });

    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (element) { element.classList.add('is-visible'); });
    } else {
      targets.forEach(function (element) { element.classList.add('reveal'); });

      /* Лёгкая задержка между карточками в сетке */
      Array.prototype.forEach.call(document.querySelectorAll('.steps, .problems'), function (group) {
        Array.prototype.forEach.call(group.children, function (card, index) {
          if (card.classList.contains('reveal')) {
            card.style.transitionDelay = Math.min(index, 4) * 70 + 'ms';
          }
        });
      });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      targets.forEach(function (element) { observer.observe(element); });
    }

    var heroArt = document.querySelector('.hero__art');
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset || 0;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      if (progressFill) progressFill.style.width = Math.min(100, (y / max) * 100) + '%';
      if (!reduce && heroArt) heroArt.style.transform = 'translateY(' + Math.min(y, 600) * 0.08 + 'px)';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  })();

  var WHATSAPP = 'https://wa.me/79997564111';
  var form = document.getElementById('leadForm');
  if (!form) return;

  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var fields = {
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    issue: document.getElementById('issue')
  };

  function setError(key, message) {
    var input = fields[key];
    var wrapper = input.closest('.field');
    var error = document.getElementById(key + '-error');

    if (message) {
      wrapper.classList.add('has-error');
      error.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      return false;
    }
    wrapper.classList.remove('has-error');
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    return true;
  }

  function validateName() {
    var value = fields.name.value.trim();
    return setError('name', value.length < 2 ? 'Укажите имя — хотя бы 2 буквы.' : '');
  }

  function validatePhone() {
    var digits = fields.phone.value.replace(/\D/g, '');
    var ok = digits.length >= 10 && digits.length <= 11;
    return setError('phone', ok ? '' : 'Проверьте номер: нужно 10–11 цифр.');
  }

  function validateIssue() {
    var value = fields.issue.value.trim();
    return setError('issue', value.length < 3 ? 'Напишите пару слов о поломке.' : '');
  }

  function formatPhone(raw) {
    var digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;

    var rest = digits.slice(1, 11);
    var out = '+7';
    if (rest.length > 0) out += ' (' + rest.slice(0, 3);
    if (rest.length >= 3) out += ')';
    if (rest.length > 3) out += ' ' + rest.slice(3, 6);
    if (rest.length > 6) out += '-' + rest.slice(6, 8);
    if (rest.length > 8) out += '-' + rest.slice(8, 10);
    return out;
  }

  fields.phone.addEventListener('input', function () {
    var wasAtEnd = fields.phone.selectionStart === fields.phone.value.length;
    fields.phone.value = formatPhone(fields.phone.value);
    if (wasAtEnd) {
      var end = fields.phone.value.length;
      fields.phone.setSelectionRange(end, end);
    }
    if (fields.phone.closest('.field').classList.contains('has-error')) validatePhone();
  });

  fields.name.addEventListener('input', function () {
    if (fields.name.closest('.field').classList.contains('has-error')) validateName();
  });

  fields.issue.addEventListener('input', function () {
    if (fields.issue.closest('.field').classList.contains('has-error')) validateIssue();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var valid = [validateName(), validatePhone(), validateIssue()].every(Boolean);
    if (!valid) {
      status.textContent = 'Проверьте выделенные поля.';
      status.classList.remove('is-success');
      var firstError = document.querySelector('.field.has-error input, .field.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    var brand = document.getElementById('brand').value.trim();
    var message = [
      'Заявка с сайта — вызов мастера:',
      'Имя: ' + fields.name.value.trim(),
      'Телефон: ' + fields.phone.value.trim(),
      'Марка машины: ' + (brand || 'не указана'),
      'Поломка: ' + fields.issue.value.trim()
    ].join('\n');

    var url = WHATSAPP + '?text=' + encodeURIComponent(message);
    var originalLabel = submitBtn.innerHTML;

    status.textContent = 'Открываем WhatsApp…';
    status.classList.remove('is-success');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="btn__icon"><use href="#i-wa"/></svg> Открываем…';

    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
      status.textContent = 'Готово — сообщение ждёт в WhatsApp. Если чат не открылся, нажмите «Написать напрямую» ниже.';
      status.classList.add('is-success');
    }, 900);
  });
})();
