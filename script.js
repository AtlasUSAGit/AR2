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
// AWS AMPLIFY - EDIT MODE & CLOUD SYNC
// ==========================================
let isEditMode = false;
const HOMEPAGE_ID = 'home-page-content-v1'; // Unique identifier for our AppElement

async function loadHomePageContent() {
  try {
    const { data: appElement } = await client.models.AppElement.get({ id: HOMEPAGE_ID });
    if (appElement && appElement.content) {
      // Overwrite the #page-home content with what was saved
      document.getElementById('page-home').innerHTML = appElement.content;
      initGsapAnimations(); // Re-init animations on newly loaded HTML
    }
  } catch (error) {
    console.warn("Failed to load home page content from AWS, using defaults.", error);
  }
}

window.toggleEditMode = async function() {
  isEditMode = !isEditMode;
  const editBtn = document.getElementById('btn-edit');
  const addBtn = document.getElementById('btn-add-section');
  
  if (isEditMode) {
    // Enable editing
    editBtn.textContent = 'Save Home Page';
    editBtn.style.background = 'var(--accent)';
    editBtn.style.color = '#000';
    if(addBtn) addBtn.style.display = 'block';
    
    document.querySelectorAll('#page-home .editable').forEach(el => el.setAttribute('contenteditable', 'true'));
  } else {
    // Disable editing & SAVE to AWS
    editBtn.textContent = 'Saving...';
    editBtn.style.opacity = '0.5';
    if(addBtn) addBtn.style.display = 'none';
    
    document.querySelectorAll('#page-home .editable').forEach(el => el.setAttribute('contenteditable', 'false'));
    
    // Clean up GSAP injected inline styles before saving
    // GSAP adds transform and opacity, we don't want to save those inline.
    const clone = document.getElementById('page-home').cloneNode(true);
    clone.querySelectorAll('.gsap-fade-up').forEach(el => el.removeAttribute('style'));

    try {
      const contentToSave = clone.innerHTML;
      
      // Attempt to get existing record
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
      
      // Success Notification
      const status = document.getElementById('save-status');
      status.style.display = 'inline';
      setTimeout(() => status.style.display = 'none', 3000);
      
    } catch (err) {
      console.error("Error saving to AWS Amplify:", err);
      alert("Failed to save. Check console for details.");
    } finally {
      editBtn.textContent = 'Edit Home Page';
      editBtn.style.background = 'transparent';
      editBtn.style.color = '#fff';
      editBtn.style.opacity = '1';
    }
  }
};

