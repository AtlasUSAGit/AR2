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
  const editables = document.querySelectorAll('#page-home .editable');

  if (isEditMode) {
    // Enable editing
    editBtn.textContent = 'Save Home Page';
    editBtn.style.background = 'var(--accent)';
    editBtn.style.color = '#000';
    editables.forEach(el => el.setAttribute('contenteditable', 'true'));
  } else {
    // Disable editing & SAVE to AWS
    editBtn.textContent = 'Saving...';
    editBtn.style.opacity = '0.5';
    editables.forEach(el => el.setAttribute('contenteditable', 'false'));
    
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
          toggleActions: "play none none reverse"
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
  { id: 'Root', group: 1 }
];
let mindmapLinks = [];

let simulation, svg, linkGroup, nodeGroup, labelsGroup;

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
  labelsGroup = g.append('g').attr('class', 'labels');

  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2));

  updateMindmap();
}

function updateMindmap() {
  // Safe mapping for links (D3 mutates the objects on ticks, so we ensure string keys)
  const link = linkGroup.selectAll('line')
    .data(mindmapLinks, d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source;
      const t = typeof d.target === 'object' ? d.target.id : d.target;
      return s + '-' + t;
    });
    
  link.exit().remove();
  
  const linkEnter = link.enter().append('line')
    .attr('stroke', 'rgba(255,255,255,0.3)')
    .attr('stroke-width', 2);
    
  // Update nodes
  const node = nodeGroup.selectAll('circle')
    .data(mindmapNodes, d => d.id);
    
  node.exit().remove();
  
  const nodeEnter = node.enter().append('circle')
    .attr('r', 20)
    .attr('fill', d => d.group === 1 ? '#ef4444' : '#A493F7')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));
      
  // Update labels
  const label = labelsGroup.selectAll('text')
    .data(mindmapNodes, d => d.id);
    
  label.exit().remove();
  
  const labelEnter = label.enter().append('text')
    .text(d => d.id)
    .attr('font-size', 12)
    .attr('fill', '#fff')
    .attr('dx', 25)
    .attr('dy', 4)
    .style('pointer-events', 'none');

  simulation.nodes(mindmapNodes).on('tick', ticked);
  simulation.force('link').links(mindmapLinks);
  simulation.alpha(1).restart();

  function ticked() {
    linkEnter.merge(link)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    nodeEnter.merge(node)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
      
    labelEnter.merge(label)
      .attr('x', d => d.x)
      .attr('y', d => d.y);
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
  
  const id = nameInput.value.trim();
  const parentId = parentInput.value.trim();
  
  if (!id) return alert('Node Name is required');
  if (mindmapNodes.find(n => n.id === id)) return alert('Node already exists');
  
  mindmapNodes.push({ id, group: 2 });
  
  if (parentId && mindmapNodes.find(n => n.id === parentId)) {
    mindmapLinks.push({ source: parentId, target: id });
  } else if (!parentId && mindmapNodes.length > 1) {
    // Default attach to Root
    mindmapLinks.push({ source: 'Root', target: id });
  }
  
  nameInput.value = '';
  parentInput.value = '';
  
  updateMindmap();
};

window.clearMindmap = function() {
  mindmapNodes = [{ id: 'Root', group: 1 }];
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
