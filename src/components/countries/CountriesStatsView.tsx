// 'use client';

// import {
//   CheckCircle2,
//   Clock,
//  FileCheck2,
//   Globe,
//   MapPinned,
//   XCircle,
// } from 'lucide-react';

// import type { LucideIcon } from 'lucide-react';
// import { useOperationalStats } from '@/features/country';

// interface StatCardProps {
//   title: string;
//   value?: number | undefined;
//   loading: boolean;
//   icon: LucideIcon;
//   color: string;
// }

// function StatCard({ title, value, loading, icon: Icon, color }: StatCardProps) {
//   return (
//     <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow hover:shadow-md">
//       <div className="flex items-center justify-between">
//         <span className="text-xs font-semibold text-text-light">{title}</span>

//         <div className={`rounded-xl p-2 ${color}`}>
//           <Icon size={16} />
//         </div>
//       </div>

//       <div className="mt-3">
//         {loading ? (
//           <div className="h-8 w-16 animate-pulse rounded-md bg-border" />
//         ) : (
//           <h3 className="text-3xl font-bold tracking-tight text-text">
//             {value ?? 0}
//           </h3>
//         )}
//       </div>
//     </div>
//   );
// }

// export const CountriesStatsView = () => {
//   const { data: stats, isLoading } = useOperationalStats();

//   const cards = [
//     {
//       key: 'countries-total',
//       title: 'Total Countries',
//       value: stats?.totalCountries,
//       icon: Globe,
//       color: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20',
//     },
//     {
//       key: 'countries-active',
//       title: 'Active Countries',
//       value: stats?.activeCountries,
//       icon: CheckCircle2,
//       color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20',
//     },
//     {
//       key: 'countries-disabled',
//       title: 'Disabled Countries',
//       value: stats?.disabledCountries,
//       icon: XCircle,
//       color: 'bg-rose-50 text-rose-500 dark:bg-rose-950/20',
//     },
//     {
//       key: 'states-total',
//       title: 'Total States',
//       value: stats?.totalStates,
//       icon: MapPinned,
//       color: 'bg-sky-50 text-sky-500 dark:bg-sky-950/20',
//     },
//     {
//       key: 'states-active',
//       title: 'Active States',
//       value: stats?.activeStates,
//       icon: CheckCircle2,
//       color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20',
//     },
//     {
//       key: 'states-disabled',
//       title: 'Disabled States',
//       value: stats?.disabledStates,
//       icon: XCircle,
//       color: 'bg-rose-50 text-rose-500 dark:bg-rose-950/20',
//     },
//     {
//       key: 'requests-open',
//       title: 'Open Requests',
//       value: stats?.openChangeRequests,
//       icon: FileCheck2,
//       color: 'bg-amber-50 text-amber-500 dark:bg-amber-950/20',
//     },
//     {
//       key: 'requests-pending',
//       title: 'Pending Requests',
//       value: stats?.pendingRequests,
//       icon: Clock,
//       color: 'bg-orange-50 text-orange-500 dark:bg-orange-950/20',
//     },
//     {
//       key: 'requests-approved',
//       title: 'Approved Requests',
//       value: stats?.approvedRequests,
//       icon: CheckCircle2,
//       color: 'bg-green-50 text-green-500 dark:bg-green-950/20',
//     },
//     {
//       key: 'requests-rejected',
//       title: 'Rejected Requests',
//       value: stats?.rejectedRequests,
//       icon: XCircle,
//       color: 'bg-red-50 text-red-500 dark:bg-red-950/20',
//     },
//     {
//       key: 'assigned',
//       title: 'My Pending Reviews',
//       value: stats?.myPendingAssignments,
//       icon: Clock,
//       color: 'bg-purple-50 text-purple-500 dark:bg-purple-950/20',
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
//       {cards.map((card) => (
//         <StatCard
//           key={card.key}
//           title={card.title}
//           value={card.value}
//           loading={isLoading}
//           icon={card.icon}
//           color={card.color}
//         />
//       ))}
//     </div>
//   );
// };
