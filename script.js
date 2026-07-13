import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { uploadData, remove, list, getUrl } from 'aws-amplify/storage';
import * as d3 from 'd3';
import outputs from './amplify_outputs.json';
import canvasData from './mindmap.json';

const client = generateClient();
window.currentUser = null;

// ==========================================
// Authentication System
// ==========================================
async function hashPassword(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}

window.handleLogin = async function() {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value.trim();
  const err = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  if (!u || !p) { err.style.display = 'block'; err.textContent = 'Please enter username and password'; return; }
  
  btn.textContent = 'Authenticating...';
  err.style.display = 'none';

  try {
    const { data: users } = await client.models.AppUser.list({ filter: { username: { eq: u } } });
    const hashed = await hashPassword(p);

    if (users.length === 0) {
      if (u === 'Admin' && p === '12345') {
        // Bootstrap Admin
        const admin = await client.models.AppUser.create({ username: 'Admin', passwordHash: hashed, role: 'admin' });
        window.currentUser = admin.data;
        completeLogin();
        return;
      }
      err.style.display = 'block'; err.textContent = 'Invalid credentials';
      btn.textContent = 'Initialize Session';
      return;
    }

    if (users[0].passwordHash === hashed) {
      window.currentUser = users[0];
      completeLogin();
    } else {
      err.style.display = 'block'; err.textContent = 'Invalid credentials';
      btn.textContent = 'Initialize Session';
    }
  } catch(e) {
    console.error('Login error', e);
    err.style.display = 'block'; err.textContent = 'Connection error. Please try again.';
    btn.textContent = 'Initialize Session';
  }
};

function completeLogin() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-wrapper').style.display = 'block';
  
  // Reinitialize animations now that the wrapper has dimensions
  if (typeof initGsapAnimations === 'function') {
    initGsapAnimations();
  }

  // Show admin panel if admin
  if (window.currentUser && window.currentUser.role === 'admin') {
    document.getElementById('admin-panel').style.display = 'block';
  }
}

window.adminAddUser = async function() {
  const u = document.getElementById('admin-new-username').value.trim();
  const p = document.getElementById('admin-new-password').value.trim();
  const msg = document.getElementById('admin-add-msg');
  if (!u || !p) return;
  try {
    const { data: existing } = await client.models.AppUser.list({ filter: { username: { eq: u } } });
    if (existing.length > 0) {
      msg.textContent = 'User already exists'; msg.style.color = '#ef4444'; return;
    }
    const hashed = await hashPassword(p);
    await client.models.AppUser.create({ username: u, passwordHash: hashed, role: 'user' });
    msg.textContent = 'User created successfully!'; msg.style.color = '#10b981';
    document.getElementById('admin-new-username').value = '';
    document.getElementById('admin-new-password').value = '';
  } catch(e) { console.error('Add user error', e); msg.textContent = 'Error adding user'; msg.style.color = '#ef4444'; }
};

window.adminResetPassword = async function() {
  const u = document.getElementById('admin-reset-username').value.trim();
  const p = document.getElementById('admin-reset-password').value.trim();
  const msg = document.getElementById('admin-reset-msg');
  if (!u || !p) return;
  try {
    const { data: existing } = await client.models.AppUser.list({ filter: { username: { eq: u } } });
    if (existing.length === 0) {
      msg.textContent = 'User not found'; msg.style.color = '#ef4444'; return;
    }
    const hashed = await hashPassword(p);
    await client.models.AppUser.update({ id: existing[0].id, passwordHash: hashed });
    msg.textContent = 'Password reset successfully!'; msg.style.color = '#10b981';
    document.getElementById('admin-reset-username').value = '';
    document.getElementById('admin-reset-password').value = '';
  } catch(e) { console.error('Reset pwd error', e); msg.textContent = 'Error resetting password'; msg.style.color = '#ef4444'; }
};

// ==========================================
// Configure AWS Amplify
// ==========================================
Amplify.configure(outputs);
console.log("AMPLIFY OUTPUTS:", outputs);
console.log("CLIENT:", client);
console.log("CLIENT.MODELS:", client.models);

// ==========================================
// NAVIGATION & UI LOGIC
// ==========================================
window.showPage = function(pageId) {
  document.querySelectorAll('.page-container').forEach(page => {
    page.classList.remove('active');
  });
  
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    
    // Refresh ScrollTrigger if switching to home page
    if (pageId === 'home') {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const btn = Array.from(document.querySelectorAll('.nav-link')).find(b => 
    b.textContent.toLowerCase().includes(pageId) || 
    (pageId === 'hub' && b.textContent.includes('Hub'))
  );
  if (btn) btn.classList.add('active');
  
  // Close mobile menu if it's open
  const menuContainer = document.getElementById('nav-links-container');
  if (menuContainer && menuContainer.classList.contains('open')) {
    menuContainer.classList.remove('open');
  }
};

window.toggleMobileMenu = function() {
  const container = document.getElementById('nav-links-container');
  if (container) {
    container.classList.toggle('open');
  }
};


// ==========================================
// 3D TILT EFFECT
// ==========================================
function init3DTilt() {
  const tiltElements = document.querySelectorAll('.tilt-element');
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xPercent = x / rect.width;
      const yPercent = y / rect.height;
      
      const rotateX = (0.5 - yPercent) * 20; // max 10 deg
      const rotateY = (xPercent - 0.5) * 20;
      
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
  });
}


// ==========================================
// AWS AMPLIFY & EDIT MODE
// ==========================================
let isEditMode = false;
const HOMEPAGE_ID = 'home-page-content-v2'; // Unique identifier for our AppElement

let glowCards = [
  { id: 'glow-1', title: 'Real-Time Sync', text: 'Connected to AWS Amplify, all changes stream globally across your organization instantly.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' },
  { id: 'glow-2', title: 'D3 Physics Engine', text: 'Force-directed mind mapping with embedded HTML nodes and data flow visualization.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue);"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>' },
  { id: 'glow-3', title: 'Secure Enclave', text: 'Military-grade document storage and organization via the integrated Document Hub.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>' },
  { id: 'glow-4', title: 'Automated Deployment', text: 'Continuous integration pipeline powering instant container scaling and redundancy.', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue);"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>' }
];

async function loadHomeElementsAWS() {
  try {
    const { data: elements } = await client.models.HomeElement.list();
    if (elements) {
      elements.forEach(elData => {
        if (elData.elementId === 'home-glow-cards-data') {
          glowCards = JSON.parse(elData.content);
        } else {
          const domEl = document.getElementById(elData.elementId);
          if (domEl) domEl.innerHTML = elData.content;
        }
      });
    }
    renderGlowCards();
  } catch (error) {
    console.warn("Failed to load home elements from AWS", error);
    renderGlowCards();
  }
}

window.renderGlowCards = function() {
  const container = document.getElementById('home-glow-grid');
  if (!container) return;
  
  container.innerHTML = glowCards.map((card, i) => `
    <div class="glow-card gsap-random">
      ${isEditMode ? `<button class="delete-card-btn" onclick="window.deleteGlowCard('${card.id}')">X</button>` : ''}
      <div class="glow-card-content">
        <div class="glow-card-icon">${card.icon}</div>
        <h3 class="glow-card-title editable" id="${card.id}-title">${card.title}</h3>
        <p class="glow-card-text editable" id="${card.id}-text">${card.text}</p>
      </div>
    </div>
  `).join('');
  
  // Re-attach editable listeners to the newly rendered cards
  setupHomeEditableSync();
};

