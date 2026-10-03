/**
 * V.J Tuition Center, Kumbakonam
 * Main Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Mobile Navigation Drawer
  initMobileNav();

  // 2. Sticky Navbar Scroll Effect
  initStickyNavbar();

  // 3. Modals Management (Admission & Careers)
  initModals();

  // 4. Admission Enquiry Form Handling
  initAdmissionForm();

  // 5. Careers Application Form Handling
  initCareersForm();

  // 6. Contact Form Handling
  initContactForm();

  // 7. FAQ Accordion
  initFaqAccordion();

  // 8. Gallery Filter & Lightbox
  initGallery();

  // 9. Demo Data Viewer Badge
  initDemoDataBadge();
});

/* ==========================================================================
   1. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-menu-overlay');

  if (!menuBtn || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.remove('-translate-x-full');
    if (overlay) overlay.classList.remove('hidden', 'opacity-0');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden');
  }

  function closeMenu() {
    mobileMenu.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('opacity-0');
    setTimeout(() => {
      if (overlay) overlay.classList.add('hidden');
    }, 200);
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
  }

  menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close when clicking nav links
  const navLinks = mobileMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
}

/* ==========================================================================
   2. STICKY NAVBAR
   ========================================================================== */
function initStickyNavbar() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-md');
      header.classList.remove('bg-white');
    } else {
      header.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-md');
      header.classList.add('bg-white');
    }
  }, { passive: true });
}

/* ==========================================================================
   3. MODAL CONTROLS (Universal)
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('overflow-hidden');

  // Set focus on first input if exists
  const firstInput = modal.querySelector('input, select, textarea');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('overflow-hidden');
}

function initModals() {
  // Global Escape key to close active modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-backdrop.active, .lightbox-modal.active');
      activeModals.forEach(m => {
        m.classList.remove('active');
      });
      document.body.classList.remove('overflow-hidden');
    }
  });

  // Modal backdrop click close
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Admission trigger buttons
  document.querySelectorAll('[data-open-admission]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const preferredClass = btn.getAttribute('data-class') || '';
      if (preferredClass) {
        const classSelect = document.getElementById('enquiry-class');
        if (classSelect) classSelect.value = preferredClass;
      }
      openModal('admission-modal');
    });
  });

  // Close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close-modal');
      closeModal(targetId);
    });
  });
}

/* ==========================================================================
   4. ADMISSION ENQUIRY FORM (LocalStorage + Validation)
   ========================================================================== */
function initAdmissionForm() {
  const form = document.getElementById('admission-form');
  const modalForm = document.getElementById('admission-modal-form');

  [form, modalForm].forEach(currentForm => {
    if (!currentForm) return;

    currentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const studentName = currentForm.querySelector('[name="student_name"]')?.value.trim();
      const parentName = currentForm.querySelector('[name="parent_name"]')?.value.trim();
      const phone = currentForm.querySelector('[name="phone"]')?.value.trim();
      const studentClass = currentForm.querySelector('[name="class"]')?.value;
      const subject = currentForm.querySelector('[name="subject"]')?.value.trim() || 'All Core Subjects';
      const batch = currentForm.querySelector('[name="batch"]')?.value || 'Evening Regular';
      const message = currentForm.querySelector('[name="message"]')?.value.trim() || 'Direct Enquiry';

      // Validation
      if (!studentName || !parentName || !phone || !studentClass) {
        showToast('Required Fields Missing', 'Please fill in Student Name, Parent Name, Phone, and Class.', 'error');
        return;
      }

      const phoneRegex = /^[0-9+\s-]{10,14}$/;
      if (!phoneRegex.test(phone)) {
        showToast('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.', 'error');
        return;
      }

      const enquiryId = 'VJ-' + Math.floor(100000 + Math.random() * 900000);
      const timestamp = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const enquiryData = {
        id: enquiryId,
        studentName,
        parentName,
        phone,
        class: studentClass,
        subject,
        batch,
        message,
        timestamp,
        status: 'Received'
      };

      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('vj_admission_enquiries') || '[]');
        existing.unshift(enquiryData);
        localStorage.setItem('vj_admission_enquiries', JSON.stringify(existing));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // Close modal if open
      closeModal('admission-modal');

      // Populate Success Modal
      const confIdElem = document.getElementById('conf-enquiry-id');
      const confStudentElem = document.getElementById('conf-student-name');
      const confClassElem = document.getElementById('conf-class');
      const confPhoneElem = document.getElementById('conf-phone');
      const whatsappBtn = document.getElementById('conf-whatsapp-btn');

      if (confIdElem) confIdElem.textContent = enquiryId;
      if (confStudentElem) confStudentElem.textContent = studentName;
      if (confClassElem) confClassElem.textContent = studentClass;
      if (confPhoneElem) confPhoneElem.textContent = phone;

      if (whatsappBtn) {
        const waText = encodeURIComponent(`Hello V.J Tuition Center Kumbakonam! I have submitted an admission enquiry for ${studentName} (${studentClass}). Enquiry ID: ${enquiryId}. Please provide batch timings and details.`);
        whatsappBtn.href = `https://wa.me/919443123456?text=${waText}`;
      }

      openModal('admission-success-modal');
      currentForm.reset();
      showToast('Enquiry Submitted!', `Application ${enquiryId} recorded successfully in demo storage.`, 'success');
      updateDemoBadgeCount();
    });
  });
}

