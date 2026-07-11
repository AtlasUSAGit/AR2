import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import outputs from './amplify_outputs.json';

// Configure AWS Amplify
Amplify.configure(outputs);
const client = generateClient();

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

async function loadHomePageContent() {
  try {
    const { data: appElement } = await client.models.AppElement.get({ id: HOMEPAGE_ID });
    if (appElement && appElement.content) {
      document.getElementById('page-home').innerHTML = appElement.content;
      initGsapAnimations(); 
    }
  } catch (error) {
    console.warn("Failed to load home page content from AWS, using defaults.", error);
  }
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
    
    document.querySelectorAll('#page-home .editable').forEach(el => el.setAttribute('contenteditable', 'true'));
  } else {
    // Disable editing & SAVE to AWS
    editBtn.textContent = 'Saving...';
    editBtn.style.opacity = '0.5';
    if(addBtn) addBtn.style.display = 'none';
    if(toolbar) toolbar.classList.remove('show');
    
    document.querySelectorAll('#page-home .editable').forEach(el => el.setAttribute('contenteditable', 'false'));
    
    // Clean up GSAP injected inline styles before saving
    const clone = document.getElementById('page-home').cloneNode(true);
    clone.querySelectorAll('.gsap-random').forEach(el => el.removeAttribute('style'));

    try {
      const contentToSave = clone.innerHTML;
      const { data: existing } = await client.models.AppElement.get({ id: HOMEPAGE_ID });
      
      if (existing) {
        await client.models.AppElement.update({
          id: HOMEPAGE_ID,
          content: contentToSave
        });
      } else {
        await client.models.AppElement.create({
          id: HOMEPAGE_ID,
          type: 'HomePageContent',
          content: contentToSave,
          position: 1
        });
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

  // Playbook Layered Scroll Animation
  const contentWrap = document.querySelector('.content-wrap section');
  if (contentWrap) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: contentWrap,
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
      }
    });

    // Animate layers to converge inward
    tl.fromTo('.layer-1', { scale: 3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 }, 0)
      .fromTo('.layer-2', { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 }, 0)
      .fromTo('.layer-3', { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 }, 0)
      .fromTo('.scaler', { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 }, 0);
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

window.drop = function(event) {
  event.preventDefault();
  const column = event.target.closest('.kanban-col');
  
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
  
  if (column && draggedItem) {
    draggedItem.style.opacity = '1';
    
    // Find the add-card-wrap and insert before it
    const addWrap = column.querySelector('.add-card-wrap');
    if (addWrap) {
      column.insertBefore(draggedItem, addWrap);
    } else {
      column.appendChild(draggedItem);
    }
    
    updateKanbanCounts();
    draggedItem = null;
  }
};

window.addKanbanCard = function(colId, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  const newCard = document.createElement('div');
  newCard.className = 'kanban-card tilt-element';
  newCard.id = 'task' + (cardCounter++);
  newCard.draggable = true;
  newCard.ondragstart = window.drag;
  
  newCard.innerHTML = `
    <div class="kanban-card-title">${text}</div>
    <div class="kanban-card-meta"><span>Priority: Normal</span><span>ATLAS-${cardCounter.toString().padStart(2, '0')}</span></div>
  `;
  
  const col = document.getElementById(colId);
  const addWrap = col.querySelector('.add-card-wrap');
  col.insertBefore(newCard, addWrap);
  
  input.value = '';
  updateKanbanCounts();
  init3DTilt(); // Initialize tilt on new card
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
    const res = await fetch('./mindmap.json');
    if (res.ok) {
      const data = await res.json();
      if (data.nodes) {
        mindmapNodes = data.nodes.map(n => ({
          id: String(n.id),
          title: n.text ? n.text.replace(/\*\*/g, '') : 'Node',
          phase: 'active',
          type: 'text',
          url: '',
          x: n.x || 0,
          y: n.y || 0
        }));
      }
      if (data.edges) {
        mindmapLinks = data.edges.map(e => ({
          source: String(e.fromNode),
          target: String(e.toNode)
        }));
      }
    } else {
      mindmapNodes = [{ id: 'Root', title: 'Root Command', phase: 'active', type: 'text', url: '', x: 0, y: 0 }];
    }
  } catch(e) {
    console.error("Could not load mindmap.json", e);
    if(mindmapNodes.length === 0) mindmapNodes = [{ id: 'Root', title: 'Root Command', phase: 'active', type: 'text', url: '', x: 0, y: 0 }];
  }
}

async function initMindmap() {
  const container = document.getElementById('graph-container');
  if(!container) return;

  await loadCanvasData();

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
          <input type="text" class="node-title" value="${d.title}" placeholder="Title" />
          <div class="node-url-wrap">
            <input type="text" class="node-url" value="${d.url || ''}" placeholder="URL" />
            <button class="node-link-btn">Go</button>
          </div>
        `;
      } else {
        return `
          <input type="text" class="node-title" value="${d.title}" placeholder="Title" style="margin-bottom: auto;" />
          <div style="font-size: 0.65rem; color:#9ca3af; text-align:center;">[${d.id}]</div>
        `;
      }
    });

  const allNodes = nodeEnter.merge(node);
  
  allNodes.select('div').attr('class', d => `mindmap-node-card ${d.phase || ''}`);
  
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

function dragstarted(event, d) {
  if (event.sourceEvent.shiftKey) return; // Prevent standard drag if holding shift
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
  d.fx = null;
  d.fy = null;
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
  mindmapNodes = [{ id: 'Root', title: 'Root Command', phase: 'active', type: 'text', url: '' }];
  mindmapLinks = [];
  updateMindmap();
};


// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  initGsapAnimations();
  await loadHomePageContent();
  initMindmap();
  init3DTilt();
  updateKanbanCounts();
});
