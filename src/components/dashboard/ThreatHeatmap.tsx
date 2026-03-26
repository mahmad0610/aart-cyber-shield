import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ThreatHeatmapProps {
  timeline: any[];
  weaknesses: any[];
}

export function ThreatHeatmap({ timeline, weaknesses }: ThreatHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // We'll map the top weaknesses over simplified "scans" for demo heatmap layout
    const types = weaknesses.map(w => w.type);
    const scans = ['Scan 1', 'Scan 2', 'Scan 3', 'Scan 4', 'Scan 5', 'Latest'];

    // Generate mock heatmap data for the visual
    const data = [];
    for (const t of types) {
      for (const s of scans) {
        data.push({
          type: t,
          scan: s,
          intensity: Math.random() // Simulation of memory evolution
        });
      }
    }

    const margin = { top: 30, right: 30, bottom: 30, left: 100 };
    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 300 - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom)
      .style('padding', '20px');

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Axis
    const x = d3.scaleBand()
      .range([0, innerWidth])
      .domain(scans)
      .padding(0.05);

    g.append('g')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('color', '#888780')
      .attr('transform', `translate(0, -${margin.top/2})`)
      .call(d3.axisTop(x).tickSize(0))
      .select('.domain').remove();

    // Y Axis
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(types)
      .padding(0.05);

    g.append('g')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('color', '#888780')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove();

    // Build color scale
    const myColor = d3.scaleLinear<string>()
      .range(['#111113', '#D85A30'])
      .domain([0, 1]);

    const tooltip = d3.select(svgRef.current.parentElement)
      .append('div')
      .style('opacity', 0)
      .attr('class', 'absolute bg-[#1A1A1E] border border-white/10 p-2 pointer-events-none rounded font-mono text-[9px] text-[#B4B2A9]')
      .style('z-index', 10);

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.scan)!)
      .attr('y', d => y(d.type)!)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', d => myColor(d.intensity)!)
      .style('stroke-width', 1)
      .style('stroke', '#3d3d3a')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this).style('stroke', '#fff').style('opacity', 1);
        tooltip.style('opacity', 1).html(`${d.type}<br>Intensity: ${(d.intensity * 100).toFixed(0)}%`);
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.offsetX + 10) + 'px').style('top', (event.offsetY - 20) + 'px');
      })
      .on('mouseleave', function() {
        d3.select(this).style('stroke', '#3d3d3a').style('opacity', 0.8);
        tooltip.style('opacity', 0);
      });

  }, [timeline, weaknesses]);

  if (weaknesses.length === 0) return null;

  return (
    <div className="w-full relative bg-transparent overflow-hidden">
      <svg ref={svgRef} className="w-full h-[320px]" />
    </div>
  );
}
