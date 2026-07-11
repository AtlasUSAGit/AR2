// Navigation Logic
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page-container').forEach(page => {
    page.classList.remove('active');
  });
  // Show target page
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Find the button that called this and set it active
  const btn = Array.from(document.querySelectorAll('.nav-link')).find(b => b.textContent.toLowerCase().includes(pageId) || (pageId === 'hub' && b.textContent.includes('Hub')));
  if (btn) btn.classList.add('active');
}

// Kanban Drag and Drop Logic
let draggedItem = null;

function drag(event) {
  draggedItem = event.target;
  event.dataTransfer.effectAllowed = 'move';
}

document.querySelectorAll('.kanban-col').forEach(col => {
  col.addEventListener('dragover', e => {
    e.preventDefault(); // Necessary to allow dropping
  });
  
  col.addEventListener('drop', e => {
    e.preventDefault();
    if (draggedItem) {
      col.appendChild(draggedItem);
      draggedItem = null;
    }
  });
});

// Mind Map Logic (D3 Force-Directed Graph)
let mindmapNodes = [
  { id: 'Root', group: 1 }
];
let mindmapLinks = [];

let simulation, svg, linkGroup, nodeGroup, labelsGroup;

function initMindmap() {
  const container = document.getElementById('graph-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  svg = d3.select('#graph-svg')
    .attr('width', width)
    .attr('height', height);
    
  svg.selectAll('*').remove(); // Clear on init

  // Add a zoom behavior
  const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
          g.attr("transform", event.transform);
      });
  svg.call(zoom);

  const g = svg.append('g');

  linkGroup = g.append('g').attr('class', 'links');
  nodeGroup = g.append('g').attr('class', 'nodes');
  labelsGroup = g.append('g').attr('class', 'labels');

  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  updateMindmap();
}

function updateMindmap() {
  // Update links
  const link = linkGroup.selectAll('line')
    .data(mindmapLinks, d => d.source.id + '-' + d.target.id);
    
  link.exit().remove();
  
  const linkEnter = link.enter().append('line')
    .attr('stroke', 'rgba(255,255,255,0.2)')
    .attr('stroke-width', 2);
    
  // Update nodes
  const node = nodeGroup.selectAll('circle')
    .data(mindmapNodes, d => d.id);
    
  node.exit().remove();
  
  const nodeEnter = node.enter().append('circle')
    .attr('r', 20)
    .attr('fill', '#A493F7')
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
    .attr('dy', 4);

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

// UI Actions for Mind Map
function addNode() {
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
    // Default attach to Root if no parent specified and it's not the first node
    mindmapLinks.push({ source: 'Root', target: id });
  }
  
  nameInput.value = '';
  parentInput.value = '';
  
  updateMindmap();
}

function clearMindmap() {
  mindmapNodes = [{ id: 'Root', group: 1 }];
  mindmapLinks = [];
  updateMindmap();
}

// Init everything once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMindmap();
});
