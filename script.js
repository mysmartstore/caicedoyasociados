// copy NIT
function copyNit() {
  const nit = '900319806-5';
  navigator.clipboard?.writeText(nit).then(() => {
    alert('NIT copiado: ' + nit);
  }).catch(() => {
    prompt('Copie manualmente el NIT:', nit);
  });
}

// accordion behaviour
document.querySelectorAll('.accordion button').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.nextElementSibling;
    const isOpen = panel.style.display === 'block';
    document.querySelectorAll('.accordion .panel').forEach(p => p.style.display = 'none');
    if (!isOpen) {
      panel.style.display = 'block';
    }
  });
});

// make service items expandable: click toggles a small alert with title (light interactivity)
document.querySelectorAll('.service').forEach(s => {
  s.addEventListener('click', () => {
    const title = s.querySelector('h4')?.innerText || 'Servicio';
    alert(title + '\n\nPara más información, contacte a la firma.');
  });
});

// smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// script.js - integración con EmailJS
// IMPORTANTE: reemplazar los placeholders con tus IDs de EmailJS
const EMAILJS_USER_ID = 'ev7EfoljxruxIhOXp';     // p.ej.: user_xxx...
const EMAILJS_SERVICE_ID = 'service_a4z8nx9'; // p.ej.: service_xxx
const EMAILJS_TEMPLATE_ID = 'template_k7m0jzr'; // p.ej.: template_xxx

// Carga dinámica del SDK de EmailJS si no está presente
function loadEmailJSScript() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve(window.emailjs);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    script.onload = () => resolve(window.emailjs);
    script.onerror = () => reject(new Error('No se pudo cargar EmailJS'));
    document.head.appendChild(script);
  });
}

async function initEmailJS() {
  try {
    await loadEmailJSScript();
    if (!EMAILJS_USER_ID || EMAILJS_USER_ID.includes('YOUR_')) {
      console.warn('EmailJS user ID no configurado. Reemplace EMAILJS_USER_ID con su valor real.');
    }
    // Inicializar (siempre es seguro llamar a init aunque el ID sea temporal)
    if (window.emailjs && typeof window.emailjs.init === 'function') {
      window.emailjs.init(EMAILJS_USER_ID);
    }
  } catch (err) {
    console.error('Error cargando EmailJS:', err);
  }
}

// Inicializar EmailJS (intenta cargar en background)
initEmailJS();

// Manejo del formulario
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('cf-submit');
  const statusDiv = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.textContent = '';
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const phone = document.getElementById('cf-phone').value.trim();
    const service = document.getElementById('cf-service').value || 'No especificado';
    const message = document.getElementById('cf-message').value.trim();

    if (!name || !email) {
      statusDiv.textContent = 'Por favor complete los campos obligatorios (Nombre y correo).';
      return;
    }

    // Preparar parámetros para la plantilla de EmailJS
    const templateParams = {
      from_name: name,
      from_email: email,
      phone: phone,
      service: service,
      message: message,
      // Puedes añadir más variables y mapearlas en la plantilla de EmailJS.
    };

    // Disable UI while sending
    submitBtn.disabled = true;
    const previousText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    statusDiv.textContent = 'Enviando mensaje...';

    // Intentar enviar vía EmailJS si está disponible
    try {
      if (window.emailjs && typeof window.emailjs.send === 'function' && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && !EMAILJS_SERVICE_ID.includes('YOUR_')) {
        const resp = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        console.log('EmailJS response:', resp);
        statusDiv.style.color = ''; // usa color por defecto (CSS)
        statusDiv.textContent = 'Mensaje enviado correctamente. Gracias.';
        form.reset();
      } else {
        // Si EmailJS no está configurado, fallback a mailto
        throw new Error('EmailJS no configurado o no disponible, usando fallback a mailto.');
      }
    } catch (err) {
      console.warn(err);
      // Fallback: abrir cliente de correo con mailto
      const subject = `Contacto web - ${service} - ${name || 'Sin nombre'}`;
      const bodyLines = [
        `Nombre: ${name || '-'}`,
        `Correo: ${email || '-'}`,
        `Teléfono: ${phone || '-'}`,
        `Servicio de interés: ${service}`,
        '',
        'Mensaje:',
        message || '-'
      ];
      const mailto = `mailto:gameplayscongiu@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      // Intentar abrir cliente de correo
      window.location.href = mailto;
      statusDiv.textContent = 'Si su cliente de correo no se abrió, por favor escriba a gameplayscongiu@gmail.com';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = previousText;
      // limpiar mensaje de estado después de unos segundos (opcional)
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 6000);
    }
  });
});
