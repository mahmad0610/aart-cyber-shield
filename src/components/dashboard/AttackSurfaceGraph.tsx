import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export function AttackSurfaceGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Static mock data representing the Attack Surface
    const nodes: Node[] = [
      { id: 'Repo: main-api', group: 1, radius: 24 },
      { id: 'Repo: auth-service', group: 1, radius: 20 },
      { id: 'GET /api/users', group: 2, radius: 12 },
      { id: 'POST /api/login', group: 2, radius: 12 },
      { id: 'GET /docs', group: 2, radius: 10 },
      { id: 'PUT /api/orders', group: 2, radius: 14 },
      { id: 'IDOR', group: 3, radius: 16 },
      { id: 'SQLi', group: 3, radius: 18 },
      { id: 'XSS', group: 3, radius: 14 }
    ];

    const links: Link[] = [
      { source: 'Repo: main-api', target: 'GET /api/users' },
      { source: 'Repo: main-api', target: 'PUT /api/orders' },
      { source: 'Repo: auth-service', target: 'POST /api/login' },
      { source: 'Repo: main-api', target: 'GET /docs' },
      { source: 'GET /api/users', target: 'IDOR' },
      { source: 'POST /api/login', target: 'SQLi' },
      { source: 'PUT /api/orders', target: 'IDOR' },
      { source: 'GET /docs', target: 'XSS' }
    ];

    const width = svgRef.current.clientWidth;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .style('background', 'transparent');

    svg.selectAll('*').remove(); // clear on re-render

    // Add glowing filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (d as Node).radius + 15));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#3d3d3a')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    // Color logic
    const color = d3.scaleOrdinal()
      .domain(['1', '2', '3'])
      .range(['#185FA5', '#5F5E5A', '#D85A30']); // Blue(repos), Gray(endpoints), Red(vulns)

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => color(d.group.toString()) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0)
      .attr('stroke-opacity', 0.2)
      .style('filter', 'url(#glow)')
      .call(drag(simulation) as any);

    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#B4B2A9')
      .attr('dx', 18)
      .attr('dy', 4);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: any, d: Node) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: any, d: Node) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: any, d: Node) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#111113] rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute top-4 left-4 font-mono text-[10px] text-[#888780] uppercase tracking-wider">
        Global Intelligence Network
      </div>
      <div className="absolute bottom-4 left-4 flex gap-4 font-mono text-[9px] uppercase tracking-widest">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#185FA5] rounded-full filter drop-shadow"></div><span className="text-[#888780]">Assets</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#5F5E5A] rounded-full filter drop-shadow"></div><span className="text-[#888780]">Endpoints</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#D85A30] rounded-full filter drop-shadow"></div><span className="text-[#888780]">Vulnerabilities</span></div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-pointer" />
    </div>
  );
}