window.addHomeSection = function() {
  const container = document.getElementById('page-home');
  const newSection = document.createElement('section');
  newSection.className = 'scroll-section gsap-fade-up';
  
  newSection.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; text-align: center;">
      <h2 class="editable" contenteditable="true" style="font-size: 2rem; margin-bottom: 20px; color: var(--accent);">New Section Title</h2>
      <p class="editable" contenteditable="true" style="font-size: 1.1rem; color: #9ca3af; line-height: 1.6;">
        Edit this content. It will animate into view when users scroll down!
      </p>
    </div>
  `;
  container.appendChild(newSection);
  initGsapAnimations();
};

// ==========================================
// GSAP SCROLL ANIMATIONS
// ==========================================
function initGsapAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);
  
  // Clear any old ScrollTriggers
  ScrollTrigger.getAll().forEach(t => t.kill());

  const elements = document.querySelectorAll('.gsap-fade-up');
  elements.forEach((el, i) => {
    gsap.fromTo(el, 
      { opacity: 0, y: 50 }, 
      {
        opacity: 1, 
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // When the top of the element hits 85% of viewport
          // Play on enter, reverse on leave back, etc.
          toggleActions: "play reverse play reverse"
        }
      }
    );
  });
}

// ==========================================
// KANBAN LOGIC
// ==========================================
let draggedItem = null;
let cardCounter = 5;

window.drag = function(event) {
  draggedItem = event.target;
  event.dataTransfer.effectAllowed = 'move';
};

window.allowDrop = function(event) {
  event.preventDefault(); // Necessary to allow dropping
};

window.drop = function(event) {
  event.preventDefault();
  // Ensure we append to the column, not onto another card
  const column = event.target.closest('.kanban-col');
  if (column && draggedItem) {
    column.appendChild(draggedItem);
    draggedItem = null;
  }
};

window.addKanbanCard = function() {
  const input = document.getElementById('kanban-new-task');
  const text = input.value.trim();
  if (!text) return;
  
  const newCard = document.createElement('div');
  newCard.className = 'kanban-card';
  newCard.id = 'task' + (cardCounter++);
  newCard.draggable = true;
  newCard.ondragstart = window.drag;
  newCard.textContent = text;
  
  document.getElementById('col-todo').appendChild(newCard);
  input.value = '';
};


// ==========================================
// MIND MAP LOGIC (D3 Force-Directed Graph)
// ==========================================
let mindmapNodes = [
  { id: 'Root', title: 'Root Command', phase: 'active', url: '' }
];
let mindmapLinks = [];

let simulation, svg, linkGroup, nodeGroup;

const NODE_WIDTH = 140;
const NODE_HEIGHT = 90;

function initMindmap() {
  const container = document.getElementById('graph-container');
  if(!container) return;

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  svg = d3.select('#graph-svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [0, 0, width, height]);
    
  svg.selectAll('*').remove();

  const g = svg.append('g');

  const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
          g.attr("transform", event.transform);
      });
  svg.call(zoom);

  linkGroup = g.append('g').attr('class', 'links');
  nodeGroup = g.append('g').attr('class', 'nodes');

  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(220))
    .force('charge', d3.forceManyBody().strength(-800))
    .force('center', d3.forceCenter(width / 2, height / 2));

  updateMindmap();
}

// Ensure elements stop drag events from passing to zoom/drag behaviors
function stopPropagation(event) {
  event.stopPropagation();
}

function updateNodeData(event, d, field) {
  d[field] = event.target.value;
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
  // Safe mapping for links
  const link = linkGroup.selectAll('line')
    .data(mindmapLinks, d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source;
      const t = typeof d.target === 'object' ? d.target.id : d.target;
      return s + '-' + t;
    });
    
  link.exit().remove();
  
  const linkEnter = link.enter().append('line')
    .attr('class', 'graph-link')
    .attr('stroke', 'rgba(57,255,20,0.4)')
    .attr('stroke-width', 3);
    
  // Update nodes with foreignObject HTML cards
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

  // Build HTML inside foreign object
  nodeEnter.append('xhtml:div')
    .attr('class', d => `mindmap-node-card ${d.phase || ''}`)
    .html(d => `
      <input type="text" class="node-title" value="${d.title}" placeholder="Title" />
      <input type="text" class="node-title" style="font-size: 0.6rem; margin-top:4px;" value="${d.url || ''}" placeholder="Hyperlink" />
      <button class="node-link-btn">Go</button>
    `);

  // Handle Input interactions & data binding
  const allNodes = nodeEnter.merge(node);
  
  allNodes.select('div').attr('class', d => `mindmap-node-card ${d.phase || ''}`);
  
  // Bind title changes
  allNodes.select('input:nth-child(1)')
    .on('mousedown', stopPropagation)
    .on('input', function(event, d) { d.title = this.value; });
    
  // Bind url changes
  allNodes.select('input:nth-child(2)')
    .on('mousedown', stopPropagation)
    .on('input', function(event, d) { d.url = this.value; });
    
  // Bind button clicks
  allNodes.select('.node-link-btn')
    .on('mousedown', stopPropagation)
    .on('click', function(event, d) { openNodeUrl(d); });

  simulation.nodes(mindmapNodes).on('tick', ticked);
  simulation.force('link').links(mindmapLinks);
  simulation.alpha(1).restart();

  function ticked() {
    linkEnter.merge(link)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    allNodes
      .attr('x', d => d.x - NODE_WIDTH/2)
      .attr('y', d => d.y - NODE_HEIGHT/2);
  }
}

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
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
  const parentInput = document.getElementById('node-parent');
  
  const title = nameInput.value.trim();
  const parentId = parentInput.value.trim();
  
  if (!title) return alert('Node Name is required');
  const id = 'node_' + Math.random().toString(36).substr(2, 9);
  
  // Randomly assign a phase style
  const phases = ['active', 'planning', 'submitted'];
  const phase = phases[Math.floor(Math.random() * phases.length)];
  
  mindmapNodes.push({ id, title, phase, url: '' });
  
  if (parentId && mindmapNodes.find(n => n.title === parentId || n.id === parentId)) {
    // try to find by title first (easier for users), fallback to ID
    const parent = mindmapNodes.find(n => n.title === parentId || n.id === parentId);
    mindmapLinks.push({ source: parent.id, target: id });
  } else if (!parentId && mindmapNodes.length > 1) {
    // Default attach to Root
    mindmapLinks.push({ source: 'Root', target: id });
  }
  
  nameInput.value = '';
  parentInput.value = '';
  
  updateMindmap();
};

window.clearMindmap = function() {
  mindmapNodes = [{ id: 'Root', title: 'Root Command', phase: 'active', url: '' }];
  mindmapLinks = [];
  updateMindmap();
};


// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Load GSAP animations for hardcoded sections first
  initGsapAnimations();
  
  // Try to overwrite with saved cloud content
  await loadHomePageContent();

  // Initialize the D3 mind map
  initMindmap();
});
