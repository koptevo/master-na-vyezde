/* Мастер на выезде — тема, появление блоков, заявка в WhatsApp без бэкенда */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- тема ---------- */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var themeButton = document.getElementById('themeBtn');

  function isDark() {
    return root.getAttribute('data-theme') === 'dark';
  }

  function syncThemeButton() {
    if (!themeButton) return;
    var dark = isDark();
    themeButton.setAttribute('aria-pressed', dark ? 'true' : 'false');
    themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#14181a' : '#f7f5f1');
  }

  syncThemeButton();

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var dark = !isDark();
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      } catch (error) {
        /* приватный режим — переключаем без сохранения */
      }
      syncThemeButton();
    });
  }

  /* ---------- появление секций при прокрутке ---------- */
  (function () {
    var items = document.querySelectorAll('.reveal');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reduce) {
      Array.prototype.forEach.call(items, function (item) {
        item.classList.add('is-in');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    Array.prototype.forEach.call(items, function (item) {
      observer.observe(item);
    });
  })();

  /* ---------- заявка в WhatsApp ---------- */
  var WHATSAPP = 'https://wa.me/79997564111';
  var form = document.getElementById('leadForm');
  if (!form) return;

  var errorBox = document.getElementById('leadErr');
  var submitButton = form.querySelector('button[type="submit"]');
  var nameInput = form.elements.name;
  var phoneInput = form.elements.phone;
  var brandInput = form.elements.brand;
  var problemInput = form.elements.problem;

  function setError(message, field) {
    if (errorBox) errorBox.textContent = message || '';
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      field.focus();
    }
    return !message;
  }

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
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

  phoneInput.addEventListener('input', function () {
    var atEnd = phoneInput.selectionStart === phoneInput.value.length;
    phoneInput.value = formatPhone(phoneInput.value);
    if (atEnd) {
      var end = phoneInput.value.length;
      phoneInput.setSelectionRange(end, end);
    }
    clearFieldError(phoneInput);
  });

  nameInput.addEventListener('input', function () { clearFieldError(nameInput); });
  problemInput.addEventListener('input', function () { clearFieldError(problemInput); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var name = nameInput.value.trim();
    var phoneDigits = phoneInput.value.replace(/\D/g, '');

    if (name.length < 2) {
      setError('Укажите имя — хотя бы 2 буквы.', nameInput);
      return;
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError('Проверьте номер: нужно 10–11 цифр.', phoneInput);
      return;
    }

    setError('');

    var message = [
      'Заявка с сайта — вызов мастера:',
      'Имя: ' + name,
      'Телефон: ' + phoneInput.value.trim(),
      'Марка машины: ' + (brandInput.value.trim() || 'не указана'),
      'Поломка: ' + (problemInput.value.trim() || 'не указана')
    ].join('\n');

    var link = document.createElement('a');
    link.href = WHATSAPP + '?text=' + encodeURIComponent(message);
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (submitButton) {
      var label = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Открываем WhatsApp…';
      window.setTimeout(function () {
        submitButton.disabled = false;
        submitButton.textContent = label;
      }, 2000);
    }
  });
})();