/* ==========================================================================
   5. CAREERS APPLICATION FORM
   ========================================================================== */
function initCareersForm() {
  const jobModal = document.getElementById('career-modal');
  const jobForm = document.getElementById('career-form');

  // Trigger buttons from job cards
  document.querySelectorAll('[data-apply-job]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const position = btn.getAttribute('data-job-title') || 'Faculty Role';
      const posSelect = document.getElementById('career-position');
      const modalJobTitle = document.getElementById('career-modal-job-title');

      if (posSelect) posSelect.value = position;
      if (modalJobTitle) modalJobTitle.textContent = position;

      openModal('career-modal');
    });
  });

  if (!jobForm) return;

  jobForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = jobForm.querySelector('[name="full_name"]')?.value.trim();
    const phone = jobForm.querySelector('[name="phone"]')?.value.trim();
    const email = jobForm.querySelector('[name="email"]')?.value.trim();
    const position = jobForm.querySelector('[name="position"]')?.value;
    const qualification = jobForm.querySelector('[name="qualification"]')?.value.trim();
    const experience = jobForm.querySelector('[name="experience"]')?.value;
    const resumeInput = jobForm.querySelector('[name="resume"]');
    const message = jobForm.querySelector('[name="message"]')?.value.trim() || '';

    if (!fullName || !phone || !email || !qualification) {
      showToast('Incomplete Form', 'Please complete Name, Contact, Email, and Qualification.', 'error');
      return;
    }

    const fileName = resumeInput?.files[0]?.name || 'Demo_Resume.pdf';
    const appId = 'VJ-JOB-' + Math.floor(1000 + Math.random() * 9000);

    const appData = {
      id: appId,
      fullName,
      phone,
      email,
      position,
      qualification,
      experience,
      resumeFileName: fileName,
      message,
      timestamp: new Date().toLocaleString('en-IN')
    };

    try {
      const existing = JSON.parse(localStorage.getItem('vj_job_applications') || '[]');
      existing.unshift(appData);
      localStorage.setItem('vj_job_applications', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    closeModal('career-modal');
    jobForm.reset();
    showToast('Application Submitted!', `Demo application ${appId} for ${position} saved to storage.`, 'success');
    updateDemoBadgeCount();
  });
}

