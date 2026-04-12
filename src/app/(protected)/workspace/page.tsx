import { redirect } from 'next/navigation';

// Workspace is replaced by module-based routing.
// Legacy URL preserved — redirect to primary module.
export default function WorkspacePage() {
  redirect('/analyze');
}