window.addGlowCard = async function() {
  const newId = 'glow-' + Date.now();
  const icons = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue);"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>'
  ];
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];
  
  glowCards.push({
    id: newId,
    title: 'New Capability',
    text: 'Describe this capability here...',
    icon: randomIcon
  });
  renderGlowCards();
  await saveGlowCardsToAWS();
};

window.deleteGlowCard = async function(id) {
  if(!confirm("Are you sure you want to delete this card?")) return;
  glowCards = glowCards.filter(c => c.id !== id);
  renderGlowCards();
  await saveGlowCardsToAWS();
};

async function saveGlowCardsToAWS() {
  try {
    const { data: existing } = await client.models.HomeElement.list({ filter: { elementId: { eq: 'home-glow-cards-data' } } });
    
    // We only save the ID and icon to structural data.
    // The text will be saved via toggleEditMode when editing ends.
    // However, to keep defaults working, we can just save the whole array.
    
    if (existing && existing.length > 0) {
      await client.models.HomeElement.update({ id: existing[0].id, elementId: 'home-glow-cards-data', content: JSON.stringify(glowCards) });
    } else {
      await client.models.HomeElement.create({ elementId: 'home-glow-cards-data', content: JSON.stringify(glowCards) });
    }
  } catch(e) {
    console.error('Failed to save glow cards structure', e);
  }
}

window.saveHomepageVersion = async function() {
  const btn = document.querySelector('#edit-toolbar .btn-primary');
  if(btn) btn.textContent = 'Saving...';
  
  const editables = [];
  document.querySelectorAll('#page-home .editable').forEach((el, index) => {
    if (!el.id) el.id = 'editable-item-' + index;
    editables.push({ id: el.id, html: el.innerHTML });
  });
  
  glowCards.forEach(card => {
    const titleEl = document.getElementById(card.id + '-title');
    const textEl = document.getElementById(card.id + '-text');
    if (titleEl) card.title = titleEl.innerHTML;
    if (textEl) card.text = textEl.innerHTML;
  });

  const payload = { editables, glowCards };

  try {
    await client.models.AppElement.create({
      type: 'homepage-version',
      content: JSON.stringify(payload)
    });
    alert("Homepage version saved successfully!");
  } catch(e) {
    console.error("Failed to save homepage version", e);
    alert("Failed to save version.");
  }
  
  if(btn) btn.textContent = 'Save Version';
  
  try {
    const { data: versions } = await client.models.AppElement.list({ filter: { type: { eq: 'homepage-version' } } });
    const versionSelect = document.getElementById('version-select');
    if (versionSelect) {
      versionSelect.innerHTML = '<option value="">Load Version...</option>' + 
        versions.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(v => `<option value="${v.id}">${new Date(v.createdAt).toLocaleString()}</option>`)
                .join('');
    }
  } catch(e) {}
};

window.loadHomepageVersion = async function(versionId) {
  if (!versionId) return;
  if (!confirm("This will overwrite your current screen with the selected version. You still must click 'Save' to publish it. Continue?")) {
    document.getElementById('version-select').value = "";
    return;
  }
  try {
    const { data: existing } = await client.models.AppElement.list({ filter: { id: { eq: versionId } } });
    if (existing && existing.length > 0) {
      const payload = JSON.parse(existing[0].content);
      
      if (payload.editables) {
        payload.editables.forEach(item => {
          const el = document.getElementById(item.id);
          if (el) el.innerHTML = item.html;
        });
      }
      
      if (payload.glowCards) {
        glowCards = payload.glowCards;
        renderGlowCards();
        document.querySelectorAll('#page-home .editable').forEach(el => el.setAttribute('contenteditable', 'true'));
      }
      alert("Version loaded into preview. Click 'Save' in the toolbar to publish these changes.");
    }
  } catch(e) {
    console.error("Failed to load version", e);
  }
  document.getElementById('version-select').value = "";
};

function setupHomeEditableSync() {
  document.querySelectorAll('.editable').forEach((el, index) => {
    if (!el.id) el.id = 'editable-item-' + index;
    
    el.addEventListener('blur', async () => {
      try {
        if (el.id.startsWith('glow-')) {
          const cardId = el.id.replace('-title', '').replace('-text', '');
          const card = glowCards.find(c => c.id === cardId);
          if (card) {
            if (el.id.endsWith('-title')) card.title = el.innerHTML;
            if (el.id.endsWith('-text')) card.text = el.innerHTML;
            await saveGlowCardsToAWS();
          }
        }
        
        const { data: existing } = await client.models.HomeElement.list({ filter: { elementId: { eq: el.id } } });
        if (existing && existing.length > 0) {
          await client.models.HomeElement.update({ id: existing[0].id, elementId: el.id, content: el.innerHTML });
        } else {
          await client.models.HomeElement.create({ elementId: el.id, content: el.innerHTML });
        }
      } catch(e) { console.error('Save failed', e); }
    });
    
    // Shift+Enter behavior
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const span = document.createElement('span');
        span.style.fontSize = '0.7em';
        span.style.opacity = '0.8';
        span.innerHTML = '<br>&#8203;'; // zero width space to force cursor inside
        
        range.deleteContents();
        range.insertNode(span);
        
        // Move cursor inside the span
        range.setStart(span, 1);
        range.setEnd(span, 1);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (e.key === 'Enter') {
        // Blur and save on normal enter if it's a single-line title (optional, leaving default behavior for multiline paragraphs)
      }
    });
  });
}