/* ==========================================================================
   6. CONTACT FORM
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = contactForm.querySelector('[name="name"]')?.value.trim();
    const phone = contactForm.querySelector('[name="phone"]')?.value.trim();
    const email = contactForm.querySelector('[name="email"]')?.value.trim();
    const subject = contactForm.querySelector('[name="subject"]')?.value.trim() || 'General Inquiry';
    const message = contactForm.querySelector('[name="message"]')?.value.trim();

    if (!name || !phone || !message) {
      showToast('Missing Details', 'Please enter your name, phone number, and message.', 'error');
      return;
    }

    const messageData = {
      id: 'MSG-' + Date.now(),
      name,
      phone,
      email,
      subject,
      message,
      timestamp: new Date().toLocaleString('en-IN')
    };

    try {
      const msgs = JSON.parse(localStorage.getItem('vj_contact_messages') || '[]');
      msgs.unshift(messageData);
      localStorage.setItem('vj_contact_messages', JSON.stringify(msgs));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    contactForm.reset();
    showToast('Message Sent!', 'Thank you! We will get in touch with you shortly.', 'success');
    updateDemoBadgeCount();
  });
}

/* ==========================================================================
   7. FAQ ACCORDION (Accessible & Smooth)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other accordion items in the same container for clean UX
      const parent = item.closest('.faq-container') || document;
      parent.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('active');
        const otherTrigger = other.querySelector('.faq-trigger');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    // Keyboard support
    trigger.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
}

/* ==========================================================================
   8. GALLERY CATEGORY FILTER & FULLSCREEN LIGHTBOX
   ========================================================================== */
let galleryItems = [];
let currentLightboxIndex = 0;

function initGallery() {
  const filterBtns = document.querySelectorAll('[data-gallery-filter]');
  const items = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('gallery-lightbox');

  if (!items.length) return;

  // Build items array for lightbox
  galleryItems = Array.from(items).map((item, idx) => {
    return {
      element: item,
      index: idx,
      category: item.getAttribute('data-category') || 'all',
      imgSrc: item.querySelector('img')?.getAttribute('src') || '',
      title: item.querySelector('.gallery-title')?.textContent || 'V.J Tuition Center',
      caption: item.querySelector('.gallery-caption')?.textContent || 'Kumbakonam Campus & Student Life'
    };
  });

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCategory = btn.getAttribute('data-gallery-filter');

      // Update active button state
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-900', 'text-white', 'shadow-md');
        b.classList.add('bg-white', 'text-slate-700', 'hover:bg-slate-100');
      });
      btn.classList.add('bg-blue-900', 'text-white', 'shadow-md');
      btn.classList.remove('bg-white', 'text-slate-700', 'hover:bg-slate-100');

      // Filter grid cards
      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (targetCategory === 'all' || itemCategory === targetCategory) {
          item.classList.remove('hidden');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.classList.add('hidden');
          }, 200);
        }
      });
    });
  });

  // Lightbox Trigger
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  if (!lightbox) return;

  // Lightbox controls
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', prevLightbox);
  if (nextBtn) nextBtn.addEventListener('click', nextLightbox);

  // Backdrop click close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox || !galleryItems[index]) return;

  currentLightboxIndex = index;
  updateLightboxContent();
  lightbox.classList.add('active');
  document.body.classList.add('overflow-hidden');
}

function closeLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.classList.remove('overflow-hidden');
}

function prevLightbox() {
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
  updateLightboxContent();
}

function nextLightbox() {
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryItems.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = galleryItems[currentLightboxIndex];
  if (!item) return;

  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const caption = document.getElementById('lightbox-caption');
  const counter = document.getElementById('lightbox-counter');
  const badge = document.getElementById('lightbox-category-badge');

  if (img) img.src = item.imgSrc;
  if (title) title.textContent = item.title;
  if (caption) caption.textContent = item.caption;
  if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${galleryItems.length}`;
  if (badge) badge.textContent = item.category.toUpperCase();
}

/* ==========================================================================
   9. TOAST NOTIFICATIONS & DEMO STORAGE BADGE
   ========================================================================== */
function showToast(title, message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'error' ? 'bg-red-900 border-red-700' : 'bg-slate-900 border-slate-700';
  const iconName = type === 'error' ? 'alert-circle' : 'check-circle';
  const iconColor = type === 'error' ? 'text-red-400' : 'text-emerald-400';

  toast.className = `toast flex items-start gap-3 p-4 max-w-sm rounded-xl border text-white shadow-2xl ${bgClass}`;
  toast.innerHTML = `
    <div class="${iconColor} shrink-0 mt-0.5">
      <i data-lucide="${iconName}" class="w-5 h-5"></i>
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-sm">${title}</div>
      <div class="text-xs text-slate-300 mt-0.5 leading-relaxed">${message}</div>
    </div>
    <button class="text-slate-400 hover:text-white shrink-0 -mr-1 -mt-1 p-1" onclick="this.parentElement.remove()">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => toast.classList.add('show'), 20);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}

