import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { demoData, normalize, type Data, type Task, type Member, type Weights } from '@/lib/taskpilot';
const KEY = 'taskpilot-workspace-v1';
type Store = Data & { ready: boolean; storageError: string; saveTask: (t:Task)=>void; deleteTask:(id:string)=>void; saveMember:(m:Member)=>void; setWeights:(w:Weights)=>void; reset:()=>void };
const Context = createContext<Store | null>(null);
export function TaskPilotProvider({children}:{children:ReactNode}) {
  const [data,setData] = useState<Data>({tasks:[],members:[],weights:{urgency:40,importance:35,effort:25}});
  const [ready,setReady] = useState(false);
  const [storageError,setStorageError] = useState('');
  useEffect(()=> { try { const raw = localStorage.getItem(KEY); if(raw) { setData(normalize(JSON.parse(raw))); } else setData(demoData()); } catch { setData(demoData()); setStorageError('Saved data could not be loaded. A fresh demo is displayed.'); } setReady(true); },[]);
  useEffect(()=> { if(ready) try {localStorage.setItem(KEY,JSON.stringify(data));} catch {setStorageError('Your browser could not save changes. Keep this tab open to retain your work.');} },[data,ready]);
  return <Context.Provider value={{...data,ready,storageError,saveTask:t=>setData(d=>({...d,tasks:d.tasks.some(x=>x.id===t.id)?d.tasks.map(x=>x.id===t.id?t:x):[...d.tasks,t]})),deleteTask:id=>setData(d=>({...d,tasks:d.tasks.filter(t=>t.id!==id&&t.parentId!==id)})),saveMember:m=>setData(d=>({...d,members:d.members.some(x=>x.id===m.id)?d.members.map(x=>x.id===m.id?m:x):[...d.members,m]})),setWeights:weights=>setData(d=>({...d,weights})),reset:()=>{setData(demoData());setStorageError('');}}}>{children}</Context.Provider>;
}
export function useTaskPilot() { const value=useContext(Context); if(!value) throw new Error('TaskPilot provider is required'); return value; }