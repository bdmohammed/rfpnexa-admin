//@ts-nocheck
'use client';

import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import {
  AllCommunityModule,
  type ColDef,
  themeQuartz,
  ColGroupDef,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  SideBarDef,
} from 'ag-grid-community';
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  MasterDetailModule,
  MultiFilterModule,
  NewFiltersToolPanelModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  RowNumbersModule,
  SetFilterModule,
  SideBarModule,
  SparklinesModule,
  StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import dayjs from 'dayjs';

import { Toolbar } from '@/components/ui/Toolbar';
import { useListUsers } from '@/features/auth/api/queries';
import { useThemeStore } from '@/store/theme.store';

interface UserListItem {
  id: string;
  name: string;
  email: string;
  accountType: 'user' | 'admin';
  companyName: string | null;
  country: {
    id: string;
    name: string;
    code: string;
  };
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  requestedRoleId?: string;
  requestedDescription?: string;
  reviewerId?: string;
  submittedById?: string;
  createdAt: string;
  lastLoginAt: string | null;
  roles?: string[];
  subscriptions?: Array<{
    plan: {
      name: string;
    };
  }>;
}

// interface UserStats {
//   total: number;
//   active: number;
//   inactive: number;
//   suspended: number;
//   admins: number;
//   customers: number;
//   pendingVerification: number;
//   pendingApprovalAdmins: number;
//   subscribed: number;
//   blocked: number;
//   onlineNow: number;
//   newToday: number;
//   newThisMonth: number;
// }

const AgGridReactMemo = memo(AgGridReact);

const CountryCellRenderer = (params: ICellRendererParams<UserListItem>) => {
  const u = params.data;
  if (!u) return null;
  const value = u.country.name;
  const { code } = u.country;
  if (value === '' || value === '(Select All)') {
    return <span className="truncate">{value || ''}</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
      <img
        alt={`${value} flag`}
        width={15}
        height={10}
        src={`https://flags.fmcdn.net/data/flags/mini/${code.toLowerCase()}.png`}
      />
      <span className="truncate">{value}</span>
    </span>
  );
};

interface RowItem {
  country: string;
  language: string;
  name: string;
  game: {
    name: string;
    bought: boolean;
  };
  bankBalance: number;
  rating: number;
  totalWinnings: number;
  [month: string]: number | string | boolean | object | undefined;
  [key: `col${number}`]: string | number;
}

// const mobileDefaultCols: ColDef<RowItem>[] = [
//   {
//     rowDrag: true,
//     field: "name",
//     width: 200,
//     cellClass: "v-align",
//   },
//   // {
//   //   field: "language",
//   //   width: 150,
//   //   filter: "agSetColumnFilter",
//   //   cellEditor: "agRichSelectCellEditor",
//   //   cellClass: "v-align",
//   //   cellEditorParams: {
//   //     values: LANGUAGES,
//   //   },
//   // },
//   {
//     field: "country",
//     width: 150,
//     cellRenderer: CountryCellRenderer,
//     cellClass: "v-align",
//     cellEditor: "agRichSelectCellEditor",
//     cellEditorParams: {
//       cellRenderer: CountryCellRenderer,
//       // values: COUNTRY_NAMES,
//     },
//   },
//   {
//     field: "game.name",
//     width: 180,
//     cellEditor: "agRichSelectCellEditor",
//     cellEditorParams: {
//       values: [...games].sort(),
//     },
//     filter: "agSetColumnFilter",
//     cellClass: () => "alphabet",
//   },
//   {
//     field: "bankBalance",
//     width: 180,
//     cellClassRules: {
//       "currency-cell": 'typeof x == "number"',
//     },
//     enableValue: true,
//     cellDataType: "currency",
//     filter: "agNumberColumnFilter",
//   },
//   {
//     field: "totalWinnings",
//     filter: "agNumberColumnFilter",
//     width: 170,
//     enableValue: true,
//     cellClassRules: {
//       "currency-cell": 'typeof x == "number"',
//     },
//     cellStyle: currencyCssFunc,
//     cellDataType: "currency",
//   },
//   ...monthCols,
// ];

