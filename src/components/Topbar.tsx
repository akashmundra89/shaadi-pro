import { useToast } from '../context/ToastContext';

interface Props {
  title: string;
  subtitle: string;
  onMenuToggle: () => void;
}

export default function Topbar({ title, subtitle, onMenuToggle }: Props) {
  const { toast } = useToast();

  function exportSummary() {
    toast('PDF export: Open browser print dialog (Ctrl+P / Cmd+P)');
    window.print();
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {/* Hamburger for mobile */}
        <button className="hamburger" onClick={onMenuToggle} title="Open menu">
          <i className="ti ti-menu-2" />
        </button>
        <div style={{ minWidth: 0 }}>
          <div className="tb-t">{title}</div>
          <div className="tb-s" dangerouslySetInnerHTML={{ __html: subtitle }} />
        </div>
      </div>
      <div className="tb-r">
        <button className="btn btn-sm" onClick={() => toast('Share link copied!')}>
          <i className="ti ti-share" /> Share
        </button>
        <button className="btn btn-sm" onClick={exportSummary}>
          <i className="ti ti-file-export" /> Export PDF
        </button>
      </div>
    </div>
  );
}
