import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X, ArrowUpRight, User, Phone, Bank, MapPin, Folder, Buildings,
  Car, Lightning, CirclesThree, CheckCircle,
} from '@phosphor-icons/react';
import type { EntityKind, ReviewStatus } from '../domain/types';

/* ─── Modal ─────────────────────────────────────────────── */
export function Modal({
  open, onClose, title, description, children, wide = false,
}: {
  open: boolean; onClose: () => void; title: string;
  description?: string; children: ReactNode; wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={`modal${wide ? ' modal-wide' : ''}`}
          aria-describedby={description ? 'modal-desc' : undefined}
        >
          <div className="modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && <Dialog.Description id="modal-desc">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="icon-btn" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── Drawer ─────────────────────────────────────────────── */
export function Drawer({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="drawer" aria-describedby={undefined}>
          <div className="modal-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-btn" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── Status badge ───────────────────────────────────────── */
export function StatusBadge({ status }: { status: ReviewStatus | string }) {
  const map: Record<string, string> = {
    unreviewed:  'badge badge-gray',
    reviewed:    'badge badge-green',
    dismissed:   'badge badge-gray',
    correction:  'badge badge-amber',
    Active:      'badge badge-active',
    'Under review': 'badge badge-amber',
    Closed:      'badge badge-gray',
    pending:     'badge badge-amber',
    approved:    'badge badge-green',
    rejected:    'badge badge-red',
    'IN CUSTODY':  'badge badge-custody',
    'COURIER':     'badge badge-courier',
    'S.41A CrPC':  'badge badge-amber',
  };
  const labels: Record<string, string> = {
    unreviewed: 'To review', reviewed: 'Reviewed',
    dismissed: 'Dismissed', correction: 'Correction',
    pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
  };
  return (
    <span className={map[status] ?? 'badge badge-gray'}>
      {labels[status] ?? status}
    </span>
  );
}

/* Keep old name for backward compat */
export const Status = StatusBadge;

import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

/* ─── Kind icon ──────────────────────────────────────────── */
export function KindIcon({ kind, size = 16 }: { kind: EntityKind; size?: number }) {
  const icons: Record<EntityKind, PhosphorIcon> = {
    Person: User, Phone, Account: Bank, Location: MapPin,
    Case: Folder, Organization: Buildings, Vehicle: Car,
    Incident: Lightning, Financial: CirclesThree,
  };
  const I = icons[kind] ?? CirclesThree;
  return <I size={size} />;
}

/* ─── Confidence badge ───────────────────────────────────── */
export function ConfidenceBadge({ value }: { value: number }) {
  const cls = value >= 90 ? 'confidence-high' : value >= 70 ? 'confidence-mid' : 'confidence-low';
  return <span className={`confidence ${cls}`}>{value}%</span>;
}

/* ─── Empty state ────────────────────────────────────────── */
export function Empty({
  title, children, action,
}: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <Folder size={28} weight="thin" />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

/* ─── Date display ───────────────────────────────────────── */
export function DateText({ value }: { value: string }) {
  const d = new Date(value);
  return (
    <time dateTime={value}>
      {Number.isNaN(d.getTime())
        ? value
        : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
    </time>
  );
}

/* ─── Source link button ─────────────────────────────────── */
export function SourceLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="text-btn" onClick={onClick} style={{ fontSize: 10 }}>
      {children}<ArrowUpRight size={12} />
    </button>
  );
}

/* ─── Toast ──────────────────────────────────────────────── */
export function Toast({
  message, onDismiss,
}: { message: string; onDismiss: () => void }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <CheckCircle size={17} />
      <span style={{ flex: 1 }}>{message}</span>
      <button className="icon-btn" aria-label="Dismiss" onClick={onDismiss}>
        <X size={14} />
      </button>
    </div>
  );
}

/* ─── Section heading ────────────────────────────────────── */
export function SectionHeading({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600 }}>{title}</h3>
        {sub && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
