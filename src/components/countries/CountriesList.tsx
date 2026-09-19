import { memo, useMemo, useRef, useState } from 'react';
import {
  AllCommunityModule,
  type ColDef,
  type GridOptions,
  ModuleRegistry,
  type SideBarDef,
  themeQuartz,
} from 'ag-grid-community';
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  MultiFilterModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
  TreeDataModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { CheckCircle2, Globe, Loader2, MapPin, XCircle } from 'lucide-react';

import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Toolbar } from '../ui/Toolbar';

import { useCountriesHierarchy, useUpdateCountryStatus, useUpdateStateStatus } from '@/features/country';
import { useThemeStore } from '@/store';

// Keep your existing imports

type EntityType = 'country' | 'state';

interface GeographyRow {
  id: string;
  entityId: string;
  entityType: EntityType;
  name: string;
  code: string;
  isActive: boolean;
  countryId?: number;
  path: string[];
}

interface ConfirmState {
  row: any;
  nextActive: boolean;
}

const AgGridReactMemo = memo(AgGridReact);

ModuleRegistry.registerModules([
  AllCommunityModule,
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  MultiFilterModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
  TreeDataModule,
]);


export function CountryList() {
  const gridRef = useRef<any>(null);

  const themeMode = useThemeStore((state) => state.theme);
  const themeClass = themeMode === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
  const { data: countries, isLoading } = useCountriesHierarchy();

  // Per-row loading: stores the row id currently being toggled
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const updateCountryStatus = useUpdateCountryStatus();
  const updateStateStatus = useUpdateStateStatus();

  /*
   * Search country OR state.
   *
   * If a state matches, its country is also retained so
   * the tree does not show an orphaned state.
   */
  const filteredRowData = useMemo<GeographyRow[]>(() => {
    const rows: any[] = [];
    countries?.forEach((country) => {
      rows.push({
        path: [country.name],
        id: String(country.id),
        countryId: country.id,
        name: country.name,
        code: country.code,
        isActive: country.isActive,
        isCountry: true,
        countryName: country.name,
      });
      country.states!.forEach((state) => {
        rows.push({
          path: [country.name, state.name],
          id: String(state.id),
          countryId: country.id,
          stateId: state.id,
          name: state.name,
          code: state.code,
          isActive: state.isActive,
          isCountry: false,
          countryName: country.name,
          stateName: state.name,
        });
      });
    });
    return rows;
  }, [countries]);

  const handleToggleClick = (row: any) => {
    const nextActive = !row.isActive;
    setConfirmState({ row, nextActive });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;

    const { row, nextActive } = confirmState;
    setConfirmState(null);
    setLoadingId(row.id);

    try {
      if (row.isCountry) {
        await updateCountryStatus.mutateAsync({
          countryId: String(row.countryId),
          input: { isActive: nextActive },
        });
      } else {
        await updateStateStatus.mutateAsync({
          stateId: String(row.stateId),
          input: { isActive: nextActive },
        });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = () => {
    setConfirmState(null);
  };

  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      headerName: 'Geography',
      minWidth: 260,
      flex: 1.5,
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params: any) => {
          if (!params.data) return params.value;
          const { isCountry } = params.data;
          return (
            <span className="inline-flex items-center gap-2 text-xs">
              {isCountry ? (
                <Globe className="w-4 h-4 text-text-light shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-text-light/70 shrink-0" />
              )}
              <span className={isCountry ? 'font-semibold text-text' : 'font-normal text-text'}>
                {params.data.name}
              </span>
            </span>
          );
        },
      },
    };
  }, []);

  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      {
        field: 'code',
        headerName: 'Code',
        width: 100,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          return (
            <span className="font-mono text-xs font-semibold text-text bg-surface px-2 py-0.5 rounded-md border border-border">
              {params.data.code}
            </span>
          );
        },
      },
      {
        field: 'isActive',
        headerName: 'Status',
        width: 130,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          const { isActive } = params.data;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        headerName: 'Actions',
        width: 150,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          const { isActive, id } = params.data;
          const isRowLoading = loadingId === id;

          if (isRowLoading) {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-light">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading...
              </span>
            );
          }

          // Active row → Deactivate button (XCircle)
          // Inactive row → Activate button (CheckCircle2)
          return isActive ? (
            <button
              disabled={!!loadingId}
              onClick={() => handleToggleClick(params.data)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <XCircle className="w-3.5 h-3.5" />
              Deactivate
            </button>
          ) : (
            <button
              disabled={!!loadingId}
              onClick={() => handleToggleClick(params.data)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Activate
            </button>
          );
        },
      },
    ];
   
  }, [loadingId]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 120,
      filter: true,
      sortable: true,
      resizable: true,
    };
  }, []);
  const sideBar = useMemo<SideBarDef>(() => {
    return {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        },
      ],
    };
  }, []);
  const staticGridOptions = useMemo<GridOptions>(() => {
    return {
      animateRows: true,
    };
  }, []);

  const getDataPath = useMemo(() => {
    return (data: any) => data.path;
  }, []);

  const isDeactivating = confirmState ? !confirmState.nextActive : false;

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <Modal
        open={!!confirmState}
        title={isDeactivating ? 'Confirm Deactivation' : 'Confirm Activation'}
        onClose={handleCancel}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant={isDeactivating ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirm}
            >
              {isDeactivating ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-light">
          {confirmState && (
            <>
              Are you sure you want to{' '}
              <span className="font-semibold text-text">
                {isDeactivating ? 'deactivate' : 'activate'}
              </span>{' '}
              <span className="font-semibold text-text">{confirmState.row.name}</span>?
              {confirmState.row.isCountry && isDeactivating && (
                <>
                  <br />
                  <br />
                  <span className="text-rose-500">
                    This will also deactivate all states associated with this country.
                  </span>
                </>
              )}
            </>
          )}
        </p>
      </Modal>

      <div className="relative flex flex-col w-full min-h-[600px] h-[calc(100vh-220px)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px]">
            <Toolbar gridRef={gridRef} />
          </div>
        </div>

        {/* Table Area */}
        <section className="flex flex-1 overflow-hidden mt-2">
          <div
            id="myGrid"
            className={`flex-1 overflow-hidden h-full rounded-[20px] border border-slate-900/10 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${themeClass}`}
          >
            <AgGridReactMemo
              theme={themeQuartz}
              ref={gridRef}
              loading={isLoading}
              rowData={filteredRowData}
              columnDefs={columnDefs}
              autoGroupColumnDef={autoGroupColumnDef as any}
              getDataPath={getDataPath}
              suppressCellFocus
              animateRows={false}
              defaultColDef={defaultColDef}
              sideBar={sideBar}
              gridOptions={staticGridOptions}
              // getContextMenuItems={getContextMenuItems}
              treeData={true}
              groupDefaultExpanded={-1}
              pagination
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
