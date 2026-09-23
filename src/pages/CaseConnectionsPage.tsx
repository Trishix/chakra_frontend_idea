import { memo, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow, Background, BackgroundVariant,
  Handle, Position, ReactFlowProvider, useReactFlow,
} from '@xyflow/react';
import type { Node, Edge, NodeProps } from '@xyflow/react';
import {
  ArrowUpRight, X, MagnifyingGlass,
  CornersOut, Plus, Minus,
} from '@phosphor-icons/react';
import { useStore } from '../store';
import { DateText, KindIcon } from '../components/ui';
import type { Entity, EntityKind, Relation } from '../domain/types';

/* ─── Radial layout positions around center Tariq Ahmed (460, 340) ─── */
const RADIAL_LAYOUT: Record<string, { x: number; y: number }> = {
  // Center
  'e-tariq':   { x: 460, y: 340 },

  // North (Case docket)
  'e-case1':   { x: 460, y: 110 },

  // North-East (Intercepted Phone)
  'e-phone1':  { x: 720, y: 200 },

  // Far North-East (Faridabad Cargo Theft Case)
  'e-case2':   { x: 970, y: 170 },

  // North-West (Hawala Bank Account)
  'e-acct1':   { x: 200, y: 190 },

  // Far North-West (Hawala Primary Hub Org)
  'e-org1':    { x: -20, y: 260 },

  // West (Chandni Chowk Transaction Point)
  'e-loc1':    { x: 170, y: 340 },

  // South-West (Silver Creta / Swift Vehicle)
  'e-vehicle': { x: 230, y: 490 },

  // Far South-West (Ring Road Toll ANPR)
  'e-loc3':    { x: 40,  y: 570 },

  // South (ISBT Kashmere Gate CCTV)
  'e-loc2':    { x: 340, y: 640 },

  // South-East (Courier Vikramaditya Malhotra)
  'e-vikram':  { x: 670, y: 480 },

  // Far South (Vikram Phone 2)
  'e-phone2':  { x: 670, y: 660 },

  // East (Surat Hawala Account)
  'e-acct2':   { x: 920, y: 380 },

  // Far South-East (Beneficiary Sunita Devi)
  'e-sunita':  { x: 920, y: 530 },
};

function getEntityPos(entity: Entity, all: Entity[]): { x: number; y: number } {
  if (RADIAL_LAYOUT[entity.id]) return RADIAL_LAYOUT[entity.id];
  if (entity.x !== undefined && entity.y !== undefined) return { x: entity.x, y: entity.y };
  const idx = all.findIndex(e => e.id === entity.id);
  const angle = (idx / Math.max(1, all.length)) * 2 * Math.PI;
  return {
    x: Math.round(460 + 280 * Math.cos(angle)),
    y: Math.round(340 + 240 * Math.sin(angle)),
  };
}

/* ─── Custom Intelligence Node Component ─────────────────── */
type IntelligenceNodeData = {
  entity: Entity;
  isSelected: boolean;
  isCenter: boolean;
  isDimmed: boolean;
  isNeighbor: boolean;
};

type EntityNode = Node<IntelligenceNodeData>;

