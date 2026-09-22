// Datos de muestra: reemplaza este objeto con la información real del evento.
const APP_CONFIG = {
  eventDate: '2027-08-18T16:00:00-06:00',
  calendarEnd: '2027-08-19T01:00:00-06:00',
  couple: 'Natalia & Vicente',
  venue: 'Ubicación por confirmar',
  whatsapp: ''
};

const entrance = document.querySelector('#entrance');
const envelope = document.querySelector('#open-envelope');
const isPreview = new URLSearchParams(window.location.search).has('preview');

function enterInvitation() {
  if (envelope.classList.contains('is-open')) return;
  envelope.classList.add('is-open');
  envelope.setAttribute('aria-label', 'Invitación abierta');
  window.setTimeout(() => {
    entrance.classList.add('is-gone');
    document.body.classList.remove('is-locked');
    document.querySelector('#main-title').focus?.({ preventScroll: true });
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 1750);
}

if (isPreview) {
  entrance.classList.add('is-gone');
} else {
  document.body.classList.add('is-locked');
}
envelope.addEventListener('click', enterInvitation);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !entrance.classList.contains('is-gone')) enterInvitation();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16, rootMargin: '0px 0px -45px' });

document.querySelectorAll('.reveal').forEach((element) => {
  if (isPreview) element.classList.add('is-visible');
  else revealObserver.observe(element);
});

const countdownIds = ['days', 'hours', 'minutes', 'seconds'];
function updateCountdown() {
  const distance = Math.max(0, new Date(APP_CONFIG.eventDate).getTime() - Date.now());
  const values = [
    Math.floor(distance / 86400000),
    Math.floor((distance % 86400000) / 3600000),
    Math.floor((distance % 3600000) / 60000),
    Math.floor((distance % 60000) / 1000)
  ];
  countdownIds.forEach((id, index) => {
    document.querySelector(`#${id}`).textContent = String(values[index]).padStart(2, '0');
  });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

document.querySelector('[data-placeholder="regalos"]').addEventListener('click', (event) => {
  event.currentTarget.textContent = 'Información por confirmar';
});

document.querySelector('#rsvp-button').addEventListener('click', async () => {
  const status = document.querySelector('#rsvp-status');
  const message = `Hola, queremos confirmar nuestra asistencia a la boda de ${APP_CONFIG.couple}.`;
  if (APP_CONFIG.whatsapp) {
    window.open(`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    status.textContent = 'Abriendo WhatsApp…';
    return;
  }
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = 'Mensaje copiado. Falta configurar el número de WhatsApp.';
  } catch {
    status.textContent = 'Falta configurar el número de WhatsApp en script.js.';
  }
});

function toICSDate(dateString) {
  return new Date(dateString).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

document.querySelector('#calendar-button').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitacion//Boda//ES',
    'BEGIN:VEVENT', `DTSTART:${toICSDate(APP_CONFIG.eventDate)}`,
    `DTEND:${toICSDate(APP_CONFIG.calendarEnd)}`, `SUMMARY:Boda de ${APP_CONFIG.couple}`,
    `LOCATION:${APP_CONFIG.venue}`, 'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'boda-natalia-vicente.ics';
  link.click();
  URL.revokeObjectURL(url);
});