window.toggleEditMode = async function() {
  isEditMode = !isEditMode;
  const editBtn = document.getElementById('btn-edit');
  const addBtn = document.getElementById('btn-add-section');
  const toolbar = document.getElementById('edit-toolbar');
  
  if (isEditMode) {
    // Enable editing
    editBtn.textContent = 'Save';
    editBtn.style.background = 'var(--accent)';
    editBtn.style.color = '#000';
    if(addBtn) addBtn.style.display = 'block';
    if(toolbar) toolbar.classList.add('show');
    
    const glowAddContainer = document.getElementById('home-glow-add-container');
    if (glowAddContainer) glowAddContainer.style.display = 'block';
    
    const hubRepoAddContainer = document.getElementById('hub-repo-add-container');
    if (hubRepoAddContainer) hubRepoAddContainer.style.display = 'block';
    
    renderGlowCards(); // Re-render to show delete buttons
    
    document.querySelectorAll('#page-home .editable').forEach(el => el.setAttribute('contenteditable', 'true'));
    
    // Load Homepage Versions into the dropdown
    try {
      const { data: versions } = await client.models.AppElement.list({ filter: { type: { eq: 'homepage-version' } } });
      const versionSelect = document.getElementById('version-select');
      if (versionSelect) {
        versionSelect.innerHTML = '<option value="">Load Version...</option>' + 
          versions.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(v => `<option value="${v.id}">${new Date(v.createdAt).toLocaleString()}</option>`)
                  .join('');
      }
    } catch(e) { console.error('Failed to load versions', e); }
  } else {
    // Disable editing & SAVE to AWS
    editBtn.textContent = 'Saving...';
    editBtn.style.opacity = '0.5';
    if(addBtn) addBtn.style.display = 'none';
    if(toolbar) toolbar.classList.remove('show');
    
    const glowAddContainer = document.getElementById('home-glow-add-container');
    if (glowAddContainer) glowAddContainer.style.display = 'none';
    
    const hubRepoAddContainer = document.getElementById('hub-repo-add-container');
    if (hubRepoAddContainer) hubRepoAddContainer.style.display = 'none';
    
    // Update the glowCards array with the latest edited text before saving structural data
    glowCards.forEach(card => {
      const titleEl = document.getElementById(card.id + '-title');
      const textEl = document.getElementById(card.id + '-text');
      if (titleEl) card.title = titleEl.innerHTML;
      if (textEl) card.text = textEl.innerHTML;
    });
    
    renderGlowCards(); // Re-render to hide delete buttons
    
    await saveGlowCardsToAWS();
    
    document.querySelectorAll('#page-home .editable').forEach(el => el.setAttribute('contenteditable', 'false'));
    
    // Clean up GSAP injected inline styles before saving
    const clone = document.getElementById('page-home').cloneNode(true);
    clone.querySelectorAll('.gsap-random').forEach(el => el.removeAttribute('style'));

    try {
      // Save all editable elements individually
      const editableElements = document.querySelectorAll('#page-home .editable');
      for (let i = 0; i < editableElements.length; i++) {
        const el = editableElements[i];
        if (!el.id) el.id = 'editable-item-' + i;
        
        const { data: existing } = await client.models.HomeElement.list({ filter: { elementId: { eq: el.id } } });
        if (existing && existing.length > 0) {
          await client.models.HomeElement.update({
            id: existing[0].id,
            elementId: el.id,
            content: el.innerHTML
          });
        } else {
          await client.models.HomeElement.create({
            elementId: el.id,
            content: el.innerHTML
          });
        }
      }
      
      const status = document.getElementById('save-status');
      status.style.display = 'inline';
      setTimeout(() => status.style.display = 'none', 3000);
      
    } catch (err) {
      console.error("Error saving to AWS Amplify:", err);
      alert("Failed to save. Check console for details.");
    } finally {
      editBtn.textContent = 'Edit';
      editBtn.style.background = 'transparent';
      editBtn.style.color = '#fff';
      editBtn.style.opacity = '1';
    }
  }
};