const IntelligenceNode = memo(function IntelligenceNode({ data }: NodeProps<EntityNode>) {
  const { entity, isSelected, isCenter, isDimmed } = data;
  const kind = entity.kind;

  // Invisible handles on 4 cardinal directions for clean edge routing
  const handles = (
    <>
      <Handle type="target" id="t-top" position={Position.Top} style={{ opacity: 0, width: 4, height: 4 }} />
      <Handle type="source" id="s-top" position={Position.Top} style={{ opacity: 0, width: 4, height: 4 }} />
      <Handle type="target" id="t-bottom" position={Position.Bottom} style={{ opacity: 0, width: 4, height: 4 }} />
      <Handle type="source" id="s-bottom" position={Position.Bottom} style={{ opacity: 0, width: 4, height: 4 }} />
      <Handle type="target" id="t-left" position={Position.Left} style={{ opacity: 0, width: 4, height: 4 }} />
      <Handle type="source" id="s-left" position={Position.Left} style={{ opacity: 0, width: 4, height: 4 }} />
      <Handle type="target" id="t-right" position={Position.Right} style={{ opacity: 0, width: 4, height: 4 }} />
      <Handle type="source" id="s-right" position={Position.Right} style={{ opacity: 0, width: 4, height: 4 }} />
    </>
  );

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    opacity: isDimmed ? 0.35 : 1,
    transition: 'all .18s ease-out',
    position: 'relative',
    userSelect: 'none',
  };

  /* ── 1. CENTER PRIMARY ACCUSED: Tariq Ahmed ── */
  if (isCenter || entity.id === 'e-tariq') {
    return (
      <div style={containerStyle}>
        {handles}
        {/* Outer Halo */}
        <div style={{
          position: 'absolute',
          top: -10,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29, 78, 216, 0.22) 0%, rgba(29, 78, 216, 0) 70%)',
          pointerEvents: 'none',
          animation: 'pulse 2.4s infinite ease-in-out',
        }} />

        {/* Circular Token */}
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#0c1e35',
          border: isSelected ? '3px solid #1a56db' : '2.5px solid #2563eb',
          boxShadow: isSelected ? '0 0 0 4px rgba(26,86,219,0.35), 0 4px 16px rgba(12,30,53,0.3)' : '0 4px 12px rgba(12,30,53,0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', letterSpacing: '.02em' }}>TA</span>
          <span style={{ fontSize: 7.5, fontWeight: 700, color: '#93c5fd', letterSpacing: '.06em', marginTop: 1 }}>CUSTODY</span>
        </div>

        {/* Label Pill */}
        <div style={{
          marginTop: 6,
          background: '#0c1e35',
          border: '1px solid #1e3f63',
          borderRadius: 4,
          padding: '3px 10px',
          boxShadow: '0 2px 8px rgba(12,30,53,0.18)',
          textAlign: 'center',
          zIndex: 2,
          maxWidth: 160,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap' }}>Tariq Ahmed (Accused)</div>
          <div style={{ fontSize: 8.5, color: '#94a3b8', marginTop: 1 }}>Alias: Doctor · Syndicate 11</div>
        </div>
      </div>
    );
  }

  /* ── 2. CASE / FIR NODES ── */
  if (kind === 'Case') {
    const isDirect = entity.id === 'e-case1';
    return (
      <div style={containerStyle}>
        {handles}
        {/* Emblem */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '12px 12px 24px 24px',
          background: isDirect ? '#dc2626' : '#ffffff',
          border: isDirect ? '2px solid #b91c1c' : '2px dashed #dc2626',
          boxShadow: isSelected ? '0 0 0 3px rgba(220,38,38,0.35), 0 4px 12px rgba(0,0,0,0.12)' : '0 3px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDirect ? '#ffffff' : '#dc2626',
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: '.06em',
          position: 'relative',
        }}>
          {isDirect ? 'FIR' : 'CASE'}
        </div>
        {/* Label Pill */}
        <div style={{
          marginTop: 6,
          background: '#ffffff',
          border: `1px solid ${isSelected ? '#dc2626' : '#e2e8f0'}`,
          borderRadius: 4,
          padding: '4px 10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          textAlign: 'center',
          maxWidth: 170,
        }}>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: '#0c1e35', whiteSpace: 'nowrap' }}>
            {entity.label}
          </div>
          <div style={{ fontSize: 8.5, color: '#64748b', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entity.subtitle}
          </div>
        </div>
      </div>
    );
  }

  /* ── 3. PHONE NODES ── */
  if (kind === 'Phone') {
    const isIntercepted = entity.id === 'e-phone1';
    return (
      <div style={containerStyle}>
        {handles}
        {/* Phone Token */}
        <div style={{
          width: 46,
          height: 46,
          borderRadius: 8,
          background: '#0284c7',
          border: isSelected ? '2px solid #0369a1' : '1.5px solid #0284c7',
          boxShadow: isSelected ? '0 0 0 4px rgba(2,132,199,0.3), 0 4px 12px rgba(2,132,199,0.2)' : '0 3px 8px rgba(2,132,199,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          position: 'relative',
        }}>
          <KindIcon kind="Phone" size={20} />
          {isIntercepted && (
            <div style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 15,
              height: 15,
              borderRadius: '50%',
              background: '#dc2626',
              color: '#ffffff',
              fontSize: 9,
              fontWeight: 800,
              display: 'grid',
              placeItems: 'center',
              border: '1.5px solid #ffffff',
            }}>
              !
            </div>
          )}
        </div>
        {/* Label Pill */}
        <div style={{
          marginTop: 6,
          background: '#0c1e35',
          border: `1px solid ${isSelected ? '#38bdf8' : '#0369a1'}`,
          borderRadius: 4,
          padding: '4px 10px',
          boxShadow: '0 2px 8px rgba(12,30,53,0.15)',
          textAlign: 'center',
          maxWidth: 160,
        }}>
          <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', whiteSpace: 'nowrap' }}>
            {entity.label}
          </div>
          <div style={{ fontSize: 8.5, color: '#94a3b8', marginTop: 1, whiteSpace: 'nowrap' }}>
            {isIntercepted ? 'Airtel · Intercepted' : entity.subtitle}
          </div>
        </div>
      </div>
    );
  }

  /* ── 4. VEHICLE NODES ── */
  if (kind === 'Vehicle') {
    return (
      <div style={containerStyle}>
        {handles}
        {/* Hexagon / Slate Token */}
        <div style={{
          width: 48,
          height: 44,
          borderRadius: 6,
          background: '#334155',
          border: isSelected ? '2px solid #1a56db' : '1.5px solid #475569',
          boxShadow: isSelected ? '0 0 0 3px rgba(51,65,85,0.35)' : '0 3px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
        }}>
          <KindIcon kind="Vehicle" size={17} />
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '.06em', color: '#cbd5e1' }}>SWIFT</span>
        </div>
        {/* Label Pill */}
        <div style={{
          marginTop: 6,
          background: '#ffffff',
          border: `1px solid ${isSelected ? '#334155' : '#e2e8f0'}`,
          borderRadius: 4,
          padding: '4px 10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          textAlign: 'center',
          maxWidth: 160,
        }}>
          <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: '#0c1e35', whiteSpace: 'nowrap' }}>
            {entity.label}
          </div>
          <div style={{ fontSize: 8.5, color: '#64748b', marginTop: 1, whiteSpace: 'nowrap' }}>
            {entity.subtitle}
          </div>
        </div>
      </div>
    );
  }

  /* ── 5. FINANCIAL ACCOUNT NODES ── */
  if (kind === 'Financial' || kind === 'Account') {
    return (
      <div style={containerStyle}>
        {handles}
        {/* Diamond Token */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: '#b45309',
          border: isSelected ? '2px solid #1a56db' : '1.5px solid #78350f',
          boxShadow: isSelected ? '0 0 0 3px rgba(180,83,9,0.35)' : '0 3px 8px rgba(180,83,9,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          transform: 'rotate(45deg)',
        }}>
          <div style={{ transform: 'rotate(-45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <KindIcon kind="Financial" size={16} />
            <span style={{ fontSize: 6.5, fontWeight: 800, letterSpacing: '.06em' }}>BANK</span>
          </div>
        </div>
        {/* Label Pill */}
        <div style={{
          marginTop: 8,
          background: '#ffffff',
          border: `1px solid ${isSelected ? '#b45309' : '#e2e8f0'}`,
          borderRadius: 4,
          padding: '4px 10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          textAlign: 'center',
          maxWidth: 160,
        }}>
          <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#0c1e35', whiteSpace: 'nowrap' }}>
            {entity.label}
          </div>
          <div style={{ fontSize: 8.5, color: '#b45309', fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap' }}>
            {entity.subtitle}
          </div>
        </div>
      </div>
    );
  }

  /* ── 6. LOCATION / CAMERA NODES ── */
  if (kind === 'Location') {
    const isCamera = entity.id === 'e-loc2' || entity.label.toLowerCase().includes('isbt') || entity.label.toLowerCase().includes('cam');
    return (
      <div style={containerStyle}>
        {handles}
        {/* Token */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: isCamera ? '#0f766e' : '#1e3f63',
          border: isSelected ? '2px solid #1a56db' : '1.5px solid #0f766e',
          boxShadow: isSelected ? '0 0 0 3px rgba(15,118,110,0.35)' : '0 3px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
        }}>
          <KindIcon kind={kind} size={20} />
        </div>
        {/* Label Pill */}
        <div style={{
          marginTop: 6,
          background: '#ffffff',
          border: `1px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
          borderRadius: 4,
          padding: '4px 10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          textAlign: 'center',
          maxWidth: 160,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0c1e35', whiteSpace: 'nowrap' }}>
            {entity.label}
          </div>
          <div style={{ fontSize: 8.5, color: '#64748b', marginTop: 1, whiteSpace: 'nowrap' }}>
            {entity.subtitle}
          </div>
        </div>
      </div>
    );
  }

  /* ── 7. OTHER PERSONS (Vikramaditya, Sunita) & ORGANIZATIONS ── */
  return (
    <div style={containerStyle}>
      {handles}
      {/* Circular Avatar / Badge */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: kind === 'Organization' ? 8 : '50%',
        background: '#152d4a',
        border: isSelected ? '2.5px solid #1a56db' : '1.5px solid #203f66',
        boxShadow: isSelected ? '0 0 0 3px rgba(26,86,219,0.3)' : '0 3px 8px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
      }}>
        <KindIcon kind={kind} size={20} />
      </div>
      {/* Label Pill */}
      <div style={{
        marginTop: 6,
        background: '#ffffff',
        border: `1px solid ${isSelected ? '#1a56db' : '#e2e8f0'}`,
        borderRadius: 4,
        padding: '4px 10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        textAlign: 'center',
        maxWidth: 160,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0c1e35', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entity.label}
        </div>
        <div style={{ fontSize: 8.5, color: '#64748b', marginTop: 1, whiteSpace: 'nowrap' }}>
          {entity.subtitle}
        </div>
      </div>
    </div>
  );
});

const nodeTypes = { intelligenceNode: IntelligenceNode };

/* ─── Edge Short Label Formatter ─────────────────────────── */
function getConciseVerb(r: Relation): string {
  const l = r.label.toLowerCase();
  if (l.includes('primary device') || l.includes('142 contact')) return 'called · 142x';
  if (l.includes('device overlap') || l.includes('shared')) return 'shared phone';
  if (l.includes('neft') || l.includes('payment') || l.includes('transfer')) return 'payment · ₹45L';
  if (l.includes('toll') || l.includes('cctv') || l.includes('vehicle match') || l.includes('sighting')) return 'vehicle match';
  if (l.includes('witness') || l.includes('affiliation') || l.includes('associated')) return 'associated with';
  if (l.includes('named in')) return 'linked case';
  if (l.includes('tower') || l.includes('location')) return 'visited tower';
  if (l.includes('beneficiary')) return 'beneficiary';
  if (l.includes('registered owner')) return 'registered owner';
  if (l.includes('registered contact')) return 'contact';
  if (l.includes('account linked')) return 'account linked';
  return r.label;
}

/* ─── Inner Network Graph Component with useReactFlow ────── */
function CaseConnectionsInner() {
  const { caseId = 'c1' } = useParams<{ caseId: string }>();
  const { state } = useStore();
  const navigate = useNavigate();
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const [hopDepth, setHopDepth] = useState<number>(2);
  const [kindFilter, setKindFilter] = useState<Set<EntityKind>>(new Set());
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('e-phone1');
  const [showDirect, setShowDirect] = useState(true);
  const [showInferred, setShowInferred] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Core case entities & relations
  const caseEntities = useMemo(
    () => state.entities.filter(e => e.caseIds.includes(caseId)),
    [state.entities, caseId]
  );
  const caseEntityIds = useMemo(() => new Set(caseEntities.map(e => e.id)), [caseEntities]);

  const allRelations = useMemo(
    () => state.relations.filter(r => caseEntityIds.has(r.source) || caseEntityIds.has(r.target)),
    [state.relations, caseEntityIds]
  );

  // 2. Direct vs Inferred filtering
  const layerFilteredRelations = useMemo(() => {
    return allRelations.filter(r => (r.inferred ? showInferred : showDirect));
  }, [allRelations, showDirect, showInferred]);

  // 3. Hop distance calculation from primary center (e-tariq)
  const hopFilteredEntities = useMemo(() => {
    if (hopDepth >= 3) return caseEntities;
    const rootId = 'e-tariq';
    const distances = new Map<string, number>();
    const queue: { id: string; dist: number }[] = [{ id: rootId, dist: 0 }];
    distances.set(rootId, 0);

    while (queue.length > 0) {
      const { id, dist } = queue.shift()!;
      if (dist >= hopDepth) continue;

      for (const r of layerFilteredRelations) {
        let neighbor = '';
        if (r.source === id) neighbor = r.target;
        else if (r.target === id) neighbor = r.source;

        if (neighbor && !distances.has(neighbor)) {
          distances.set(neighbor, dist + 1);
          queue.push({ id: neighbor, dist: dist + 1 });
        }
      }
    }

    return caseEntities.filter(e => (distances.get(e.id) ?? 99) <= hopDepth);
  }, [caseEntities, layerFilteredRelations, hopDepth]);

  // 4. Kind filter & Search filter
  const visibleEntities = useMemo(() => {
    return hopFilteredEntities.filter(e => {
      const matchKind = kindFilter.size === 0 || kindFilter.has(e.kind);
      const matchSearch = !searchQuery.trim() ||
        `${e.label} ${e.kind} ${e.subtitle}`.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchKind && matchSearch;
    });
  }, [hopFilteredEntities, kindFilter, searchQuery]);

  const visibleIds = useMemo(() => new Set(visibleEntities.map(e => e.id)), [visibleEntities]);

  const visibleRelations = useMemo(() => {
    return layerFilteredRelations.filter(r => visibleIds.has(r.source) && visibleIds.has(r.target));
  }, [layerFilteredRelations, visibleIds]);

  const selectedEntity = selectedEntityId ? state.entities.find(e => e.id === selectedEntityId) : null;

  // Neighbors of selected entity
  const neighborIds = useMemo(() => {
    if (!selectedEntityId) return new Set<string>();
    const set = new Set<string>([selectedEntityId]);
    visibleRelations.forEach(r => {
      if (r.source === selectedEntityId) set.add(r.target);
      if (r.target === selectedEntityId) set.add(r.source);
    });
    return set;
  }, [selectedEntityId, visibleRelations]);

  // 5. Memoized React Flow Nodes
  const nodes: EntityNode[] = useMemo(() => {
    return visibleEntities.map(e => {
      const pos = getEntityPos(e, visibleEntities);
      const isSelected = e.id === selectedEntityId;
      const isDimmed = selectedEntityId !== null && !neighborIds.has(e.id);
      return {
        id: e.id,
        type: 'intelligenceNode',
        position: pos,
        data: {
          entity: e,
          isSelected,
          isCenter: e.id === 'e-tariq',
          isDimmed,
          isNeighbor: neighborIds.has(e.id),
        },
      };
    });
  }, [visibleEntities, selectedEntityId, neighborIds]);

  // 6. Memoized React Flow Edges with automatic cardinal handle selection
  const edges: Edge[] = useMemo(() => {
    return visibleRelations.map(r => {
      const sourcePos = RADIAL_LAYOUT[r.source] ?? { x: 460, y: 340 };
      const targetPos = RADIAL_LAYOUT[r.target] ?? { x: 460, y: 340 };
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;

      let sourceHandle = 's-right';
      let targetHandle = 't-left';

      if (Math.abs(dy) > Math.abs(dx)) {
        if (dy > 0) {
          sourceHandle = 's-bottom';
          targetHandle = 't-top';
        } else {
          sourceHandle = 's-top';
          targetHandle = 't-bottom';
        }
      } else {
        if (dx > 0) {
          sourceHandle = 's-right';
          targetHandle = 't-left';
        } else {
          sourceHandle = 's-left';
          targetHandle = 't-right';
        }
      }

      const isConnected = selectedEntityId
        ? r.source === selectedEntityId || r.target === selectedEntityId
        : false;
      const isDimmed = selectedEntityId !== null && !isConnected;

      const strokeColor = isConnected
        ? '#1d4ed8'
        : r.inferred
        ? '#b45309'
        : '#475569';

      const shortLabel = getConciseVerb(r);

      return {
        id: r.id,
        source: r.source,
        target: r.target,
        sourceHandle,
        targetHandle,
        label: shortLabel,
        type: 'straight',
        style: {
          stroke: strokeColor,
          strokeWidth: isConnected ? 2.8 : r.inferred ? 2 : 1.7,
          strokeDasharray: r.inferred ? '6 4' : undefined,
          opacity: isDimmed ? 0.22 : 1,
          transition: 'all .2s ease',
        },
        labelStyle: {
          fill: r.inferred ? '#92400e' : '#1e293b',
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        },
        labelBgStyle: {
          fill: r.inferred ? '#fef3c7' : '#ffffff',
          fillOpacity: 0.98,
          stroke: isConnected ? '#1d4ed8' : r.inferred ? '#fde68a' : '#e2e8f0',
          strokeWidth: isConnected ? 1.5 : 1,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        interactionWidth: 28,
      };
    });
  }, [visibleRelations, selectedEntityId]);

  const kindList: { kind: EntityKind; label: string }[] = [
    { kind: 'Person', label: 'People' },
    { kind: 'Phone', label: 'Phones' },
    { kind: 'Financial', label: 'Accounts' },
    { kind: 'Vehicle', label: 'Vehicles' },
    { kind: 'Case', label: 'Cases' },
    { kind: 'Location', label: 'Locations' },
  ];

  const selectedConnections = selectedEntity
    ? visibleRelations.filter(r => r.source === selectedEntityId || r.target === selectedEntityId)
    : [];

  const activeCaseRecord = state.cases.find(c => c.id === caseId) ?? state.cases[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: 'calc(100dvh - 56px)', overflow: 'hidden' }}>
      {/* ── Main Canvas Column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
        {/* Top Control Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '8px 16px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          zIndex: 10,
        }}>
          {/* Identity Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: '#0c1e35',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: 3,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '.06em',
            }}>
              NET-09
            </span>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
              TARIQ AHMED
            </div>
            <span style={{ color: 'var(--border-mid)' }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {visibleEntities.length} records / {visibleRelations.length} connections
            </span>
          </div>

          {/* Controls row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Direct vs Inferred toggles */}
            <div style={{ display: 'flex', background: 'var(--surface-alt)', padding: 2, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowDirect(v => !v)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 0,
                  cursor: 'pointer',
                  background: showDirect ? 'var(--blue-primary)' : 'transparent',
                  color: showDirect ? '#ffffff' : 'var(--muted)',
                  transition: 'all .12s',
                }}
              >
                Recorded
              </button>
              <button
                type="button"
                onClick={() => setShowInferred(v => !v)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 0,
                  cursor: 'pointer',
                  background: showInferred ? '#fef3c7' : 'transparent',
                  color: showInferred ? '#92400e' : 'var(--muted)',
                  transition: 'all .12s',
                }}
              >
                Suggested
              </button>
            </div>

            {/* Entity Kind Filter Pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {kindList.map(({ kind, label }) => {
                const active = kindFilter.has(kind);
                const count = caseEntities.filter(e => e.kind === kind).length;
                if (count === 0) return null;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setKindFilter(prev => {
                      const next = new Set(prev);
                      if (next.has(kind)) next.delete(kind);
                      else next.add(kind);
                      return next;
                    })}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 3,
                      fontSize: 10.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: `1px solid ${active ? 'var(--blue-primary)' : 'var(--border)'}`,
                      background: active ? 'var(--blue-subtle)' : 'var(--surface)',
                      color: active ? 'var(--blue-primary)' : 'var(--text-2)',
                    }}
                  >
                    {label} <span style={{ opacity: 0.65, fontSize: 9.5 }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Hop Filter */}
            <div style={{ display: 'flex', background: 'var(--surface-alt)', padding: 2, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              {[1, 2, 3].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHopDepth(h)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 3,
                    fontSize: 10.5,
                    fontWeight: 600,
                    border: 0,
                    cursor: 'pointer',
                    background: hopDepth === h ? 'var(--surface)' : 'transparent',
                    color: hopDepth === h ? 'var(--blue-primary)' : 'var(--muted)',
                    boxShadow: hopDepth === h ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {h} link{h !== 1 ? 's' : ''}
                </button>
              ))}
            </div>

            {/* Canvas Zoom & Fit View Controls */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 2 }}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 24, height: 24 }}
                onClick={() => zoomIn()}
                title="Zoom In"
              >
                <Plus size={13} />
              </button>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 24, height: 24 }}
                onClick={() => zoomOut()}
                title="Zoom Out"
              >
                <Minus size={13} />
              </button>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 24, height: 24 }}
                onClick={() => fitView({ padding: 0.18, duration: 400 })}
                title="Fit Graph to Screen"
              >
                <CornersOut size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar: Search & Distance Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          background: 'var(--surface-alt)',
          borderBottom: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MagnifyingGlass size={13} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Find record (name, case, phone)..."
              style={{
                border: '1px solid var(--border)',
                borderRadius: 3,
                padding: '2px 8px',
                fontSize: 11,
                width: 220,
                background: 'var(--surface)',
              }}
            />
          </div>
          <div>
            Distance from Tariq Ahmed: <strong>{hopDepth} link{hopDepth !== 1 ? 's' : ''}</strong>
          </div>
          {(kindFilter.size > 0 || searchQuery || !showDirect || !showInferred || hopDepth !== 2) && (
            <button
              type="button"
              className="text-btn"
              style={{ fontSize: 11 }}
              onClick={() => {
                setKindFilter(new Set());
                setSearchQuery('');
                setShowDirect(true);
                setShowInferred(true);
                setHopDepth(2);
                setSelectedEntityId('e-tariq');
                fitView({ padding: 0.18 });
              }}
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Stage Wrapper */}
        <div style={{ flex: 1, position: 'relative', background: '#f8fafc', overflow: 'hidden' }}>
          {/* Top-Left Floating Caption */}
          <div style={{
            position: 'absolute',
            top: 14,
            left: 16,
            zIndex: 5,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--navy)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            pointerEvents: 'none',
          }}>
            <span>{activeCaseRecord.reference}</span>
            <span style={{ margin: '0 6px', color: 'var(--border-mid)' }}>|</span>
            <span style={{ color: 'var(--blue-primary)', fontWeight: 600 }}>Case connections</span>
          </div>

          {/* Top-Right Floating Status */}
          <div style={{
            position: 'absolute',
            top: 14,
            right: 16,
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 10px',
            fontSize: 11,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>2 warrants pending</span>
            <span style={{ color: 'var(--muted)' }}>Centered: Tariq Ahmed</span>
          </div>

          {/* React Flow Canvas */}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedEntityId(node.id)}
            onEdgeClick={(_, edge) => {
              const rel = allRelations.find(r => r.id === edge.id);
              if (rel) setSelectedEntityId(rel.source);
            }}
            onPaneClick={() => setSelectedEntityId(null)}
            fitView
            fitViewOptions={{ padding: 0.22, minZoom: 0.5, maxZoom: 1.1 }}
            minZoom={0.3}
            maxZoom={1.6}
            nodesDraggable={true}
            nodesConnectable={false}
            edgesReconnectable={false}
            deleteKeyCode={null}
          >
            <Background variant={BackgroundVariant.Dots} color="#cbd5e1" gap={22} size={1.2} />
          </ReactFlow>

          {/* Bottom Floating Legend */}
          <div style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(6px)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '5px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 11,
            color: 'var(--text-2)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            pointerEvents: 'none',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 2, background: '#475569' }} /> Recorded
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 2, borderTop: '2px dashed #b45309' }} /> Suggested
            </span>
            <span style={{ color: 'var(--border-mid)' }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0c1e35' }} /> Person
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#0284c7' }} /> Phone
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: '#b45309' }} /> Bank
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#dc2626' }} /> FIR
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#334155' }} /> Vehicle
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#0f766e' }} /> Location
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Inspector Panel ── */}
      <div style={{ background: 'var(--surface)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {selectedEntity ? (
          <div>
            {/* Header */}
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge badge-${selectedEntity.kind}`} style={{ fontSize: 9.5 }}>
                  {selectedEntity.kind}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSelectedEntityId(null)}
                  title="Close inspector"
                >
                  <X size={15} />
                </button>
              </div>
              <h3 style={{ fontSize: 17, color: 'var(--navy)', marginTop: 8 }}>{selectedEntity.label}</h3>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{selectedEntity.subtitle}</p>
              {selectedEntity.status && (
                <div style={{ marginTop: 8 }}>
                  <span className="badge badge-amber" style={{ fontSize: 9 }}>{selectedEntity.status}</span>
                </div>
              )}
            </div>

            {/* Facts / Details table */}
            {selectedEntity.metadata && Object.keys(selectedEntity.metadata).length > 0 && (
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>
                  Intelligence Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(selectedEntity.metadata).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{k}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Connections */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)' }}>
                  Connections ({selectedConnections.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedConnections.map(r => {
                  const otherId = r.source === selectedEntityId ? r.target : r.source;
                  const other = state.entities.find(e => e.id === otherId);
                  if (!other) return null;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedEntityId(other.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '8px 10px',
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <KindIcon kind={other.kind} size={15} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{other.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                          {r.label} · <DateText value={r.date} />
                          {r.inferred && <span className="badge badge-amber" style={{ fontSize: 8, marginLeft: 4 }}>Inferred</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Related Cases */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>
                Related Cases ({selectedEntity.caseIds.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedEntity.caseIds.map(cid => {
                  const c = state.cases.find(x => x.id === cid);
                  if (!c) return null;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => navigate(`/cases/${cid}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 11,
                        color: 'var(--blue-primary)',
                      }}
                    >
                      <span className="mono" style={{ fontWeight: 600 }}>{c.reference}</span>
                      <ArrowUpRight size={12} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/entities/${selectedEntity.id}`)}
              >
                View Full Dossier <ArrowUpRight size={13} />
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate(`/cases/${caseId}/evidence`)}
              >
                View Case Evidence
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', marginTop: 80 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px',
              color: 'var(--muted)',
            }}>
              <CornersOut size={22} />
            </div>
            <h4 style={{ fontSize: 13, color: 'var(--navy)', marginBottom: 4 }}>Select Entity to Inspect</h4>
            <p style={{ fontSize: 11, lineHeight: 1.6, maxWidth: 220, margin: '0 auto' }}>
              Click any node in the network to inspect its relationships, evidence sources, and cross-case links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Exported CaseConnectionsPage with Provider Wrapper ─── */
export function CaseConnectionsPage() {
  return (
    <ReactFlowProvider>
      <CaseConnectionsInner />
    </ReactFlowProvider>
  );
}
