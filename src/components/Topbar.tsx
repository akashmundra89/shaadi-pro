import React from 'react';
import { useToast } from '../context/ToastContext';

interface Props {
  title: string;
  subtitle: React.ReactNode;
  onMenuToggle: () => void;
  onExportAll?: () => void;
  hasWedding?: boolean;
}

export default function Topbar({ title, subtitle, onMenuToggle, onExportAll, hasWedding }: Props) {
  const { toast } = useToast();

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('✓ Link copied to clipboard');
    } catch {
      toast('Could not copy — please copy the URL manually');
    }
  }

  function exportPdf() {
    toast('PDF export: Open browser print dialog (Ctrl+P / Cmd+P)');
    window.print();
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <button className="hamburger" onClick={onMenuToggle} title="Open menu">
          <i className="ti ti-menu-2" />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="tb-t" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          <div className="tb-s">{subtitle}</div>
        </div>
      </div>
      <div className="tb-r">
        {hasWedding && (
          <button
            className="btn btn-sm"
            onClick={onExportAll}
            title="Download all wedding data as Excel backup"
            style={{ fontWeight: 600, borderColor: 'var(--teal)', color: 'var(--teal)', whiteSpace: 'nowrap' }}
          >
            <i className="ti ti-database-export" /> <span className="tb-btn-label">Backup Excel</span>
          </button>
        )}
        <button className="btn btn-sm btn-hide-mob" onClick={share} title="Share">
          <i className="ti ti-share" /> <span className="tb-btn-label">Share</span>
        </button>
        <button className="btn btn-sm btn-hide-mob" onClick={exportPdf} title="Export PDF">
          <i className="ti ti-file-export" /> <span className="tb-btn-label">PDF</span>
        </button>
      </div>
    </div>
  );
}
