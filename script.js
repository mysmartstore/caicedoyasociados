/* script.js - versión corregida
   - Todos los selectores y listeners que tocan el DOM se registran dentro de DOMContentLoaded
   - Menú hamburguesa funciona (toggle .open en nav)
   - Accordion con aria-expanded
   - Copiar NIT con feedback
   - Smooth scroll para anchors
   - EmailJS init + manejo del formulario (mantuve tu logic de EmailJS)
*/

/* ---------- EmailJS helpers (se mantienen fuera del DOMContentLoaded) ---------- */
const EMAILJS_USER_ID = "ev7EfoljxruxIhOXp";
const EMAILJS_SERVICE_ID = "service_j0xtsbm";
const EMAILJS_TEMPLATE_ID = "template_k7m0jzr";

function loadEmailJSScript() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve(window.emailjs);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
    script.onload = () => resolve(window.emailjs);
    script.onerror = () => reject(new Error("No se pudo cargar EmailJS"));
    document.head.appendChild(script);
  });
}

async function initEmailJS() {
  try {
    await loadEmailJSScript();
    if (window.emailjs && typeof window.emailjs.init === "function") {
      window.emailjs.init(EMAILJS_USER_ID);
    }
  } catch (err) {
    console.error("Error cargando EmailJS:", err);
  }
}
// intenta inicializar EmailJS (no bloqueante)
initEmailJS();

/* ---------- Función utilitaria: copiar NIT ---------- */
function copyNit() {
  const nit = "900319806-5";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(nit)
      .then(() => {
        // Buscar el botón y darle feedback si existe
        const copyBtn = document.querySelector(".copyNit");
        if (copyBtn) {
          const original = copyBtn.textContent;
          copyBtn.textContent = "Copiado";
          copyBtn.setAttribute("aria-live", "polite");
          setTimeout(() => (copyBtn.textContent = original), 1500);
        } else {
          alert("NIT copiado: " + nit);
        }
      })
      .catch(() => {
        prompt("Copie manualmente el NIT:", nit);
      });
  } else {
    // fallback antiguo
    prompt("Copie manualmente el NIT:", nit);
  }
}

/* ---------- DOMContentLoaded: listeners que requieren elementos ---------- */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- menú hamburguesa ---------------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav") || document.querySelector(".nav-links");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open");
      menuToggle.classList.toggle("is-open"); // útil si quieres animar el icono via CSS
    });

    // Cerrar menú si se hace click fuera (opcional, mejora UX)
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("is-open");
      }
    });
  }

  /* ---------------- copiar NIT ---------------- */
  const copyBtn = document.querySelector(".copyNit");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyNit);
    copyBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyNit();
      }
    });
  }

  /* ---------------- accordion ---------------- */
  document.querySelectorAll(".accordion button").forEach((btn) => {
    // estado inicial aria-expanded
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const panel = document.getElementById(targetId);
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // cerrar todos
      document.querySelectorAll(".accordion button").forEach(b => b.setAttribute("aria-expanded", "false"));
      document.querySelectorAll(".accordion .panel").forEach(p => (p.style.display = "none"));

      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        if (panel) panel.style.display = "block";
      } else {
        btn.setAttribute("aria-expanded", "false");
        if (panel) panel.style.display = "none";
      }
    });
  });

  /* ---------------- service items (interactividad ligera) ---------------- */
  document.querySelectorAll(".service").forEach((s) => {
    s.addEventListener("click", () => {
      const title = s.querySelector("h4")?.innerText || "Servicio";
      // llamada a acción ligera: mejor usar modal en vez de alert si lo prefieres
      alert(title + "\n\nPara más información, contacte a la firma.");
    });
  });

  /* ---------------- smooth scroll para anchors  ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      // si es solo "#" no hacemos nada
      if (!href || href === "#") return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // si el nav está abierto (mobile), lo cerramos
        if (nav && nav.classList.contains("open")) {
          nav.classList.remove("open");
          if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.classList.remove("is-open");
          }
        }
      }
    });
  });

  /* ---------------- cerrar nav al hacer click en enlace (mobile) ---------------- */
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => {
      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
        if (menuToggle) menuToggle.classList.remove("is-open");
      }
    });
  });

  /* ---------------- formulario de contacto (EmailJS + fallback) ---------------- */
  const form = document.getElementById("contactForm") || document.getElementById("contactForm"); // por compatibilidad
  const submitBtn = document.getElementById("cf-submit");
  const statusDiv = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!submitBtn || !statusDiv) return;

      statusDiv.textContent = "";
      const name = document.getElementById("cf-name").value.trim();
      const email = document.getElementById("cf-email").value.trim();
      const phone = document.getElementById("cf-phone").value.trim();
      const service = document.getElementById("cf-service").value || "No especificado";
      const message = document.getElementById("cf-message").value.trim();

      if (!name || !email) {
        statusDiv.textContent = "Por favor complete los campos obligatorios (Nombre y correo).";
        return;
      }

      const templateParams = {
        from_name: name,
        from_email: email,
        phone: phone,
        service: service,
        message: message,
      };

      submitBtn.disabled = true;
      const previousText = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
      statusDiv.textContent = "Enviando mensaje...";

      try {
        if (
          window.emailjs &&
          typeof window.emailjs.send === "function" &&
          EMAILJS_SERVICE_ID &&
          EMAILJS_TEMPLATE_ID &&
          !EMAILJS_SERVICE_ID.includes("YOUR_")
        ) {
          await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
          statusDiv.style.color = "";
          statusDiv.textContent = "Mensaje enviado correctamente. Gracias.";
          form.reset();
        } else {
          // fallback a mailto
          throw new Error("EmailJS no configurado o no disponible, usando fallback a mailto.");
        }
      } catch (err) {
        console.warn(err);
        const subject = `Contacto web - ${service} - ${name || "Sin nombre"}`;
        const bodyLines = [
          `Nombre: ${name || "-"}`,
          `Correo: ${email || "-"}`,
          `Teléfono: ${phone || "-"}`,
          `Servicio de interés: ${service}`,
          "",
          "Mensaje:",
          message || "-",
        ];
        const mailto = `mailto:crconsultoresJF@hotmail.com?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

        window.location.href = mailto;
        statusDiv.textContent =
          "Si su cliente de correo no se abrió, por favor escriba a crconsultoresJF@hotmail.com";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = previousText;
        setTimeout(() => {
          statusDiv.textContent = "";
        }, 6000);
      }
    });
  }
}); // end DOMContentLoaded
