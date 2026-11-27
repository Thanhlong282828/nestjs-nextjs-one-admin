import type { TestDemoManifest } from '../scripts/demo-test-provisioner';

export const manifest: TestDemoManifest = {
  company: { id: '4a000000-0000-4000-8000-000000000001', name: '[TEST] Công ty Ánh Dương' },
  branch: { id: '4a000000-0000-4000-8000-000000000002', name: '[TEST] Chi nhánh Hà Nội' },
  department: { id: '4a000000-0000-4000-8000-000000000003', code: 'TEST-HC', name: '[TEST] Hành chính' },
  employee: { id: '4a000000-0000-4000-8000-000000000004', code: 'TEST-001', fullName: '[TEST] Nguyễn An' },
  attendance: { id: '4a000000-0000-4000-8000-000000000005', workDate: '2026-01-02', status: 'present' },
};