window.addHomeSection = function() {
  const container = document.getElementById('page-home');
  const newSection = document.createElement('section');
  newSection.className = 'scroll-section gsap-random';
  
  newSection.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; text-align: center;">
      <h2 class="editable" contenteditable="true" style="margin-bottom: 20px; color: var(--accent);">New Custom Module</h2>
      <p class="editable" contenteditable="true" style="color: #9ca3af; line-height: 1.6;">
        Modify this text. The system automatically assigns a randomized animation on creation.
      </p>
    </div>
  `;
  container.appendChild(newSection);
  initGsapAnimations();
};

window.formatText = function(command, value) {
  document.execCommand(command, false, value);
  
  // Since we might have generated span tags, ensure they are editable too when saving
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
      commonAncestor.classList.add('formatted-text');
    } else if (commonAncestor.parentNode) {
      commonAncestor.parentNode.classList.add('formatted-text');
    }
  }
};


// ==========================================
// GSAP SCROLL ANIMATIONS
// ==========================================
const animationTypes = [
  // Fade Up
  { from: { opacity: 0, y: 100 }, to: { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" } },
  // Fade Left
  { from: { opacity: 0, x: 100 }, to: { opacity: 1, x: 0, duration: 1.2, ease: "power4.out" } },
  // Fade Right
  { from: { opacity: 0, x: -100 }, to: { opacity: 1, x: 0, duration: 1.2, ease: "power4.out" } },
  // Zoom In
  { from: { opacity: 0, scale: 0.5 }, to: { opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.7)" } },
  // Spin In
  { from: { opacity: 0, rotation: 180, scale: 0.8 }, to: { opacity: 1, rotation: 0, scale: 1, duration: 1.5, ease: "power3.out" } },
  // Flip X
  { from: { opacity: 0, rotationX: 90 }, to: { opacity: 1, rotationX: 0, duration: 1.5, ease: "expo.out" } },
  // Flip Y
  { from: { opacity: 0, rotationY: 90 }, to: { opacity: 1, rotationY: 0, duration: 1.5, ease: "expo.out" } },
  // Blur (using CSS filter in fromTo)
  { from: { opacity: 0, filter: "blur(20px)" }, to: { opacity: 1, filter: "blur(0px)", duration: 1.5, ease: "power2.out" } },
  // Bounce Drop
  { from: { opacity: 0, y: -150 }, to: { opacity: 1, y: 0, duration: 1.5, ease: "bounce.out" } },
  // 3D Skew
  { from: { opacity: 0, skewX: 30, x: -50 }, to: { opacity: 1, skewX: 0, x: 0, duration: 1.2, ease: "power3.out" } }
];

function initGsapAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.getAll().forEach(t => t.kill());

  const elements = document.querySelectorAll('.gsap-random');
  elements.forEach((el) => {
    // Assign a random animation if it doesn't have one stored
    if (!el.dataset.animIndex) {
      el.dataset.animIndex = Math.floor(Math.random() * animationTypes.length);
    }
    
    const anim = animationTypes[el.dataset.animIndex];
    
    gsap.fromTo(el, 
      anim.from, 
      {
        ...anim.to,
        scrollTrigger: {
          trigger: el,
          start: "top 90%", 
          toggleActions: "play reverse play reverse"
        }
      }
    );
  });

  // 3D Core Layered Scroll Animation
  const coreCards = gsap.utils.toArray('.core-3d-card');
  if (coreCards.length > 0) {
    coreCards.forEach((card, i) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          end: "top 35%",
          scrub: 1
        },
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        ease: "power2.out"
      });
    });
  }
}


// ==========================================
// KANBAN LOGIC
// ==========================================
let draggedItem = null;
let cardCounter = 5;

window.drag = function(event) {
  draggedItem = event.target;
  event.dataTransfer.effectAllowed = 'move';
  setTimeout(() => draggedItem.style.opacity = '0.5', 0);
};

window.allowDrop = function(event) {
  event.preventDefault(); 
  const column = event.target.closest('.kanban-col');
  if(column) column.classList.add('drag-over');
};

document.addEventListener('dragleave', (event) => {
  const column = event.target.closest('.kanban-col');
  if(column) column.classList.remove('drag-over');
});

window.activeKanbanProjectId = 'default';

window.saveKanbanProject = async function() {
  const cards = [];
  document.querySelectorAll('.kanban-card').forEach(card => {
    const isQuestion = !!card.querySelector('.kanban-poll-container');
    const colId = card.closest('.kanban-col').id;
    let title = card.querySelector('.kanban-card-title')?.innerText || '';
    
    if (isQuestion) {
      const opts = {
        a: card.querySelector('input[name="a"]').checked,
        aText: card.querySelector('input[name="aText"]').value,
        b: card.querySelector('input[name="b"]').checked,
        bText: card.querySelector('input[name="bText"]').value,
        otherCheck: card.querySelector('input[name="otherCheck"]').checked,
        otherText: card.querySelector('input[name="otherText"]').value
      };
      cards.push({ id: card.id, colId, isQuestion: true, question: title, answers: JSON.stringify(opts) });
    } else {
      cards.push({ id: card.id, colId, isQuestion: false, question: title });
    }
  });

  const select = document.getElementById('kanban-project-select');
  const payload = {
    projectId: activeKanbanProjectId,
    name: select ? select.options[select.selectedIndex]?.text : activeKanbanProjectId,
    cards: cards
  };

  try {
    const { data: projects } = await client.models.AppElement.list({ filter: { type: { eq: 'kanban-project' } } });
    const existing = projects.find(p => p.content && p.content.includes('"projectId":"' + activeKanbanProjectId + '"'));
    if (existing) {
      await client.models.AppElement.update({
        id: existing.id,
        content: JSON.stringify(payload)
      });
    } else {
      await client.models.AppElement.create({
        type: 'kanban-project',
        content: JSON.stringify(payload)
      });
    }
  } catch(e) { console.error('Failed to save Kanban project', e); }
};

window.loadKanbanProjects = async function() {
  try {
    const { data: projects } = await client.models.AppElement.list({ filter: { type: { eq: 'kanban-project' } } });
    const select = document.getElementById('kanban-project-select');
    if (!select) return;
    
    let optionsHTML = '<option value="default">Default Project</option>';
    projects.forEach(p => {
      if (p.id !== 'kanban-proj-default') {
        const payload = JSON.parse(p.content || '{}');
        if (payload.projectId && payload.projectId !== 'default') {
          optionsHTML += `<option value="${payload.projectId}">${payload.name || payload.projectId}</option>`;
        }
      }
    });
    select.innerHTML = optionsHTML;
    select.value = activeKanbanProjectId;
  } catch(e) { console.error('Failed to load kanban projects', e); }
};

window.newKanbanProject = async function() {
  const name = prompt("Enter new project name:");
  if (!name) return;
  const newId = 'proj-' + Date.now();
  const payload = { projectId: newId, name: name, cards: [] };
  try {
    await client.models.AppElement.create({
      type: 'kanban-project',
      content: JSON.stringify(payload)
    });
    activeKanbanProjectId = newId;
    await window.loadKanbanProjects();
    document.getElementById('kanban-project-select').value = activeKanbanProjectId;
    window.switchKanbanProject(activeKanbanProjectId);
  } catch(e) { alert("Failed to create project"); }
};

window.switchKanbanProject = async function(projId) {
  activeKanbanProjectId = projId;
  
  try {
    const { data: projects } = await client.models.AppElement.list({ filter: { type: { eq: 'kanban-project' } } });
    const existing = projects.find(p => p.content && p.content.includes('"projectId":"' + projId + '"'));
    
    if (existing) {
      document.querySelectorAll('.kanban-card').forEach(c => c.remove());
      const payload = JSON.parse(existing.content || '{}');
      if (payload.cards) {
        payload.cards.forEach(c => {
          // Temporarily disable save during load
          window._isLoadingKanban = true;
          window.addKanbanCard(c.colId, null, { id: c.id, question: c.question, answers: c.answers }, true);
          window._isLoadingKanban = false;
        });
      }
    } else {
      if (projId !== 'default') {
        document.querySelectorAll('.kanban-card').forEach(c => c.remove());
      }
    }
  } catch(e) {}
  
  updateKanbanCounts();
};

window.drop = async function(ev) {
  ev.preventDefault();
  if (ev.target.classList.contains("kanban-col")) {
    const addWrap = ev.target.querySelector('.add-card-wrap');
    if (addWrap) {
      ev.target.insertBefore(draggedItem, addWrap);
    } else {
      ev.target.appendChild(draggedItem);
    }
    await window.saveKanbanProject();
  }
  if (draggedItem) {
    draggedItem.style.opacity = "1";
    draggedItem = null;
  }
  updateKanbanCounts();
};

window.addKanbanCard = function(colId, inputId, existingData = null, skipSave = false) {
  const input = document.getElementById(inputId);
  if (!input && !existingData) return;
  
  const text = existingData ? existingData.question : input.value.trim();
  if (!text) return;
  
  const newCard = document.createElement('div');
  newCard.className = 'kanban-card tilt-element';
  newCard.id = existingData ? existingData.id : 'task' + (cardCounter++);
  newCard.draggable = true;
  newCard.ondragstart = window.drag;
  
  if (colId === 'col-questions') {
    const opts = existingData && existingData.answers ? JSON.parse(existingData.answers) : { a: false, aText: 'Option A', b: false, bText: 'Option B', otherCheck: false, otherText: '' };
    newCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="kanban-card-title" contenteditable="true" onblur="window.saveKanbanTitle()">${text}</div>
        <button onclick="window.deleteKanbanCard('${newCard.id}')" style="background:none; border:none; color:#ef4444; font-size:1rem; cursor:pointer;">&times;</button>
      </div>
      <div style="margin-top: 10px; font-size: 0.8rem;" class="kanban-poll-container">
        <label style="display: flex; margin-bottom: 5px; gap: 5px; align-items: center;">
          <input type="checkbox" name="a" ${opts.a ? 'checked' : ''} onchange="this.setAttribute('checked', this.checked ? 'true' : ''); window.saveKanbanProject();"> 
          <input type="text" name="aText" value="${opts.aText || 'Option A'}" onblur="this.setAttribute('value', this.value); window.saveKanbanProject();" style="background: transparent; border: none; color: #fff; width: 100%; border-bottom: 1px dashed rgba(255,255,255,0.3);">
        </label>
        <label style="display: flex; margin-bottom: 5px; gap: 5px; align-items: center;">
          <input type="checkbox" name="b" ${opts.b ? 'checked' : ''} onchange="this.setAttribute('checked', this.checked ? 'true' : ''); window.saveKanbanProject();"> 
          <input type="text" name="bText" value="${opts.bText || 'Option B'}" onblur="this.setAttribute('value', this.value); window.saveKanbanProject();" style="background: transparent; border: none; color: #fff; width: 100%; border-bottom: 1px dashed rgba(255,255,255,0.3);">
        </label>
        <div style="display: flex; gap: 5px; margin-top: 5px;">
          <input type="checkbox" name="otherCheck" ${opts.otherCheck ? 'checked' : ''} onchange="this.setAttribute('checked', this.checked ? 'true' : ''); window.saveKanbanProject();">
          <input type="text" name="otherText" placeholder="Other..." value="${opts.otherText || ''}" onblur="this.setAttribute('value', this.value); window.saveKanbanProject();" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 100%; font-size: 0.75rem; padding: 2px;">
        </div>
      </div>
    `;
  } else {
    newCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="kanban-card-title" contenteditable="true" onblur="window.saveKanbanTitle()">${text}</div>
        <button onclick="window.deleteKanbanCard('${newCard.id}')" style="background:none; border:none; color:#ef4444; font-size:1rem; cursor:pointer;">&times;</button>
      </div>
      <div class="kanban-card-meta"><span>Priority: Normal</span><span>ATLAS-${cardCounter.toString().padStart(2, '0')}</span></div>
    `;
  }
  
  const col = document.getElementById(colId);
  const addWrap = col.querySelector('.add-card-wrap');
  col.insertBefore(newCard, addWrap);
  
  if (input) input.value = '';
  updateKanbanCounts();
  init3DTilt();
  
  if (!skipSave && !window._isLoadingKanban) {
    window.saveKanbanProject();
  }
};

window.saveKanbanTitle = async function() {
  await window.saveKanbanProject();
};

window.deleteKanbanCard = async function(cardId) {
  if (!confirm('Delete this card?')) return;
  const card = document.getElementById(cardId);
  if (card) card.remove();
  updateKanbanCounts();
  await window.saveKanbanProject();
};

function updateKanbanCounts() {
  document.querySelectorAll('.kanban-col').forEach(col => {
    const count = col.querySelectorAll('.kanban-card').length;
    const h3 = col.querySelector('h3');
    if(h3) h3.setAttribute('data-count', count);
  });
}


// ==========================================
// MIND MAP LOGIC (D3 Force-Directed Graph)
// ==========================================
let mindmapNodes = [];
let mindmapLinks = [];

let simulation, svg, linkGroup, nodeGroup, drawingLine;
const NODE_WIDTH = 140;
const NODE_HEIGHT = 100;

let isDrawing = false;
let drawSourceNode = null;

async function loadCanvasData() {
  try {
    const data = canvasData;
    const ids = new Set();

    if (data.nodes) {
      mindmapNodes = data.nodes
        .filter(n => {
          if (ids.has(String(n.id))) return false;
          ids.add(String(n.id));
          return true;
        })
        .map(n => {
          let nodeColor = null;
          if (n.color) {
            if (n.color.startsWith('#')) nodeColor = n.color;
            else if (n.color === "1") nodeColor = "#ff0a0a"; // red
            else if (n.color === "2") nodeColor = "#ff8c00"; // orange
            else if (n.color === "3") nodeColor = "#ffe000"; // yellow
            else if (n.color === "4") nodeColor = "#39ff14"; // green
            else if (n.color === "5") nodeColor = "#00ffff"; // cyan
            else if (n.color === "6") nodeColor = "#b026ff"; // purple
          }
          return {
            id: String(n.id),
            title: n.text ? n.text.replace(/\*\*/g, '') : 'Node',
            phase: 'active',
            type: 'text',
            url: '',
            x: Number(n.x) || 0,
            y: Number(n.y) || 0,
            fx: Number(n.x) || 0,
            fy: Number(n.y) || 0,
            color: nodeColor
          };
        });
    }
    if (data.edges) {
      mindmapLinks = data.edges
        .filter(e => ids.has(String(e.fromNode)) && ids.has(String(e.toNode)))
        .map(e => ({
          source: String(e.fromNode),
          target: String(e.toNode)
        }));
    }

    if (mindmapNodes.length === 0) {
      mindmapNodes = [{ id: 'Root', title: 'Root Command', phase: 'active', type: 'text', url: '', x: 0, y: 0 }];
    }
  } catch(e) {
    console.error("Could not load mindmap JSON mapping", e);
    if(mindmapNodes.length === 0) mindmapNodes = [{ id: 'Root', title: 'Root Command', phase: 'active', type: 'text', url: '', x: 0, y: 0 }];
  }
}

window.activeMindmapProjectId = 'default';

window.loadMindmapProjects = async function() {
  try {
    const { data: projects } = await client.models.AppElement.list({ filter: { type: { eq: 'mindmap-project' } } });
    const select = document.getElementById('mindmap-project-select');
    if (!select) return;
    
    let optionsHTML = '<option value="default">Default Project</option>';
    projects.forEach(p => {
      if (p.id !== 'mindmap-proj-default') {
        const payload = JSON.parse(p.content || '{}');
        if (payload.projectId && payload.projectId !== 'default') {
          optionsHTML += `<option value="${payload.projectId}">${payload.name || payload.projectId}</option>`;
        }
      }
    });
    select.innerHTML = optionsHTML;
    select.value = activeMindmapProjectId;
  } catch(e) { console.error('Failed to load mindmap projects', e); }
};

window.newMindmapProject = async function() {
  const name = prompt("Enter new mind map project name:");
  if (!name) return;
  const newId = 'proj-' + Date.now();
  const payload = { projectId: newId, name: name, nodes: [], edges: [] };
  try {
    await client.models.AppElement.create({
      type: 'mindmap-project',
      content: JSON.stringify(payload)
    });
    activeMindmapProjectId = newId;
    await window.loadMindmapProjects();
    document.getElementById('mindmap-project-select').value = activeMindmapProjectId;
    await window.switchMindmapProject(activeMindmapProjectId);
  } catch(e) { alert("Failed to create project"); }
};

window.switchMindmapProject = async function(projId) {
  activeMindmapProjectId = projId;
  
  if (projId === 'default') {
    await loadCanvasData();
    renderMindmap();
    return;
  }
  
  try {
    const { data: projects } = await client.models.AppElement.list({ filter: { type: { eq: 'mindmap-project' } } });
    const existing = projects.find(p => p.content && p.content.includes('"projectId":"' + projId + '"'));
    if (existing) {
      const payload = JSON.parse(existing.content || '{}');
      mindmapNodes = payload.nodes || [];
      mindmapLinks = payload.edges || [];
      renderMindmap();
    } else {
      if (projId !== 'default') {
        mindmapNodes = [];
        mindmapLinks = [];
        renderMindmap();
      }
    }
  } catch(e) { console.error("Failed to switch mindmap project", e); }
};

async function loadMindmapFromAWS() {
  await window.loadMindmapProjects();
  if (activeMindmapProjectId !== 'default') {
    await window.switchMindmapProject(activeMindmapProjectId);
  } else {
    await loadCanvasData();
  }
}

window.saveMindmapToAWS = async function() {
  try {
    const btn = document.getElementById('save-cloud-btn');
    if (btn) btn.textContent = 'Saving...';
    
    const safeEdges = mindmapLinks.map(l => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target
    }));
    
    const select = document.getElementById('mindmap-project-select');
    const payload = {
      projectId: activeMindmapProjectId,
      name: select ? select.options[select.selectedIndex]?.text : activeMindmapProjectId,
      nodes: mindmapNodes,
      edges: safeEdges
    };
    
    const { data: projects } = await client.models.AppElement.list({ filter: { type: { eq: 'mindmap-project' } } });
    const existing = projects.find(p => p.content && p.content.includes('"projectId":"' + activeMindmapProjectId + '"'));
    if (existing) {
      await client.models.AppElement.update({
        id: existing.id,
        content: JSON.stringify(payload)
      });
    } else {
      await client.models.AppElement.create({
        type: 'mindmap-project',
        content: JSON.stringify(payload)
      });
    }
    
    if (btn) btn.textContent = 'Saved!';
    setTimeout(() => { if (btn) btn.textContent = 'Save to Cloud'; }, 2000);
  } catch (e) {
    console.error("Failed to save mindmap to AWS", e);
    const btn = document.getElementById('save-cloud-btn');
    if (btn) btn.textContent = 'Error';
    setTimeout(() => { if (btn) btn.textContent = 'Save to Cloud'; }, 2000);
  }
};

async function initMindmap() {
  const container = document.getElementById('graph-container');
  if(!container) return;

  await loadMindmapFromAWS();

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  svg = d3.select('#graph-svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [-1000, -1000, width * 2, height * 2]);
    
  svg.selectAll('*').remove();

  const g = svg.append('g');

  const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
          g.attr("transform", event.transform);
      });
  svg.call(zoom);
  // Auto zoom out slightly so we can see the imported canvas map
  svg.call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(0.5));

  linkGroup = g.append('g').attr('class', 'links');
  
  // Temporary line for manual drawing
  drawingLine = g.append('line')
    .attr('class', 'drawing-line')
    .style('display', 'none');
    
  nodeGroup = g.append('g').attr('class', 'nodes');

  // Gentle simulation to prevent massive flashing/bouncing when importing large JSON
  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(220).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-150))
    .force('collide', d3.forceCollide().radius(80).iterations(2))
    .force('center', d3.forceCenter(0, 0).strength(0.01));

  // Global mousemove for drawing mode
  svg.on('mousemove', (event) => {
    if (isDrawing && drawSourceNode) {
      const transform = d3.zoomTransform(svg.node());
      const pointer = d3.pointer(event, g.node());
      
      drawingLine
        .attr('x1', drawSourceNode.x)
        .attr('y1', drawSourceNode.y)
        .attr('x2', pointer[0])
        .attr('y2', pointer[1]);
    }
  });

  // Global mouseup to cancel drawing if dropped on background
  svg.on('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
      drawSourceNode = null;
      drawingLine.style('display', 'none');
    }
  });

  updateMindmap();
}

function stopPropagation(event) {
  event.stopPropagation();
}

function openNodeUrl(d) {
  if (d.url && d.url.trim() !== '') {
    let url = d.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  } else {
    alert("Please enter a valid URL first.");
  }
}

function updateMindmap() {
  const link = linkGroup.selectAll('line.graph-link')
    .data(mindmapLinks, d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source;
      const t = typeof d.target === 'object' ? d.target.id : d.target;
      return s + '-' + t;
    });
    
  link.exit().remove();
  
  const linkEnter = link.enter().append('line')
    .attr('class', 'graph-link');
    
  const node = nodeGroup.selectAll('foreignObject')
    .data(mindmapNodes, d => d.id);
    
  node.exit().remove();
  
  const nodeEnter = node.enter().append('foreignObject')
    .attr('width', NODE_WIDTH)
    .attr('height', NODE_HEIGHT)
    .attr('x', d => (d.x || 0) - NODE_WIDTH/2)
    .attr('y', d => (d.y || 0) - NODE_HEIGHT/2)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  nodeEnter.append('xhtml:div')
    .attr('class', d => `mindmap-node-card ${d.phase || ''}`)
    .html(d => {
      if (d.type === 'hyperlink') {
        return `
          <textarea class="node-title" placeholder="Title" rows="3">${d.title}</textarea>
          <div class="node-url-wrap">
            <input type="text" class="node-url" value="${d.url || ''}" placeholder="URL" />
            <button class="node-link-btn">Go</button>
          </div>
        `;
      } else {
        return `
          <textarea class="node-title" placeholder="Title" style="margin-bottom: auto;" rows="3">${d.title}</textarea>
          <div style="font-size: 0.65rem; color:#9ca3af; text-align:center;">[${d.id}]</div>
        `;
      }
    });

  const allNodes = nodeEnter.merge(node);
  
  // Apply colors dynamically
  allNodes.select('div')
    .attr('class', d => `mindmap-node-card ${d.phase || ''}`)
    .style('border-top', d => d.color ? `4px solid ${d.color}` : null)
    .style('box-shadow', d => d.color ? `0 0 15px ${d.color}40, inset 0 0 10px ${d.color}20` : null);
  
  // Hover Interactions for Lines
  allNodes.select('div')
    .on('mouseenter', function(event, d) {
      linkGroup.selectAll('.graph-link')
        .classed('active-flow', l => l.source.id === d.id || l.target.id === d.id);
    })
    .on('mouseleave', function(event, d) {
      linkGroup.selectAll('.graph-link').classed('active-flow', false);
    });
    
  // Manual Drawing Interactions (Shift + Drag)
  allNodes.select('div')
    .on('mousedown', function(event, d) {
      if (event.shiftKey) {
        event.stopPropagation();
        isDrawing = true;
        drawSourceNode = d;
        drawingLine
          .style('display', 'block')
          .attr('x1', d.x)
          .attr('y1', d.y)
          .attr('x2', d.x)
          .attr('y2', d.y);
      }
    })
    .on('mouseup', function(event, d) {
      if (isDrawing && drawSourceNode && drawSourceNode.id !== d.id) {
        // Prevent duplicate links
        const exists = mindmapLinks.find(l => 
          (l.source.id === drawSourceNode.id && l.target.id === d.id) ||
          (l.target.id === drawSourceNode.id && l.source.id === d.id)
        );
        if (!exists) {
          mindmapLinks.push({ source: drawSourceNode.id, target: d.id });
          updateMindmap();
        }
      }
      isDrawing = false;
      drawSourceNode = null;
      drawingLine.style('display', 'none');
    });

  allNodes.select('.node-title')
    .on('mousedown', stopPropagation)
    .on('input', function(event, d) { d.title = this.value; });
    
  allNodes.select('.node-url')
    .on('mousedown', stopPropagation)
    .on('input', function(event, d) { d.url = this.value; });
    
  allNodes.select('.node-link-btn')
    .on('mousedown', stopPropagation)
    .on('click', function(event, d) { openNodeUrl(d); });

  simulation.nodes(mindmapNodes).on('tick', ticked);
  simulation.force('link').links(mindmapLinks);
  simulation.alpha(1).restart();

  function ticked() {
    // Select globally from linkGroup and nodeGroup to prevent stale closure bugs (flashing nodes)
    linkGroup.selectAll('.graph-link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    nodeGroup.selectAll('foreignObject')
      .attr('x', d => d.x - NODE_WIDTH/2)
      .attr('y', d => d.y - NODE_HEIGHT/2);
      
    // Update drawing line if active
    if (isDrawing && drawSourceNode) {
      drawingLine.attr('x1', drawSourceNode.x).attr('y1', drawSourceNode.y);
    }
  }
}

let isDraggingNode = false;

function dragstarted(event, d) {
  if (event.sourceEvent.shiftKey) return; // Prevent standard drag if holding shift
  isDraggingNode = true;
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  if (event.sourceEvent.shiftKey) return;
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  isDraggingNode = false;
  window.saveMindmapToAWS();
}

window.addNode = function() {
  const nameInput = document.getElementById('node-name');
  const typeSelect = document.getElementById('node-type');
  const phaseSelect = document.getElementById('node-phase');
  
  const title = nameInput.value.trim();
  const type = typeSelect.value;
  const phase = phaseSelect.value;
  
  if (!title) return alert('Node Title is required');
  const id = 'node_' + Math.random().toString(36).substr(2, 9);
  
  mindmapNodes.push({ id, title, phase, type, url: '' });
  nameInput.value = '';
  
  updateMindmap();
};

window.clearMindmap = function() {
  mindmapNodes = [{ id: 'Root', title: 'Root Command', phase: 'active', type: 'text', url: '', x: 0, y: 0, fx: 0, fy: 0 }];
  mindmapLinks = [];
  updateMindmap();
  simulation.alpha(1).restart();
};

// ==========================================
// CONTENT EDITABLE ENHANCEMENTS
// ==========================================
document.addEventListener('keydown', (e) => {
  if (e.target.isContentEditable && e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    // Insert line break and a smaller font span
    const html = '<br><span style="font-size: 0.6em; font-weight: normal; opacity: 0.85;">&#8203;</span>';
    document.execCommand('insertHTML', false, html);
  }
});

document.addEventListener('input', (e) => {
  if (e.target.isContentEditable) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    // Auto-format "- " or "* " to a bullet point
    if (node.nodeType === 3) {
      const offset = range.startOffset;
      const text = node.textContent;
      
      if (offset >= 2) {
        const lastTwo = text.substring(offset - 2, offset);
        if (lastTwo === '- ' || lastTwo === '* ') {
          node.textContent = text.substring(0, offset - 2) + '• ' + text.substring(offset);
          
          // Restore caret
          const newRange = document.createRange();
          newRange.setStart(node, offset - 2 + 2);
          newRange.setEnd(node, offset - 2 + 2);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
  }
});


// ==========================================
// ==========================================
// INITIALIZATION
// ==========================================
async function initApp() {
  setupHomeEditableSync();
  await loadHomeElementsAWS();
  initGsapAnimations();
  initMindmap();
  init3DTilt();
  await loadKanbanProjects();
  await switchKanbanProject(activeKanbanProjectId);
  await loadHubFiles();
  await window.loadHubChecklists();
  
  const navbarBrand = document.getElementById('navbar-brand');
  if (navbarBrand) {
    navbarBrand.addEventListener('input', (e) => {
      document.title = e.target.innerText || 'ATLAS USA';
    });
  }
}

// ==========================================
// DOCUMENT HUB (AWS STORAGE LOGIC)
// ==========================================

const PRELOADED_DOCUMENTS = [
  { id: 'doc-1', name: 'White Paper', subtitle: 'Subject matter inside contract' },
  { id: 'doc-2', name: 'Articles of Incorporation', subtitle: 'Legal Corporate Foundation' },
  { id: 'doc-3', name: 'SBE Certification', subtitle: 'Socioeconomic Status Validation' },
  { id: 'doc-4', name: 'Capabilities Statement', subtitle: 'Core Competency Summary' },
  { id: 'doc-5', name: 'Capabilities Brief', subtitle: 'Interactive Presentation Material' },
  { id: 'doc-6', name: 'Unsolicited Proposal Volume 1', subtitle: 'Technical & Management Volume' },
  { id: 'doc-7', name: 'Unsolicited Proposal Volume 2', subtitle: 'Cost & Pricing Volume' },
];

window.switchHubTab = function(tabId) {
  document.querySelectorAll('.hub-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.hub-tab-content').forEach(c => c.style.display = 'none');
  event.target.classList.add('active');
  document.getElementById(`hub-tab-${tabId}`).style.display = 'block';
};

window.handleFileUpload = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const btn = event.target.nextElementSibling;
    if (btn) btn.textContent = 'Uploading...';
    
    await uploadData({
      path: `documenthub/${file.name}`,
      data: file
    });
    
    if (btn) btn.textContent = '+ Upload File';
    await loadHubFiles();
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Upload failed: ' + error.message);
  }
};

window.downloadHubFile = async function(filePath, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  try {
    const urlResult = await getUrl({ path: filePath });
    if (urlResult && urlResult.url) {
      window.open(urlResult.url.toString(), '_blank');
    }
  } catch (error) {
    console.error('Error getting download url:', error);
    alert('Download failed: ' + error.message);
  }
};

window.deleteHubFile = async function(filePath, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (!confirm('Are you sure you want to delete this file?')) return;
  try {
    await remove({ path: filePath });
    await loadHubFiles();
  } catch (error) {
    console.error('Error deleting file:', error);
    alert('Delete failed: ' + error.message);
  }
};

window.updateDocStatus = async function(docId, status, customTitle, customSubtitle, filePath, isDeleted = undefined) {
  try {
    const { data: existing } = await client.models.HubDocumentStatus.list({ filter: { docId: { eq: docId } } });
    if (existing && existing.length > 0) {
      await client.models.HubDocumentStatus.update({ 
        id: existing[0].id, 
        docId, 
        status: status || existing[0].status,
        customTitle: customTitle || existing[0].customTitle,
        customSubtitle: customSubtitle || existing[0].customSubtitle,
        filePath: filePath || existing[0].filePath,
        isDeleted: isDeleted !== undefined ? isDeleted : existing[0].isDeleted
      });
    } else {
      await client.models.HubDocumentStatus.create({ 
        docId, 
        status: status || 'Missing', 
        customTitle, 
        customSubtitle,
        filePath,
        isDeleted: isDeleted || false
      });
    }
    if(status || isDeleted !== undefined) await loadHubFiles(); // Recalculate chart
  } catch(e) { console.error('Failed to update status', e); }
};

window.handleCardFileUpload = async function(docId, event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const btn = event.target.nextElementSibling;
    if (btn) btn.textContent = 'Uploading...';
    
    const newPath = `documenthub/${docId}_${file.name}`;
    await uploadData({
      path: newPath,
      data: file
    });
    
    // Automatically set status to Verified/Ready and save filePath
    await window.updateDocStatus(docId, 'Verified/Ready', null, null, newPath);
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Upload failed: ' + error.message);
  }
};

async function loadHubFiles() {
  const grid = document.getElementById('hub-doc-grid');
  if (!grid) return;
  
  try {
    const [storageResult, { data: statusesData }, { data: customCards }] = await Promise.all([
      list({ path: 'documenthub/' }),
      client.models.HubDocumentStatus.list(),
      client.models.AppElement.list({ filter: { type: { eq: 'hub-card' } } })
    ]);
    
    const statuses = {};
    statusesData.forEach(s => statuses[s.docId] = s.status);
    
    // Combine preloaded docs and uploaded files
    const uploadedFiles = storageResult.items || [];
    
    grid.innerHTML = '';
    let totalRendered = 0;
    let readyRendered = 0;
    
    const EMBLEMS = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue);"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ef4444;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #a855f7;"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
    ];

    const renderCard = (docId, defaultName, defaultSubtitle, status, fileMatch, isPreloaded) => {
      const docData = statusesData.find(s => s.docId === docId);
      if (docData && docData.isDeleted) return; // Hide deleted cards
      
      totalRendered++;
      if (status === 'Verified/Ready') readyRendered++;
      
      const customTitle = docData?.customTitle || defaultName;
      const customSubtitle = docData?.customSubtitle || defaultSubtitle;
      
      // Use explicit filePath if saved, otherwise use rough filename match
      const explicitPath = docData?.filePath;
      if (explicitPath && uploadedFiles.find(f => f.path === explicitPath)) {
        fileMatch = { path: explicitPath };
      }
      
      // Determine emblem deterministically by docId length/chars
      const emblemIndex = docId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % EMBLEMS.length;
      const emblem = EMBLEMS[emblemIndex];
      
      const card = document.createElement('div');
      card.className = 'doc-card tilt-element';
      
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="doc-icon">${emblem}</div>
          <button class="delete-card-btn" onclick="${docId.startsWith('custom-hub-') ? `window.deleteHubCard('${docId}')` : (isPreloaded ? `window.updateDocStatus('${docId}', null, null, null, null, true)` : `window.deleteHubFile('${fileMatch ? fileMatch.path : ''}', event)`)}" title="Delete Card">&times;</button>
        </div>
        <div class="doc-title" contenteditable="true" onblur="window.updateDocStatus('${docId}', null, this.innerText, null)">${customTitle}</div>
        <div class="doc-desc" contenteditable="true" onblur="window.updateDocStatus('${docId}', null, null, this.innerText)">${customSubtitle}</div>
        <select class="doc-status" onchange="window.updateDocStatus('${docId}', this.value)" style="border-color: ${status === 'Verified/Ready' ? '#10b981' : (status === 'Missing' ? '#ef4444' : '#f59e0b')}">
          <option value="Missing" ${status === 'Missing' ? 'selected' : ''}>Missing</option>
          <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Verified/Ready" ${status === 'Verified/Ready' ? 'selected' : ''}>Verified/Ready</option>
        </select>
        <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px;">
          ${fileMatch ? `<button class="btn-text" style="color:#A493F7; align-self: flex-start;" onclick="window.downloadHubFile('${fileMatch.path}', event)">Download File</button>` : ''}
          <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between;">
            <input type="file" id="upload-${docId}" style="display:none;" onchange="window.handleCardFileUpload('${docId}', event)">
            <button class="btn-text" style="color:#10b981;" onclick="document.getElementById('upload-${docId}').click()">+ Upload to this card</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    };
    
    // Render preloaded docs
    PRELOADED_DOCUMENTS.forEach(doc => {
      const status = statuses[doc.id] || 'Missing';
      const fileMatch = uploadedFiles.find(f => f.path.includes(doc.name));
      renderCard(doc.id, doc.name, doc.subtitle, status, fileMatch, true);
    });
    
    // Render custom dynamic slots
    if (customCards) {
      customCards.forEach(cardData => {
        let content = {};
        try { content = JSON.parse(cardData.content); } catch(e) {}
        const docId = cardData.id;
        const status = statuses[docId] || 'Missing';
        const fileMatch = uploadedFiles.find(f => f.path.includes(content.name)); // Custom docs might not match by name if they use explicit attach, which is handled in renderCard
        renderCard(docId, content.name || 'New Document Slot', content.subtitle || 'Pending description...', status, fileMatch, false);
      });
    }
    
    // Render any uploaded files that aren't preloaded OR mapped to a specific card's explicit filePath
    uploadedFiles.forEach(item => {
      if (PRELOADED_DOCUMENTS.some(d => item.path.includes(d.name))) return; // skip if rough matched
      if (statusesData.some(d => d.filePath === item.path)) return; // skip if explicitly attached to a card
      
      const fileName = item.path.replace('documenthub/', '');
      const docId = 'uploaded-' + fileName;
      const status = statuses[docId] || 'In Progress';
      
      renderCard(docId, fileName, 'User Uploaded File', status, item, false);
    });

    // Update Circle Chart
    const percentage = Math.round((readyRendered / (totalRendered || 1)) * 100);
    
    document.getElementById('hub-completion-circle').setAttribute('stroke-dasharray', `${percentage}, 100`);
    document.getElementById('hub-completion-text').textContent = `${percentage}%`;
    document.getElementById('hub-completion-desc').textContent = `${readyRendered} out of ${totalRendered} documents verified`;

  } catch (error) {
    console.error('Failed to load hub files:', error);
  }
}

window.addHubCard = async function() {
  try {
    const newDocId = 'custom-hub-' + Date.now();
    await client.models.AppElement.create({
      id: newDocId,
      type: 'hub-card',
      content: JSON.stringify({
        name: 'New Document Slot',
        subtitle: 'Pending description...'
      }),
      isChecked: false
    });
    await loadHubFiles();
  } catch (e) {
    console.error("Failed to add new hub card", e);
    alert("Failed to create document slot.");
  }
};

window.deleteHubCard = async function(id) {
  if(!confirm("Are you sure you want to delete this custom document slot?")) return;
  try {
    const { data: existing } = await client.models.AppElement.list({ filter: { id: { eq: id } } });
    if (existing && existing.length > 0) {
      await client.models.AppElement.delete({ id: existing[0].id });
    }
    await loadHubFiles();
  } catch(e) {
    console.error("Failed to delete hub card", e);
    alert("Failed to delete document slot.");
  }
};

// ==========================================
// OPERATIONS BOARD LOGIC
// ==========================================
window.addHubChecklist = async function() {
  try {
    await client.models.HubChecklist.create({
      title: 'New Operations Checklist',
      items: JSON.stringify([])
    });
    await window.loadHubChecklists();
  } catch(e) { console.error('Error adding checklist', e); }
};

window.deleteHubChecklist = async function(id) {
  if (!confirm('Delete this checklist entirely?')) return;
  try {
    await client.models.HubChecklist.delete({ id });
    await window.loadHubChecklists();
  } catch(e) { console.error('Error deleting checklist', e); }
};

window.updateHubChecklist = async function(id, title, items) {
  try {
    await client.models.HubChecklist.update({
      id, title, items: JSON.stringify(items)
    });
  } catch(e) { console.error('Error updating checklist', e); }
};

window.loadHubChecklists = async function() {
  const grid = document.getElementById('hub-checklist-grid');
  if (!grid) return;
  try {
    const { data: checklists } = await client.models.HubChecklist.list();
    grid.innerHTML = '';
    
    if (checklists.length === 0) {
      grid.innerHTML = '<div style="color: #9ca3af; font-family: \'Times New Roman\', serif;">No checklists available. Create one to get started.</div>';
      return;
    }
    
    checklists.forEach(list => {
      let items = [];
      try { items = JSON.parse(list.items); } catch(e) {}
      
      const card = document.createElement('div');
      card.className = 'checklist-card';
      
      let itemsHtml = items.map((item, i) => `
        <div class="checklist-item ${item.checked ? 'checked' : ''}">
          <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="
            const newItems = JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(items))}'));
            newItems[${i}].checked = this.checked;
            window.updateHubChecklist('${list.id}', '${list.title}', newItems).then(window.loadHubChecklists);
          ">
          <input type="text" value="${item.text}" onblur="
            const newItems = JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(items))}'));
            newItems[${i}].text = this.value;
            window.updateHubChecklist('${list.id}', '${list.title}', newItems);
          ">
          <button class="btn-text" style="color: #ef4444;" onclick="
            const newItems = JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(items))}'));
            newItems.splice(${i}, 1);
            window.updateHubChecklist('${list.id}', '${list.title}', newItems).then(window.loadHubChecklists);
          ">&times;</button>
        </div>
      `).join('');
      
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <input type="text" class="checklist-title" value="${list.title}" onblur="window.updateHubChecklist('${list.id}', this.value, JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(items))}')))">
          <button onclick="window.deleteHubChecklist('${list.id}')" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>
        <div style="margin-bottom: 15px;">${itemsHtml}</div>
        <button class="btn-text" style="color: #A493F7;" onclick="
          const newItems = JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(items))}'));
          newItems.push({ text: 'New Task', checked: false });
          window.updateHubChecklist('${list.id}', '${list.title}', newItems).then(window.loadHubChecklists);
        ">+ Add Item</button>
      `;
      
      grid.appendChild(card);
    });
    
  } catch(e) {
    console.error('Error loading checklists', e);
    grid.innerHTML = '<div style="color: #ef4444; font-family: \'Times New Roman\', serif;">Failed to load operations board.</div>';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
