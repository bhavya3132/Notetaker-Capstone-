import { useEffect, useRef, useCallback } from 'react';
import useAppStore from '../../store/useAppStore';
import './Graph.css';

/* ========================================
   Category color map — same subjects glow the same
   ======================================== */
const CATEGORY_COLORS = {
  History: { fill: 'rgba(186, 135, 89, 0.9)', glow: 'rgba(186, 135, 89, 0.4)' },
  Maths: { fill: 'rgba(90, 140, 200, 0.9)', glow: 'rgba(90, 140, 200, 0.4)' },
  Science: { fill: 'rgba(100, 180, 120, 0.9)', glow: 'rgba(100, 180, 120, 0.4)' },
  Philosophy: { fill: 'rgba(170, 110, 170, 0.9)', glow: 'rgba(170, 110, 170, 0.4)' },
};
const DEFAULT_COLOR = { fill: 'rgba(100, 126, 77, 0.9)', glow: 'rgba(100, 126, 77, 0.4)' };

const getColor = (cat) => CATEGORY_COLORS[cat] || DEFAULT_COLOR;

const Graph = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const dragRef = useRef({ active: false, node: null, offsetX: 0, offsetY: 0 });
  const hoveredRef = useRef(null);       // ref instead of state — no re-renders
  const sizeRef = useRef({ w: 0, h: 0 }); // cached canvas size

  const notes = useAppStore((s) => s.notes);
  const connections = useAppStore((s) => s.connections);

  /* ---------- Build graph ---------- */
  const buildGraph = useCallback(() => {
    const nodes = notes.map((note, i) => {
      const angle = (2 * Math.PI * i) / notes.length;
      const radius = 140 + Math.random() * 100;
      return {
        id: note.id,
        label: note.title,
        category: note.category,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        targetX: Math.cos(angle) * radius,
        targetY: Math.sin(angle) * radius,
        radius: 14,
        pinned: false,
      };
    });

    // Build edges
    const edgeSet = new Set();
    const edges = [];

    const addEdge = (sId, tId) => {
      const key = [sId, tId].sort().join('|');
      if (!edgeSet.has(key)) {
        const source = nodes.find((n) => n.id === sId);
        const target = nodes.find((n) => n.id === tId);
        if (source && target) {
          edgeSet.add(key);
          edges.push({ source, target });
        }
      }
    };

    // Explicit connections
    connections.forEach((c) => addEdge(c.sourceId, c.targetId));

    // Auto-connect same category
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].category === nodes[j].category) {
          addEdge(nodes[i].id, nodes[j].id);
        }
      }
    }

    // Scale radius by connections
    nodes.forEach((node) => {
      const count = edges.filter(
        (e) => e.source.id === node.id || e.target.id === node.id
      ).length;
      node.radius = 12 + count * 4;
    });

    return { nodes, edges };
  }, [notes, connections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    /* ---------- Resize (cached) ---------- */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    /* ---------- Init graph ---------- */
    const { nodes, edges } = buildGraph();
    const { w, h } = sizeRef.current;

    nodes.forEach((node) => {
      node.x = w / 2 + node.targetX;
      node.y = h / 2 + node.targetY;
    });
    nodesRef.current = nodes;
    edgesRef.current = edges;

    /* ---------- Hit-test ---------- */
    const getNodeAt = (mx, my) => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy <= (n.radius + 6) * (n.radius + 6)) return n;
      }
      return null;
    };

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    /* ---------- Mouse handlers ---------- */
    const onMouseDown = (e) => {
      const { x, y } = getMousePos(e);
      const node = getNodeAt(x, y);
      if (node) {
        dragRef.current = { active: true, node, offsetX: x - node.x, offsetY: y - node.y };
        node.pinned = true;
        canvas.style.cursor = 'grabbing';
      }
    };

    const onMouseMove = (e) => {
      const { x, y } = getMousePos(e);
      if (dragRef.current.active && dragRef.current.node) {
        const n = dragRef.current.node;
        n.x = x - dragRef.current.offsetX;
        n.y = y - dragRef.current.offsetY;
        n.vx = 0;
        n.vy = 0;
      } else {
        const node = getNodeAt(x, y);
        hoveredRef.current = node ? node.id : null;
        canvas.style.cursor = node ? 'grab' : 'default';
      }
    };

    const onMouseUp = () => {
      if (dragRef.current.node) {
        dragRef.current.node.pinned = false;
        // Gently re-heat so neighbors adjust
        coolingFactor = 0.3;
      }
      dragRef.current = { active: false, node: null, offsetX: 0, offsetY: 0 };
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    /* ---------- Physics ---------- */
    let coolingFactor = 1.0; // starts hot, cools down over time

    const simulate = () => {
      const { w: cw, h: ch } = sizeRef.current;
      const cx = cw / 2;
      const cy = ch / 2;

      // Cool down over time — simulation settles
      coolingFactor *= 0.998;
      if (coolingFactor < 0.01) coolingFactor = 0.01;

      // Repulsion (gentle — just enough to not overlap)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          // Only repel when close (< 200px apart)
          if (dist < 200) {
            const force = (800 / distSq) * coolingFactor;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (!nodes[i].pinned) { nodes[i].vx -= fx; nodes[i].vy -= fy; }
            if (!nodes[j].pinned) { nodes[j].vx += fx; nodes[j].vy += fy; }
          }
        }
      }

      // Edge attraction
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 140) * 0.004 * coolingFactor;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!edge.source.pinned) { edge.source.vx += fx; edge.source.vy += fy; }
        if (!edge.target.pinned) { edge.target.vx -= fx; edge.target.vy -= fy; }
      }

      // Center gravity + velocity + heavy damping
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.pinned) continue;
        node.vx += (cx - node.x) * 0.001 * coolingFactor;
        node.vy += (cy - node.y) * 0.001 * coolingFactor;
        // Heavy damping — nodes stop quickly
        node.vx *= 0.7;
        node.vy *= 0.7;
        // Dead-zone: if moving very slowly, just stop
        if (Math.abs(node.vx) < 0.05) node.vx = 0;
        if (Math.abs(node.vy) < 0.05) node.vy = 0;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(50, Math.min(cw - 50, node.x));
        node.y = Math.max(50, Math.min(ch - 50, node.y));
      }
    };

    /* ---------- Draw ---------- */
    const draw = () => {
      const { w: cw, h: ch } = sizeRef.current;
      const hovered = hoveredRef.current;

      ctx.clearRect(0, 0, cw, ch);

      // ---- Edges ----
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const sameCategory = edge.source.category === edge.target.category;
        const color = sameCategory ? getColor(edge.source.category) : DEFAULT_COLOR;

        const midX = (edge.source.x + edge.target.x) / 2;
        const midY = (edge.source.y + edge.target.y) / 2;
        // Stable curve offset (no random per-frame)
        const ang = Math.atan2(edge.target.y - edge.source.y, edge.target.x - edge.source.x);
        const cpX = midX + Math.cos(ang + Math.PI / 2) * 12;
        const cpY = midY + Math.sin(ang + Math.PI / 2) * 12;

        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.quadraticCurveTo(cpX, cpY, edge.target.x, edge.target.y);
        ctx.strokeStyle = sameCategory
          ? color.fill.replace('0.9', '0.45')
          : 'rgba(245, 235, 210, 0.25)';
        ctx.lineWidth = sameCategory ? 2.5 : 1.5;
        ctx.stroke();
      }

      // ---- Nodes ----
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const color = getColor(node.category);
        const isHovered = hovered === node.id;
        const scale = isHovered ? 1.25 : 1;
        const r = node.radius * scale;

        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.5);
        gradient.addColorStop(0, color.glow);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color.fill;
        ctx.fill();
        ctx.strokeStyle = isHovered ? 'rgba(245,235,210,0.9)' : 'rgba(245,235,210,0.4)';
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Highlight
        ctx.beginPath();
        ctx.arc(node.x - r * 0.2, node.y - r * 0.2, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fill();

        // Label pill
        const labelY = node.y + r + 20;
        ctx.font = '12px "Roboto Serif", serif';
        const tw = ctx.measureText(node.label).width;
        const lw = tw + 14;

        ctx.fillStyle = 'rgba(43, 76, 54, 0.88)';
        ctx.beginPath();
        ctx.roundRect(node.x - lw / 2, labelY - 14, lw, 20, 6);
        ctx.fill();

        ctx.fillStyle = 'rgba(245, 235, 210, 1)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, labelY);

        // Category sub-label
        ctx.font = '10px "Roboto Serif", serif';
        ctx.fillStyle = color.fill.replace('0.9', '0.7');
        ctx.fillText(node.category, node.x, labelY + 14);
      }
    };

    /* ---------- Loop ---------- */
    const loop = () => {
      simulate();
      draw();
      animationRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [buildGraph]); // NO hoveredNode dependency — zero re-renders on mouse move

  return (
    <div className="graph-wrapper">
      <canvas ref={canvasRef} className="graph-canvas" id="graph-canvas" />

      {/* Legend */}
      <div className="graph-legend">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="legend-item">
            <span className="legend-dot" style={{ background: color.fill }} />
            <span className="legend-label">{cat}</span>
          </div>
        ))}
      </div>

      {/* Bottom branding bar */}
      <div className="graph-bottom-bar">
        <div className="bottom-bar-logo">
          <svg className="sprout-icon" viewBox="0 0 60 80" width="40" height="54">
            <line x1="30" y1="80" x2="30" y2="35" stroke="#4a7c59" strokeWidth="3" strokeLinecap="round"/>
            <path d="M30 50 C18 38, 12 24, 30 34" fill="#6a9f5b" stroke="#4a7c59" strokeWidth="1.2"/>
            <path d="M30 42 C42 30, 48 16, 30 26" fill="#6a9f5b" stroke="#4a7c59" strokeWidth="1.2"/>
          </svg>
        </div>
        <div className="bottom-bar-strip" />
      </div>

      {/* Hint */}
      <div className="graph-hint">
        Drag nodes to reposition • Same subjects are auto-connected
      </div>
    </div>
  );
};

export default Graph;
