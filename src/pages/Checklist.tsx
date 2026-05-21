import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import { useToast } from '../context/ToastContext';
import type { Task } from '../types';

interface Props {
  weddingId: number | null;
  refreshKey: number;
  onRefresh: () => void;
}

interface InlineEdit {
  id: number;
  label: string;
  who: string;
}

function TaskList({ tasks, type, weddingId, onRefresh }: {
  tasks: Task[]; type: 'pre' | 'day'; weddingId: number | null; onRefresh: () => void;
}) {
  const [inp, setInp] = useState('');
  const [who, setWho] = useState('');
  const [editing, setEditing] = useState<InlineEdit | null>(null);
  const { toast } = useToast();

  async function toggle(id: number) {
    const t = tasks.find(x => x.id === id);
    if (t) { await api.updateTask(id, { done: !t.done }); onRefresh(); }
  }

  async function deleteTask(id: number) {
    await api.deleteTask(id); onRefresh();
  }

  async function addTask() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const label = inp.trim();
    if (!label) return;
    await api.addTask({ weddingId, type, label, who: who.trim(), done: false });
    setInp(''); setWho('');
    onRefresh();
    toast('✓ Task added');
  }

  function startEdit(t: Task) {
    setEditing({ id: t.id!, label: t.label, who: t.who || '' });
  }

  function cancelEdit() { setEditing(null); }

  async function saveEdit() {
    if (!editing) return;
    const label = editing.label.trim();
    if (!label) { toast('Enter task label'); return; }
    await api.updateTask(editing.id, { label, who: editing.who.trim() });
    setEditing(null);
    onRefresh();
    toast('✓ Task updated');
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
        editing?.id === t.id ? (
          <div className="ck" key={t.id} style={{ gap: 6 }}>
            <div className={`ck-box ${t.done ? 'done' : ''}`}>{t.done ? '✓' : ''}</div>
            <input
              className="inp"
              value={editing?.label ?? ''}
              onChange={e => setEditing(prev => prev ? { ...prev, label: e.target.value } : prev)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
              style={{ flex: 1, padding: '3px 7px', fontSize: 12 }}
              autoFocus
            />
            <input
              className="inp"
              value={editing?.who ?? ''}
              onChange={e => setEditing(prev => prev ? { ...prev, who: e.target.value } : prev)}
              placeholder="Assigned to"
              style={{ width: 100, padding: '3px 7px', fontSize: 12 }}
            />
            <button className="btn btn-t btn-sm" onClick={saveEdit} style={{ padding: '3px 7px' }}>
              <i className="ti ti-check" />
            </button>
            <button className="btn btn-sm" onClick={cancelEdit} style={{ padding: '3px 7px' }}>
              <i className="ti ti-x" />
            </button>
          </div>
        ) : (
          <div className="ck" key={t.id}>
            <div className={`ck-box ${t.done ? 'done' : ''}`} onClick={() => t.id && toggle(t.id)}>{t.done ? '✓' : ''}</div>
            <span className={`ck-lbl ${t.done ? 'done' : ''}`}>{t.label}</span>
            <span className="ck-who">{t.who}</span>
            <button
              className="btn btn-sm"
              onClick={() => t.id && startEdit(t)}
              title="Edit"
              style={{ color: 'var(--muted)', fontSize: 13, padding: '2px 5px', border: 'none' }}
            >
              <i className="ti ti-pencil" />
            </button>
            <button className="ck-del" onClick={() => t.id && deleteTask(t.id)} title="Delete">
              <i className="ti ti-x" />
            </button>
          </div>
        )
      ))}

      <div className="add-ck">
        <input
          className="inp"
          placeholder={type === 'pre' ? 'New pre-wedding task...' : 'New day-of task...'}
          style={{ flex: 1 }}
          value={inp}
          onChange={e => setInp(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <input
          className="inp"
          placeholder="Assigned to"
          style={{ width: 110 }}
          value={who}
          onChange={e => setWho(e.target.value)}
        />
        <button className="btn btn-p btn-sm" onClick={addTask}><i className="ti ti-plus" /> Add</button>
      </div>
    </div>
  );
}

export default function Checklist({ weddingId, refreshKey, onRefresh }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!weddingId) { setTasks([]); return; }
    api.getTasks(weddingId).then(setTasks);
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
