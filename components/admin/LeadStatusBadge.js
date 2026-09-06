import { LEAD_PRIORITY_LABELS, LEAD_STATUS_LABELS } from '@/lib/lead-constants';

export default function LeadStatusBadge({ status }) {
  return (
    <span className={`admin-badge status-${status.toLowerCase()}`}>
      {LEAD_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function LeadPriorityBadge({ priority }) {
  return (
    <span className={`admin-badge priority-${priority.toLowerCase()}`}>
      {LEAD_PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}