// const getApprovalStatus = (user: UserListItem) => {
//   if (user.approvedAt) return 'Approved';
//   if (user.status === 'approved' || user.status === 'APPROVED' || user.status === 'active')
//     return 'Approved';
//   if (user.status === 'pending_approval') return 'Pending';
//   if (user.status === 'pending_review') return 'Pending Review';
//   if (user.status === 'rejected' || user.status === 'rejected_by_admin') return 'Rejected';
//   if (user.status === 'pending_email_verification') return 'Pending Email';
//   return 'Not Required';
// };

// const ApprovedStatusRenderer = (params: ICellRendererParams<UserListItem>) => {
//   const u = params.data;
//   if (!u) return null;
//   const approvalStatus = getApprovalStatus(u);

//   return (
//     <div className="flex items-center h-full">
//       {approvalStatus === 'Approved' && (
//         <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
//           Approved
//         </span>
//       )}
//       {(approvalStatus === 'Pending Approval' || approvalStatus === 'Pending') && (
//         <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
//           Pending Approval
//         </span>
//       )}
//       {approvalStatus === 'Pending Review' && (
//         <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
//           Pending Review
//         </span>
//       )}
//       {approvalStatus === 'Rejected' && (
//         <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Rejected</span>
//       )}
//       {approvalStatus === 'Pending Email' && (
//         <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
//           Pending Email
//         </span>
//       )}
//       {approvalStatus === 'Not Required' && <span className="text-[11px] text-text-light">—</span>}
//     </div>
//   );
// };

// enum UserStatus {
//   PENDING_EMAIL_VERIFICATION = 'pending_email_verification',
//   PENDING_APPROVAL = 'pending_approval',
//   PENDING_REVIEW = 'pending_review',
//   ACTIVE = 'active',
//   REJECTED = 'rejected',
//   SUSPENDED = 'suspended',
//   DEACTIVATED = 'deactivated',
//   ARCHIVED = 'archived',
//   BLOCKED = 'BLOCKED',
//   REJECTED_BY_ADMIN = 'rejected_by_admin',
//   APPROVED = 'APPROVED',
// }

// const STATUS_STYLES: Record<UserStatus, { label: string; className: string }> = {
//   [UserStatus.ACTIVE]: {
//     label: 'Active',
//     className: 'text-emerald-600 dark:text-emerald-400',
//   },
//   [UserStatus.PENDING_EMAIL_VERIFICATION]: {
//     label: 'Pending Email',
//     className: 'text-amber-600 dark:text-amber-400',
//   },
//   [UserStatus.PENDING_APPROVAL]: {
//     label: 'Pending Approval',
//     className: 'text-blue-600 dark:text-blue-400',
//   },
//   [UserStatus.PENDING_REVIEW]: {
//     label: 'Pending Review',
//     className: 'text-purple-600 dark:text-purple-400',
//   },
//   [UserStatus.SUSPENDED]: {
//     label: 'Suspended',
//     className: 'text-orange-600 dark:text-orange-400',
//   },
//   [UserStatus.BLOCKED]: {
//     label: 'Blocked',
//     className: 'text-rose-600 dark:text-rose-400',
//   },
//   [UserStatus.REJECTED]: {
//     label: 'Rejected',
//     className: 'text-rose-600 dark:text-rose-400',
//   },
//   [UserStatus.REJECTED_BY_ADMIN]: {
//     label: 'Rejected',
//     className: 'text-rose-600 dark:text-rose-400',
//   },
//   [UserStatus.DEACTIVATED]: {
//     label: 'Deactivated',
//     className: 'text-slate-600 dark:text-slate-400',
//   },
//   [UserStatus.ARCHIVED]: {
//     label: 'Archived',
//     className: 'text-slate-600 dark:text-slate-400',
//   },
//   [UserStatus.APPROVED]: {
//     label: 'Approved',
//     className: 'text-emerald-600 dark:text-emerald-400',
//   },
// };

// const ActionsRenderer = (params: any) => {
//   const u = params.data;
//   if (!u) return null;
//   const { router } = params;
//   const { handleOpenEdit } = params;
//   const { setImpersonateUser } = params;
//   const { setSelectedUserForActions } = params;

//   return (
//     <div className="flex items-center justify-center gap-1 h-full">
//       <button
//         onClick={() => router.push(`/users/${u.id}`)}
//         title="View Details"
//         className="p-1 text-text-light hover:text-primary transition hover:scale-110 cursor-pointer"
//       >
//         <Eye size={14} />
//       </button>

