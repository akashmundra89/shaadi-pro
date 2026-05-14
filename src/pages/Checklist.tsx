import { useEffect, useState } from 'react';
import { db } from '../db';
import { useToast } from '../context/ToastContext';
import type { Task } from '../types';

interface Props {
  weddingId: number | null;
  refreshKey: number;
  onRefresh: () => void;
}

function TaskList({ tasks, type, weddingId, onRefresh }: { tasks: Task[]; type: 'pre' | 'day'; weddingId: number | null; onRefresh: () => void }) {
  const [inp, setInp] = useState('');
  const [who, setWho] = useState('');
  const { toast } = useToast();

  async function toggle(id: number) {
    const t = await db.tasks.get(id);
    if (t) { await db.tasks.update(id, { done: !t.done }); onRefresh(); }
  }

  async function deleteTask(id: number) {
    await db.tasks.delete(id); onRefresh();
  }

  async function addTask() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const label = inp.trim();
    if (!label) return;
    await db.tasks.add({ weddingId, type, label, who: who.trim(), done: false });
    setInp(''); setWho('');
    onRefresh();
    toast('✓ Task added');
  }

  const done = tasks.filter(t => t.done).length;

  return (
    <div className="card">
      <div className="card-hd">
        <div className="card-hd-l">
          {type === 'pre'
            ? <><i className="ti ti-list-check" style={{ color: 'var(--teal)' }} /> Pre-Wedding Tasks</>
            : <><i className="ti ti-clock" style={{ color: 'var(--amber)' }} /> Wedding Day Tasks</>
          }
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{done}/{tasks.length} done</span>
      </div>

      {tasks.map(t => (
        <div className="ck" key={t.id}>
          <div className={`ck-box ${t.done ? 'done' : ''}`} onClick={() => t.id && toggle(t.id)}>{t.done ? '✓' : ''}</div>
          <span className={`ck-lbl ${t.done ? 'done' : ''}`}>{t.label}</span>
          <span className="ck-who">{t.who}</span>
          <button className="ck-del" onClick={() => t.id && deleteTask(t.id)}><i className="ti ti-x" /></button>
        </div>
      ))}

      <div className="add-ck">
        <input className="inp" placeholder={type === 'pre' ? 'New pre-wedding task...' : 'New day-of task...'} style={{ flex: 1 }} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
        <input className="inp" placeholder="Assigned to" style={{ width: 110 }} value={who} onChange={e => setWho(e.target.value)} />
        <button className="btn btn-p btn-sm" onClick={addTask}><i className="ti ti-plus" /> Add</button>
      </div>
    </div>
  );
}

export default function Checklist({ weddingId, refreshKey, onRefresh }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!weddingId) { setTasks([]); return; }
    db.tasks.where('weddingId').equals(weddingId).toArray().then(setTasks);
  }, [weddingId, refreshKey]);

  const pre = tasks.filter(t => t.type === 'pre');
  const day = tasks.filter(t => t.type === 'day');

  return (
    <div className="page">
      <div className="g2">
        <TaskList tasks={pre} type="pre" weddingId={weddingId} onRefresh={onRefresh} />
        <TaskList tasks={day} type="day" weddingId={weddingId} onRefresh={onRefresh} />
      </div>
    </div>
  );
}
