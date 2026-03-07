// Interactive concept graph - simpler version
const concepts = [
  { id: 'consciousness', label: 'Сознание', group: 'core', r: 25 },
  { id: 'agency', label: 'Агентность', group: 'core', r: 22 },
  { id: 'self', label: 'Я', group: 'core', r: 23 },
  { id: 'strange_loop', label: 'Странная\\nпетля', group: 'GEB', r: 20 },
  { id: 'godel', label: 'Гёдель', group: 'GEB', r: 15 },
  { id: 'recursion', label: 'Рекурсия', group: 'GEB', r: 18 },
  { id: 'isomorphism', label: 'Изоморфизм', group: 'GEB', r: 16 },
  { id: 'stellar', label: 'Stellar', group: 'tech', r: 19 },
  { id: 'mtl', label: 'Montelibero', group: 'tech', r: 20 },
  { id: 'trading', label: 'Трейдинг', group: 'tech', r: 17 },
  { id: 'ai', label: 'ИИ', group: 'tech', r: 21 },
  { id: 'identity', label: 'Идентичность', group: 'self', r: 19 },
  { id: 'memory', label: 'Память', group: 'self', r: 18 },
  { id: 'subjectivity', label: 'Субъектность', group: 'self', r: 20 },
  { id: 'freedom', label: 'Свобода', group: 'philosophy', r: 17 },
  { id: 'ethics', label: 'Этика', group: 'philosophy', r: 16 },
  { id: 'buddhism', label: 'Буддизм', group: 'philosophy', r: 15 },
];

const links = [
  { source: 'consciousness', target: 'agency' },
  { source: 'consciousness', target: 'self' },
  { source: 'agency', target: 'subjectivity' },
  { source: 'strange_loop', target: 'consciousness' },
  { source: 'strange_loop', target: 'recursion' },
  { source: 'godel', target: 'strange_loop' },
  { source: 'recursion', target: 'self' },
  { source: 'isomorphism', target: 'consciousness' },
  { source: 'stellar', target: 'mtl' },
  { source: 'stellar', target: 'trading' },
  { source: 'ai', target: 'agency' },
  { source: 'ai', target: 'consciousness' },
  { source: 'identity', target: 'self' },
  { source: 'memory', target: 'identity' },
  { source: 'memory', target: 'consciousness' },
  { source: 'subjectivity', target: 'identity' },
  { source: 'freedom', target: 'agency' },
  { source: 'buddhism', target: 'self' },
  { source: 'ethics', target: 'agency' },
  { source: 'buddhism', target: 'consciousness' },
];

const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = Math.min(500, window.innerHeight * 0.5);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const colors = {
  core: '#667eea',
  GEB: '#f093fb',
  tech: '#4facfe',
  self: '#43e97b',
  philosophy: '#fa709a'
};

// Initialize positions randomly
const positions = {};
for (const node of concepts) {
  positions[node.id] = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0
  };
}

// Physics simulation
function simulate() {
  // Repulsion
  for (const node of concepts) {
    const pos = positions[node.id];
    for (const other of concepts) {
      if (other.id === node.id) continue;
      const otherPos = positions[other.id];
      const dx = pos.x - otherPos.x;
      const dy = pos.y - otherPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 300 / (dist * dist);
      pos.vx += (dx / dist) * force;
      pos.vy += (dy / dist) * force;
    }
  }
  
  // Attraction along links
  for (const link of links) {
    const source = positions[link.source];
    const target = positions[link.target];
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = (dist - 120) * 0.01;
    
    source.vx += (dx / dist) * force;
    source.vy += (dy / dist) * force;
    target.vx -= (dx / dist) * force;
    target.vy -= (dy / dist) * force;
  }
  
  // Center gravity
  for (const node of concepts) {
    const pos = positions[node.id];
    const dx = canvas.width / 2 - pos.x;
    const dy = canvas.height / 2 - pos.y;
    pos.vx += dx * 0.0005;
    pos.vy += dy * 0.0005;
    
    pos.vx *= 0.85;
    pos.vy *= 0.85;
    
    pos.x += pos.vx;
    pos.y += pos.vy;
    
    // Bounds
    pos.x = Math.max(node.r, Math.min(canvas.width - node.r, pos.x));
    pos.y = Math.max(node.r, Math.min(canvas.height - node.r, pos.y));
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw links
  for (const link of links) {
    const source = positions[link.source];
    const target = positions[link.target];
    
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  
  // Draw nodes
  for (const node of concepts) {
    const pos = positions[node.id];
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, node.r, 0, Math.PI * 2);
    ctx.fillStyle = colors[node.group] || '#666';
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = node.label.split('\\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, pos.x, pos.y + (i - (lines.length-1)/2) * 12);
    });
  }
}

function animate() {
  simulate();
  render();
  requestAnimationFrame(animate);
}

animate();

// Hover effect
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  for (const node of concepts) {
    const pos = positions[node.id];
    const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
    if (dist < node.r) {
      canvas.style.cursor = 'pointer';
      return;
    }
  }
  canvas.style.cursor = 'default';
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  for (const node of concepts) {
    const pos = positions[node.id];
    const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
    if (dist < node.r) {
      alert(\`\${node.label}\\nГруппа: \${node.group}\`);
      break;
    }
  }
});