//       <button
//         onClick={() => handleOpenEdit(u)}
//         title="Edit Details"
//         className="p-1 text-text-light hover:text-primary transition hover:scale-110 cursor-pointer"
//       >
//         <Edit2 size={14} />
//       </button>

//       <button
//         onClick={() => setImpersonateUser(u)}
//         title="Impersonate"
//         className="p-1 text-text-light hover:text-amber-500 transition hover:scale-110 cursor-pointer"
//       >
//         <UserPlus size={14} />
//       </button>

//       <button
//         onClick={() => setSelectedUserForActions(u)}
//         title="More Actions"
//         className="p-1 text-text-light hover:text-text transition hover:scale-110 cursor-pointer font-bold text-[10px] flex items-center justify-center h-5 w-5"
//       >
//         •••
//       </button>
//     </div>
//   );
// };

const modules = [
  AllCommunityModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  NewFiltersToolPanelModule,
  MasterDetailModule,
  ColumnMenuModule,
  ContextMenuModule,
  MultiFilterModule,
  CellSelectionModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
  PivotModule,
  RowNumbersModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  SparklinesModule.with(AgChartsEnterpriseModule),
];

const IS_SSR = typeof window === 'undefined';

// const excelStyles: ExcelStyle[] = [
//   {
//     id: "v-align",
//     alignment: {
//       vertical: "Center",
//     },
//   },
//   {
//     id: "alphabet",
//     alignment: {
//       vertical: "Center",
//     },
//   },
//   {
//     id: "good-score",
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     interior: {
//       color: "#C6EFCE",
//       pattern: "Solid",
//     },
//     numberFormat: {
//       format: "[$$-409]#,##0",
//     },
//   },
//   {
//     id: "bad-score",
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     interior: {
//       color: "#FFC7CE",
//       pattern: "Solid",
//     },
//     numberFormat: {
//       format: "[$$-409]#,##0",
//     },
//   },
//   {
//     id: "header",
//     font: {
//       color: "#44546A",
//       size: 16,
//     },
//     interior: {
//       color: "#F2F2F2",
//       pattern: "Solid",
//     },
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     borders: {
//       borderTop: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//       borderRight: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//       borderBottom: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//       borderLeft: {
//         lineStyle: "Continuous",
//         weight: 0,
//         color: "#8EA9DB",
//       },
//     },
//   },
//   {
//     id: "currency-cell",
//     alignment: {
//       horizontal: "Center",
//       vertical: "Center",
//     },
//     numberFormat: {
//       format: "[$$-409]#,##0",
//     },
//   },
//   {
//     id: "boolean-type",
//     dataType: "Boolean",
//     alignment: {
//       vertical: "Center",
//     },
//   },
//   {
//     id: "country-cell",
//     alignment: {
//       indent: 4,
//     },
//   },
// ];

const staticGridOptions: GridOptions = {
  columnTypes: {
    date: {
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
      valueFormatter: ({ value }) => (value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '—'),
    },
  },
  statusBar: {
    statusPanels: [
      {
        statusPanel: 'agTotalAndFilteredRowCountComponent',
        key: 'totalAndFilter',
        align: 'left',
      },
      { statusPanel: 'agSelectedRowCountComponent', align: 'left' },
      { statusPanel: 'agAggregationComponent', align: 'right' },
    ],
  },
  cellSelection: {
    enableHeaderHighlight: true,
    handle: {
      mode: 'fill',
    },
  },
  rowSelection: {
    mode: 'multiRow',
  },
  initialGroupOrderComparator: ({ nodeA, nodeB }) => {
    const aKey = nodeA.key ?? '';
    const bKey = nodeB.key ?? '';
    if (aKey < bKey) {
      return -1;
    }
    if (aKey > bKey) {
      return 1;
    }
    return 0;
  },
  enableRtl: IS_SSR ? false : /[?&]rtl=true/.test(window.location.search),
  pivotPanelShow: 'always',
  enableCharts: true,
  undoRedoCellEditing: true,
  undoRedoCellEditingLimit: 50,
  rowNumbers: true,
  // excelStyles: excelStyles,
  enableFilterHandlers: true,
  rowDragManaged: true,
  rowDragMultiRow: true,
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100],
  loadingOverlayComponent: () => (
    <div className="ag-overlay-loading-center" role="presentation">
      <div aria-live="polite" aria-atomic="true">
        Generating rows....
      </div>
    </div>
  ),
};

// AG Grid Cell Renderers
export function UsersPageContent() {
  const gridRef = useRef<AgGridReact>(null as any);
  const currentTheme = useThemeStore((state) => state.theme);
  // Top-level main tabs: stats | list

  // Data State
  const { data: userLists, isLoading, refetch } = useListUsers();

  const desktopDefaultCols: (ColDef<RowItem> | ColGroupDef<RowItem>)[] = [
    {
      rowDrag: true,
      field: 'name',
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
    },
    {
      field: 'email',
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
    },
    {
      field: 'country',
      width: 150,
      cellRenderer: CountryCellRenderer,
      cellClass: ['country-cell', 'v-align'],
      enableRowGroup: true,
      enablePivot: true,
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: {
        cellRenderer: CountryCellRenderer,
      },
      filter: 'agSetColumnFilter',
      filterParams: {
        cellRenderer: CountryCellRenderer,
        buttons: ['reset'],
      },
    },
    {
      field: 'accountType',
      headerName: 'Account Type',
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
    },
    {
      field: 'userRoles',
      headerName: 'Role',
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
      valueFormatter: (params) => {
        if (params.data) {
          if (params.data.accountType === 'admin') {
            return params.data.roles;
          }
          return '—';
        }
        return params.value;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      width: 200,
      enableRowGroup: true,
      cellClass: 'v-align',
      type: 'date',
    },
  ];

  // const smallDefaultCols = mobileDefaultCols;
  const largeDefaultCols = desktopDefaultCols;
  // const smallColCount = smallDefaultCols.length;
  // const largeColCount = 22;
  const darkMode = currentTheme === 'dark';
  const themeClass = darkMode ? `ag-theme-quartz-dark` : `ag-theme-quartz`;

  const [isSmall] = useState(() =>
    IS_SSR
      ? false
      : document.documentElement.clientHeight <= 415 || document.documentElement.clientWidth < 768,
  );
  // const loadInstance = useRef(0);
  // const dataIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  // const dataTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  // const dataSizeTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  // const [base64Flags, setBase64Flags] = useState<Record<string, string>>();
  // const [defaultCols, setDefaultCols] = useState<(ColDef | ColGroupDef)[]>();
  // const [defaultColCount, setDefaultColCount] = useState<number>(0);
  // const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>();
  // const [rowData, setRowData] = useState<unknown[]>();
  // const [dataSize, setDataSize] = useState<string>();

  const defaultColDef = useMemo<ColDef>(
    () => ({
      minWidth: 50,
      editable: true,
      filter: true,
      floatingFilter: !isSmall,
      enableCellChangeFlash: true,
    }),
    [isSmall],
  );
  const sideBar = useMemo<SideBarDef>(
    () => ({
      toolPanels: ['columns', 'filters'],
      position: 'right',
      defaultToolPanel: 'columns',
      hiddenByDefault: isSmall,
    }),
    [isSmall],
  );

  const onGridReady = useCallback((event: GridReadyEvent) => {
    if (!IS_SSR && document.documentElement.clientWidth <= 1024) {
      event.api.closeToolPanel();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Conditionally Render Active Main Tab */}
      <div className="animate-fade-in">
        <div className="space-y-6">
          <div className="relative flex h-dvh min-h-[calc(100dvh-var(--layout-grid-header-height))] w-full flex-col">
            <div className="flex items-center justify-between gap-4 pb-2 shrink-0">
              <div className="flex-1 min-w-0">
                <Toolbar gridRef={gridRef} />
              </div>
            </div>

            {/* Table Area */}
            <section className="flex flex-1 overflow-hidden">
              <div
                id="myGrid"
                className={`flex-1 overflow-hidden h-full rounded-[20px] border border-slate-900/10 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${themeClass}`}
              >
                <AgGridReactMemo
                  theme={themeQuartz}
                  ref={gridRef}
                  rowData={userLists}
                  modules={modules}
                  gridOptions={staticGridOptions}
                  columnDefs={largeDefaultCols as any}
                  loading={isLoading}
                  defaultColDef={defaultColDef}
                  sideBar={sideBar}
                  {...(!isSmall && {
                    rowGroupPanelShow: 'always',
                  })}
                  onGridReady={onGridReady}
                  pagination
                  paginationPageSize={20}
                  paginationPageSizeSelector={[10, 20, 50, 100]}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
