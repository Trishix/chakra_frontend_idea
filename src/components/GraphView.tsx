import { memo, useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls, Handle, Position, applyNodeChanges, MarkerType } from '@xyflow/react';
import type { Node, Edge, NodeChange, NodeProps } from '@xyflow/react';
import { KindIcon } from './ui';
import type { Entity, Relation, Lead } from '../domain/types';
type EntityNode=Node<{entity:Entity;active:boolean;dim:boolean;bridge:boolean}>;
const EntityCard=memo(function EntityCard({data,selected}:NodeProps<EntityNode>){const kind=data.entity.kind.toLowerCase();return <div className={`entity-node node-kind-${kind} ${data.active?'entity-active':''} ${data.bridge?'entity-bridge':''} ${selected?'entity-selected':''} ${data.dim?'entity-dim':''}`}><Handle type="target" position={Position.Left}/><span className={`entity-glyph kind-${kind}`}><KindIcon kind={data.entity.kind} size={19}/></span><div className="entity-copy"><span className="entity-kind">{data.entity.kind}</span><strong>{data.entity.label}</strong><span className="entity-subtitle">{data.entity.subtitle}</span></div>{data.bridge&&<span className="bridge-label">Cross-case</span>}<Handle type="source" position={Position.Right}/></div>;});
const nodeTypes={entity:EntityCard};
const EMPTY_IDS:string[]=[];
function layoutPosition(entity:Entity, all:Entity[]):{x:number;y:number} {
 const sameKind=all.filter(item=>item.kind===entity.kind);
 const index=sameKind.findIndex(item=>item.id===entity.id);
 const columns:{[key:string]:{x:number;y:number}}={Case:{x:48,y:72},Person:{x:548,y:178},Phone:{x:298,y:178},Account:{x:298,y:178},Organization:{x:48,y:410},Location:{x:548,y:390}};
 const anchor=columns[entity.kind]||{x:280,y:180};
 const spread=entity.kind==='Case'?226:entity.kind==='Person'?150:116;
 return {x:anchor.x+(index%2)*18,y:anchor.y+index*spread};
}
export function GraphView({entities,relations,lead,onRelation,onEntity,expanded,onExpand}:{entities:Entity[];relations:Relation[];lead?:Lead;onRelation:(r:Relation)=>void;onEntity:(e:Entity)=>void;expanded:boolean;onExpand:()=>void}){
 const [nodes,setNodes]=useState<EntityNode[]>([]);
 const activeIds=lead?.entityIds||EMPTY_IDS;
 const visible=useMemo(()=>expanded||!lead?entities:entities.filter(e=>activeIds.includes(e.id)),[entities,expanded,lead,activeIds]);
 useEffect(()=>{setNodes(visible.map(e=>({id:e.id,type:'entity',position:layoutPosition(e,visible),data:{entity:e,active:activeIds.includes(e.id),dim:!!lead&&!activeIds.includes(e.id),bridge:e.caseIds.length>1}})));},[visible,lead,activeIds]);
 const ids=new Set(visible.map(e=>e.id));
 const edges:Edge[]=relations.filter(r=>ids.has(r.source)&&ids.has(r.target)).map(r=>{const active=lead?.relationIds.includes(r.id);const color=active||r.inferred?'#d36b53':'#8fb5c4';const graphLabel=r.label==='Reported contact · user unverified'?'Reported use':r.label;return {id:r.id,source:r.source,target:r.target,label:graphLabel,type:'default',animated:false,style:{stroke:color,strokeWidth:active?2.8:r.inferred?2:1.7,strokeDasharray:r.inferred?'7 5':undefined,opacity:lead&&!active?0.38:1},labelStyle:{fill:active||r.inferred?'#ffc1b0':'#c3dced',fontSize:9,fontWeight:600},labelBgStyle:{fill:'#14263a',fillOpacity:.96},labelBgPadding:[5,3],markerEnd:{type:MarkerType.ArrowClosed,width:15,height:15,color},interactionWidth:28};});
 return <div className="graph-stage"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={(changes:NodeChange<EntityNode>[])=>setNodes(ns=>applyNodeChanges(changes,ns))} onEdgeClick={(_,edge)=>{const r=relations.find(r=>r.id===edge.id);if(r)onRelation(r);}} onNodeClick={(_,node)=>onEntity(node.data.entity)} fitView fitViewOptions={{padding:.3,maxZoom:.9}} minZoom={.35} maxZoom={1.6} nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null}><Background variant={BackgroundVariant.Lines} color="#314757" gap={32} size={1}/><Controls showInteractive={false}/></ReactFlow><div className="graph-hud"><div><strong>Connection map</strong><span>{visible.length} entities, {edges.length} relationships</span></div><div className="graph-legend"><span><i/>Observed</span><span><i className="dashed"/>Inferred</span></div></div><button className="button graph-expand" onClick={onExpand}>{expanded?'Focus on lead':'Expand connections'}</button><div className="graph-help">Select a node or relationship to inspect its evidence</div></div>;
}
