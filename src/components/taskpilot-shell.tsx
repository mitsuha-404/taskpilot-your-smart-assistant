import { useState, type ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Layers, ListTodo, Users, ChartNoAxesColumnIncreasing, PanelLeftClose, PanelLeftOpen, ChevronRight, RotateCcw, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTaskPilot } from './taskpilot-store';
export function Avatar({name, index=0,big=false}:{name:string;index?:number;big?:boolean}) { return <span className={`avatar tone${index%5} ${big?'big':''}`} aria-hidden="true">{name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>; }
export function TaskPilotShell({children}:{children:ReactNode}) {
 const [collapsed,setCollapsed]=useState(false),[resetOpen,setResetOpen]=useState(false);
 const {tasks,reset,storageError}=useTaskPilot();
 const pathname=useRouterState({select:s=>s.location.pathname});
 const title=pathname==='/team'?'Team':pathname==='/workload'?'Workload':'Tasks';
 return <div className={`workspace ${collapsed?'collapsed':''}`}>
  <aside className="sidebar"><Link to="/" className="brand" aria-label="TaskPilot home"><span className="brand-mark"><Layers size={19}/></span><span className="brand-name">TaskPilot<span className="muted">.</span></span></Link>
   <div className="workspace-label">Workspace</div><nav aria-label="Main navigation">
    <Link to="/" activeOptions={{exact:true}} className="nav-item" title="Tasks"><ListTodo/><span className="nav-text">Tasks</span><span className="nav-count">{tasks.length}</span></Link>
    <Link to="/team" className="nav-item" title="Team"><Users/><span className="nav-text">Team</span></Link>
    <Link to="/workload" className="nav-item" title="Workload"><ChartNoAxesColumnIncreasing/><span className="nav-text">Workload</span></Link>
   </nav><div className="sidebar-bottom"><div className="demo-box"><div className="demo-title"><span className="demo-dot"/>Demo workspace</div><p>Fictional team. Real possibilities.<br/>Your changes stay in this browser.</p><Button variant="ghost" size="sm" onClick={()=>setResetOpen(true)}><RotateCcw size={12}/>Reset demo data</Button></div><div className="sidebar-person"><Avatar name="Demo Team" big/><div><strong>Demo team</strong><small>Personal workspace</small></div></div></div>
  </aside><div className="main-shell"><header className="topbar"><Button variant="ghost" size="icon" aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} title={collapsed?'Expand sidebar':'Collapse sidebar'} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</Button><span>Workspace</span><ChevronRight size={12}/><span className="crumb">{title}</span><div className="topbar-end"><span className="offline-label"><ShieldCheck size={13}/>Saved on this device</span><Button variant="ghost" size="icon" aria-label="Reset workspace" title="Reset demo data" onClick={()=>setResetOpen(true)}><RotateCcw size={14}/></Button><Avatar name="Demo Team"/></div></header>{storageError&&<div className="notice" role="alert">{storageError}</div>}{children}</div>
  <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogTitle>Reset demo data?</DialogTitle><DialogDescription>This replaces your tasks, members, and priority settings with fictional sample data. This cannot be undone.</DialogDescription><div className="editor-actions"><Button variant="outline" onClick={()=>setResetOpen(false)}>Cancel</Button><Button variant="destructive" onClick={()=>{reset();setResetOpen(false);}}>Reset demo data</Button></div></DialogContent></Dialog>
 </div>;
}
export function PageFooter(){return <footer className="page-foot"><span>TaskPilot · A little clarity goes a long way.</span><span>Sample data · Stored locally on your device</span></footer>}
export function Insight({title,children,link=true}:{title:string;children:ReactNode;link?:boolean}){return <div className="insight-band"><span className="insight-icon"><ChartNoAxesColumnIncreasing size={16}/></span><div><h3>{title}</h3><p>{children}</p></div>{link&&<Button variant="ghost" size="sm" asChild className="insight-link"><Link to="/workload">View workload<ArrowUpRight size={13}/></Link></Button>}</div>}