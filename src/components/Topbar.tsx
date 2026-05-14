import { useToast } from '../context/ToastContext';

interface Props {
  title: string;
  subtitle: string;
}

export default function Topbar({ title, subtitle }: Props) {
  const { toast } = useToast();

  function exportSummary() {
    toast('PDF export: Open browser print dialog (Ctrl+P / Cmd+P)');
    window.print();
  }

  return (
    <div className="topbar">
      <div>
        <div className="tb-t">{title}</div>
        <div className="tb-s" dangerouslySetInnerHTML={{ __html: subtitle }} />
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
