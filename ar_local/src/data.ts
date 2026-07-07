// Default data seeds for RBAC updates
import { User, Department, Role, DocCard, Checklist, StaticPage } from './types';

export const defaultDepartments: Department[] = [
  { id: 'dept-1', name: 'IT' },
  { id: 'dept-2', name: 'Finance' },
  { id: 'dept-3', name: 'Economic Development' },
  { id: 'dept-4', name: 'Legal' },
  { id: 'dept-5', name: 'HR' },
  { id: 'dept-6', name: 'Administration' },
  { id: 'dept-7', name: 'Executive' },
];

export const defaultUsers: User[] = [
  { id: 'u-2', username: '2727.Bravo@protonmail.com', name: 'Bravo', role: 'SysAdmin', departmentId: 'dept-7' },
  { id: 'u-3', username: '0101.Romeo@protonmail.com', name: 'Romeo', role: 'President', departmentId: 'dept-7' },
  { id: 'u-4', username: '0202.Oscar@protonmail.com', name: 'Oscar', role: 'IT / service support', departmentId: 'dept-1' },
  { id: 'u-5', username: '0303.Tango@protonmail.com', name: 'Tango', role: 'Treasurer', departmentId: 'dept-2' },
  { id: 'u-6', username: '0404.Sierra@protonmail.com', name: 'Sierra', role: 'Assistant President', departmentId: 'dept-7' },
  { id: 'u-7', username: '0505.Lima@protonmail.com', name: 'Lima', role: 'Secretary', departmentId: 'dept-6' },
  { id: 'u-8', username: '0606.Quebec@protonmail.com', name: 'Quebec', role: 'finance office', departmentId: 'dept-2' },
  { id: 'u-9', username: '1919.alpha@protonmail.ch', name: 'Alpha', role: 'SysAdmin', departmentId: 'dept-1' },
  { id: 'u-10', username: '3434Echo@protonmail.com', name: 'Echo', role: 'SysAdmin', departmentId: 'dept-7' },
];

export const userPasswordHashes: Record<string, string> = {
  '2727.bravo@protonmail.com': '6fe8d217e372dc4a9837add2bc087e4a5809ae73eedef81fd5fd79b0a5b27863',
  '0101.romeo@protonmail.com': 'f9230d7b5d59ba3f644a5f3d3181ddfedeb8fa85c3026a3bdb8146d762d2d6e7',
  '0202.oscar@protonmail.com': 'bb9481f726fc079c2e4e7aadf1a196223a993ba49f0bda7bdb65a491ada35bcf',
  '0303.tango@protonmail.com': '363ea1c0d31773589af89ca1d30a989d519fb1887ff5ee17e705cfd2ae4a09cd',
  '0404.sierra@protonmail.com': '8d3192f7df172af785364bdbafa6ba2b1ea2c909be7ba26ef33ba3c9a23889e4',
  '0505.lima@protonmail.com': '8ebe41a01c47ad2aeafb70f818886505279acb061aced8446c7619e328a533ec',
  '0606.quebec@protonmail.com': 'a8620375c207971c63a315b791445d64d074b1f0ecf06d864dfcfd508d2ee5eb',
  '1919.alpha@protonmail.ch': 'cb7bdb10d7f03ca8bd61c38a9c52f859ce7e7e207a01aaea014ac51799e7be49',
  '3434echo@protonmail.com': 'd712e3caac35b17538eac8cf2d25cf9311704bbe62ee9496daed228c2a392d51'
};


export const defaultPages: StaticPage[] = [
  {
    id: 'minutes',
    title: 'Minutes',
    htmlContent: '<h1>Minutes</h1><p>Minutes from the sessions.</p>',
    needsReview: true,
  },
  {
    id: 'resources',
    title: 'Resources',
    htmlContent: '<h1>Resources & Candidates</h1><p>List of current resources and active candidates.</p>',
    needsReview: false,
  },
];

export const defaultCards: DocCard[] = [
  { id: 'c-1', title: 'Q3 Objectives', content: 'Finalize the budget and approve the new IT infrastructure.', needsReview: false },
  { id: 'c-2', title: 'Compliance Audit', content: 'Ensure all departments meet the new federal compliance standards by August.', needsReview: true },
];

export const defaultChecklists: Checklist[] = [
  {
    id: 'cl-1',
    title: 'Onboarding Process',
    items: [
      { id: 'cli-1', text: 'Create email account', completed: true },
      { id: 'cli-2', text: 'Assign hardware', completed: false },
      { id: 'cli-3', text: 'Provide system access', completed: false },
    ],
  },
];
