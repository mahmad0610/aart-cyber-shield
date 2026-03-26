import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from "@monaco-editor/react";
import * as d3 from 'd3';
import { ChevronLeft, Share2, Code2, TreePine, Zap, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const mockCode = `function validateSession(id) {
  const session = db.query("SELECT * FROM sessions WHERE id = " + id);
  if (!session) {
    throw new Error("Invalid session");
  }
  return session.user;
}`;

const mockAST = {
  name: "Program",
  type: "root",
  children: [
    {
      name: "FunctionDeclaration",
      type: "func",
      children: [
        { name: "Identifier: validateSession", type: "id" },
        { 
          name: "BlockStatement", 
          type: "block",
          children: [
            { 
              name: "VariableDeclaration", 
              type: "var",
              isTainted: true,
              children: [
                { name: "Identifier: session", type: "id" },
                { 
                  name: "CallExpression: db.query", 
                  type: "call",
                  isTainted: true,
                  children: [
                    { name: "BinaryExpression (+)", type: "expr", isTainted: true }
                  ]
                }
              ]
            },
            { name: "IfStatement", type: "if" },
            { name: "ReturnStatement", type: "ret" }
          ]
        }
      ]
    }
  ]
};

export default function ASTVisualizer() {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;
    const margin = { top: 40, right: 90, bottom: 50, left: 90 };

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .html("") // clear
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeData = d3.hierarchy(mockAST);
    const treeLayout = d3.tree().size([height - 200, width - 300]);
    const nodes = treeLayout(treeData);

    // Links
    svg.selectAll(".link")
      .data(nodes.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      )
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.target.data.isTainted ? "#D85A30" : "#3d3d3a")
      .attr("stroke-width", (d: any) => d.target.data.isTainted ? 2 : 1)
      .attr("stroke-opacity", 0.6);

    // Nodes
    const node = svg.selectAll(".node")
      .data(nodes.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .on("click", (e, d) => setSelectedNode(d.data));

    node.append("circle")
      .attr("r", 5)
      .attr("fill", (d: any) => d.data.isTainted ? "#D85A30" : "#1D9E75")
      .attr("stroke", "#0D0D0F")
      .attr("stroke-width", 2)
      .style("filter", (d: any) => d.data.isTainted ? "drop-shadow(0 0 8px #D85A30)" : "none");

    node.append("text")
      .attr("dy", "-10")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.name)
      .attr("font-family", "monospace")
      .attr("font-size", "10px")
      .attr("fill", "#888780");

  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0D0D0F] text-[#B4B2A9]">
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-[#888780] hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#1D9E75]" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">AST Semantic Analyzer</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1E] border border-[#D85A30]/30 rounded-full">
            <Zap className="w-3 h-3 text-[#D85A30]" />
            <span className="text-[10px] text-[#D85A30] font-bold uppercase tracking-tighter">1 Taint Path Detected</span>
          </div>
          <Button variant="outline" size="sm" className="h-8 border-white/10 bg-transparent text-[10px] uppercase font-bold tracking-widest">
            <Share2 className="w-3.5 h-3.5 mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/2 border-r border-white/5 flex flex-col bg-[#111113]">
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#5F5E5A]">
            <span>Source: auth_service.js</span>
            <span className="text-[#1D9E75]">Javascript / Node.js</span>
          </div>
          <div className="flex-1 pt-4">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={mockCode}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'monospace',
                readOnly: true,
                padding: { top: 20 },
                lineNumbers: 'on',
                glyphMargin: true,
              }}
            />
          </div>
        </div>

        {/* Right: AST Tree */}
        <div className="w-1/2 flex flex-col relative overflow-hidden">
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#5F5E5A]">
            <span>Abstract Syntax Tree</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full" /><span>Neutral</span></div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#D85A30] rounded-full shadow-[0_0_5px_#D85A30]" /><span>Tainted</span></div>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 bg-[#0D0D0F]">
             <svg ref={svgRef} className="max-w-full max-h-full" />
          </div>

          {/* Node Detail Drawer */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-[#16161A]/95 backdrop-blur-xl border-l border-white/10 p-6 shadow-2xl z-20"
              >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">Node Inspector</h3>
                   <button onClick={() => setSelectedNode(null)} className="text-[#5F5E5A] hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-1">
                      <span className="text-[9px] uppercase text-[#5F5E5A]">Type</span>
                      <div className="font-mono text-sm text-[#9FE1CB] font-bold">{selectedNode.name}</div>
                   </div>
                   
                   <div className="space-y-1">
                      <span className="text-[9px] uppercase text-[#5F5E5A]">Semantic Value</span>
                      <div className="font-mono text-[11px] text-[#B4B2A9] p-3 bg-black/40 rounded border border-white/5">
                         {selectedNode.type === 'var' ? 'Declares immutable reference "session" in local scope.' : 'AST terminal node.'}
                      </div>
                   </div>

                   {selectedNode.isTainted && (
                     <div className="p-4 bg-[#4A1B0C]/30 border border-[#D85A30]/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                           <Zap className="w-3 h-3 text-[#D85A30]" />
                           <span className="text-[10px] text-[#D85A30] font-bold uppercase">Taint detected</span>
                        </div>
                        <p className="text-[10px] text-[#888780] leading-relaxed">
                           External input <code>req.params.id</code> flows into this node via concatenation without sanitization.
                        </p>
                     </div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