function initDemoDataBadge() {
  updateDemoBadgeCount();

  const openDrawerBtn = document.getElementById('open-demo-drawer-btn');
  if (openDrawerBtn) {
    openDrawerBtn.addEventListener('click', () => {
      renderDemoDataDrawer();
      openModal('demo-data-modal');
    });
  }

  const clearStorageBtn = document.getElementById('clear-demo-storage-btn');
  if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', () => {
      if (confirm('Clear demo data stored in localStorage?')) {
        localStorage.removeItem('vj_admission_enquiries');
        localStorage.removeItem('vj_job_applications');
        localStorage.removeItem('vj_contact_messages');
        renderDemoDataDrawer();
        updateDemoBadgeCount();
        showToast('Storage Reset', 'Demo stored data cleared.', 'success');
      }
    });
  }
}

function updateDemoBadgeCount() {
  const badge = document.getElementById('demo-data-counter');
  if (!badge) return;

  const enqs = JSON.parse(localStorage.getItem('vj_admission_enquiries') || '[]');
  const jobs = JSON.parse(localStorage.getItem('vj_job_applications') || '[]');
  const msgs = JSON.parse(localStorage.getItem('vj_contact_messages') || '[]');
  const total = enqs.length + jobs.length + msgs.length;

  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

function renderDemoDataDrawer() {
  const container = document.getElementById('demo-data-list');
  if (!container) return;

  const enqs = JSON.parse(localStorage.getItem('vj_admission_enquiries') || '[]');
  const jobs = JSON.parse(localStorage.getItem('vj_job_applications') || '[]');
  const msgs = JSON.parse(localStorage.getItem('vj_contact_messages') || '[]');

  if (enqs.length === 0 && jobs.length === 0 && msgs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 text-slate-400">
        <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p class="text-sm">No demo entries stored in browser yet.</p>
        <p class="text-xs text-slate-500 mt-1">Submit an Admission Enquiry, Job Application, or Contact Message to see it here.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = '';

  if (enqs.length > 0) {
    html += `<div class="mb-5"><h4 class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Admission Enquiries (${enqs.length})</h4><div class="space-y-2">`;
    enqs.forEach(e => {
      html += `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div class="flex justify-between font-semibold text-slate-900">
            <span>${e.studentName} <span class="text-blue-700">(${e.class})</span></span>
            <span class="text-slate-500 font-mono text-[10px]">${e.id}</span>
          </div>
          <div class="text-slate-600">Parent: ${e.parentName} | Phone: <a href="tel:${e.phone}" class="text-blue-600">${e.phone}</a></div>
          <div class="text-slate-500 text-[11px]">Batch: ${e.batch} | Subjects: ${e.subject}</div>
          <div class="text-slate-400 text-[10px]">${e.timestamp}</div>
        </div>
      `;
    });
    html += `</div></div>`;
  }

  if (jobs.length > 0) {
    html += `<div class="mb-5"><h4 class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Job Applications (${jobs.length})</h4><div class="space-y-2">`;
    jobs.forEach(j => {
      html += `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div class="flex justify-between font-semibold text-slate-900">
            <span>${j.fullName}</span>
            <span class="text-emerald-700 font-medium">${j.position}</span>
          </div>
          <div class="text-slate-600">Qualification: ${j.qualification} | Exp: ${j.experience}</div>
          <div class="text-slate-500">Phone: ${j.phone} | Resume: ${j.resumeFileName}</div>
          <div class="text-slate-400 text-[10px]">${j.timestamp}</div>
        </div>
      `;
    });
    html += `</div></div>`;
  }

  if (msgs.length > 0) {
    html += `<div><h4 class="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Contact Messages (${msgs.length})</h4><div class="space-y-2">`;
    msgs.forEach(m => {
      html += `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div class="flex justify-between font-semibold text-slate-900">
            <span>${m.name}</span>
            <span class="text-slate-500">${m.phone}</span>
          </div>
          <div class="text-slate-700">${m.message}</div>
          <div class="text-slate-400 text-[10px]">${m.timestamp}</div>
        </div>
      `;
    });
    html += `</div></div>`;
  }

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}
