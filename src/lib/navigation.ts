import {
  HomeIcon,
  CalendarIcon,
  PlayIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  UserGroupIcon,
  UserIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  ListBulletIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  expandable?: boolean;
  subItems?: NavigationSubItem[];
  badge?: string;
}

export interface NavigationSubItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const navigationConfig: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    id: 'classes',
    title: 'Classes',
    href: '/classes',
    icon: CalendarIcon,
    expandable: true,
    badge: '8',
    subItems: [
      { title: 'Calendar', href: '/classes/calendar', icon: CalendarDaysIcon },
      { title: 'Class', href: '/classes/list', icon: ListBulletIcon },
      // { title: 'Events', href: '/classes/events', icon: MegaphoneIcon },
      { title: 'Programs', href: '/classes/programs', icon: BookOpenIcon },
      { title: 'Settings', href: '/classes/settings', icon: Cog6ToothIcon },
    ],
  },
  {
    id: 'perform',
    title: 'Perform',
    href: '/perform',
    icon: PlayIcon,
    expandable: true,
    subItems: [
      { title: 'Workouts', href: '/perform/workouts', icon: PlayIcon },
      { title: 'Library', href: '/perform/library', icon: BookOpenIcon },
      { title: 'Settings', href: '/perform/settings', icon: Cog6ToothIcon },
    ],
  },
  {
    id: 'people',
    title: 'People',
    href: '/people',
    icon: UsersIcon,
    expandable: true,
    badge: '156',
    subItems: [
      { title: 'Clients', href: '/people/clients', icon: UserGroupIcon },
      { title: 'Employees', href: '/people/employees', icon: AcademicCapIcon },
      { title: 'Tours', href: '/people/tours', icon: UserIcon },
      { title: 'Settings', href: '/people/settings', icon: Cog6ToothIcon },
    ],
  },
  {
    id: 'financial',
    title: 'Financial',
    href: '/financial',
    icon: CreditCardIcon,
    expandable: true,
    subItems: [
      { title: 'Invoices', href: '/financial/invoices', icon: DocumentTextIcon },
      { title: 'Transactions', href: '/financial/transactions', icon: BanknotesIcon },
      { title: 'Payroll', href: '/financial/payroll', icon: CurrencyDollarIcon },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    expandable: true,
    subItems: [
      { title: 'Insights', href: '/analytics/insights', icon: ChartPieIcon },
      { title: 'Reports', href: '/analytics/reports', icon: DocumentChartBarIcon },
    ],
  },
];

export const getNavigationItem = (id: string): NavigationItem | undefined => {
  return navigationConfig.find(item => item.id === id);
};

export const getNavigationItemByPath = (pathname: string): NavigationItem | undefined => {
  return navigationConfig.find(item => {
    if (item.href === pathname) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => subItem.href === pathname);
    }
    return false;
  });
};

export const getSubNavigationItem = (pathname: string): NavigationSubItem | undefined => {
  const navigationItem = getNavigationItemByPath(pathname);
  if (navigationItem?.subItems) {
    return navigationItem.subItems.find(subItem => subItem.href === pathname);
  }
  return undefined;
};
