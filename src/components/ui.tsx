import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowUpRight, User, Phone, Bank, MapPin, Folder, Buildings } from '@phosphor-icons/react';
import type { EntityKind, ReviewStatus } from '../domain/types';

export function Modal({open,onClose,title,description,children,wide=false}:{open:boolean;onClose:()=>void;title:string;description?:string;children:ReactNode;wide?:boolean}) {
  return <Dialog.Root open={open} onOpenChange={v=>!v&&onClose()}><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className={`modal ${wide?'modal-wide':''}`} aria-describedby={description?'modal-description':undefined}><div className="modal-heading"><div><Dialog.Title>{title}</Dialog.Title>{description&&<Dialog.Description id="modal-description">{description}</Dialog.Description>}</div><Dialog.Close className="icon-button" aria-label="Close dialog"><X size={20}/></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
export function Drawer({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:ReactNode}) {
 return <Dialog.Root open={open} onOpenChange={v=>!v&&onClose()}><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="drawer" aria-describedby={undefined}><div className="modal-heading"><Dialog.Title>{title}</Dialog.Title><Dialog.Close className="icon-button" aria-label="Close drawer"><X size={20}/></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
export function Status({status}:{status:ReviewStatus|string}) { const labels:Record<string,string>={unreviewed:'To review',reviewed:'Reviewed',dismissed:'Dismissed',correction:'Correction requested',Active:'Active','Under review':'Under review',Closed:'Closed'};return <span className={`status status-${status.toLowerCase().replaceAll(' ','-')}`}>{labels[status]||status}</span>; }
export function KindIcon({kind,size=18}:{kind:EntityKind;size?:number}) { const I={Person:User,Phone,Account:Bank,Location:MapPin,Case:Folder,Organization:Buildings}[kind];return <I size={size} weight="regular"/>; }
export function Empty({title,children,action}:{title:string;children?:ReactNode;action?:ReactNode}) {return <div className="empty"><Folder size={28} weight="thin"/><h3>{title}</h3><p>{children}</p>{action}</div>;}
export function DateText({value}:{value:string}) {const d=new Date(value);return <time dateTime={value}>{Number.isNaN(d.getTime())?value:d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</time>;}
export function SourceLink({children,onClick}:{children:ReactNode;onClick:()=>void}) {return <button className="source-link" onClick={onClick}>{children}<ArrowUpRight size={14}/></button>;}
