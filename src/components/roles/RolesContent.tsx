//@ts-nocheck
'use client';

import React, { memo, useMemo, useRef,useState } from 'react';
import {
  AllCommunityModule,
  type ColDef,
  type GridOptions,
  type ICellRendererParams,
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
import { CheckCircle2, Loader2, Plus, XCircle } from 'lucide-react';

import type { Role} from '@/features/rbac/types';
import { Toolbar } from '@/components/ui/Toolbar';
import { useCreateRole, useDeleteRole,useUpdateRole } from '@/features/rbac/api/mutations';
import { usePermissions,useRoles } from '@/features/rbac/api/queries';
import { RoleStatus } from '@/features/rbac/types';
import { useThemeStore } from '@/store';

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

// ---------------------------------------------------------------------------
// Role Form Modal
// ---------------------------------------------------------------------------

interface RoleModalProps {
  mode: 'create' | 'edit';
  initialRole?: Role | null;
  onClose: () => void;
}

function RoleModal({ mode, initialRole, onClose }: RoleModalProps) {
  const { data: permissions } = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [name, setName] = useState(initialRole?.name ?? '');
  // const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RoleStatus>(
    initialRole?.status ?? RoleStatus.ACTIVE,
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    initialRole?.permissionKeys ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = createRole.isPending || updateRole.isPending;

  const togglePermission = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key],
    );
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }

    try {
      if (mode === 'create') {
        await createRole.mutateAsync({
          name: name.trim(),
          // description: description.trim() || undefined,
          permissions: selectedKeys,
          status,
        });
      } else {
        await updateRole.mutateAsync({
          id: initialRole!.id,
          data: {
            name: name.trim(),
            // description: description.trim() || undefined,
            permissions: selectedKeys,
            status,
          },
        });
      }

      onClose();
    } catch (err: any) {
      setError(
        err?.message ?? 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div
        className="
          flex w-full max-w-lg flex-col
          overflow-hidden rounded-xl border border-border bg-background shadow-2xl
          sm:rounded-2xl
          max-h-[calc(100dvh-1.5rem)]
          sm:max-h-[calc(100dvh-2rem)]
        "
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text sm:text-lg">
              {mode === 'create' ? 'Create Role' : 'Edit Role'}
            </h2>

            <p className="mt-0.5 text-xs text-text-light sm:text-sm">
              {mode === 'create'
                ? 'Create a new role and assign permissions.'
                : 'Update role details and permissions.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="
              shrink-0 rounded-lg px-2 py-1
              text-xl leading-none text-text-light
              hover:bg-surface
              disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 p-4 sm:p-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Role Name <span className="text-rose-500">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tender Reviewer"
                className="
                  h-10 w-full rounded-lg border border-border
                  bg-background px-3 text-sm
                  outline-none focus:border-primary
                "
              />
            </div>

            {/* Description */}
            {/* <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="
                  w-full resize-none rounded-lg border border-border
                  bg-background px-3 py-2 text-sm
                  outline-none focus:border-primary
                "
              />
            </div> */}

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as RoleStatus)
                }
                className="
                  h-10 w-full rounded-lg border border-border
                  bg-background px-3 text-sm
                  outline-none focus:border-primary
                "
              >
                <option value={RoleStatus.ACTIVE}>Active</option>
                <option value={RoleStatus.DISABLED}>Disabled</option>
              </select>
            </div>

            {/* Permissions */}
            {permissions && permissions.length > 0 && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Permissions{' '}
                  <span className="font-normal text-text-light">
                    ({selectedKeys.length} selected)
                  </span>
                </label>

                <div
                  className="
                    overflow-y-auto rounded-lg border border-border
                    bg-surface p-2
                    max-h-40
                    sm:max-h-52
                  "
                >
                  {permissions.map((perm: any) => (
                    <label
                      key={perm.key}
                      className="
                        flex cursor-pointer items-start gap-2.5
                        rounded-md px-2 py-2
                        hover:bg-background
                      "
                    >
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-text">
                          {perm.name}
                        </p>

                        <p className="break-all font-mono text-[10px] text-text-light">
                          {perm.key}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p
                className="
                  rounded-lg border border-rose-500/20
                  bg-rose-500/10 px-3 py-2
                  text-xs text-rose-600
                  dark:text-rose-400
                "
              >
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex shrink-0 flex-col-reverse gap-2
            border-t border-border px-4 py-3
            sm:flex-row sm:justify-end sm:px-6 sm:py-4
          "
        >
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="
              w-full rounded-lg border border-border
              px-4 py-2 text-sm font-medium text-text
              hover:bg-surface
              disabled:cursor-not-allowed disabled:opacity-40
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="
              inline-flex w-full items-center justify-center gap-2
              rounded-lg bg-primary px-4 py-2
              text-sm font-medium text-white
              hover:bg-primary/90
              disabled:cursor-not-allowed disabled:opacity-40
              sm:w-auto
            "
          >
            {isSubmitting && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}

            {mode === 'create' ? 'Create Role' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Modal
// ---------------------------------------------------------------------------

interface ConfirmModalProps {
  message: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  message,
  confirmLabel,
  confirmVariant = 'danger',
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const variantClass =
    confirmVariant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : 'bg-primary hover:bg-primary/90 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <p className="text-sm text-text">{message}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
              'disabled:cursor-not-allowed disabled:opacity-40',
              variantClass,
            ].join(' ')}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RolesContent() {
  const gridRef = useRef<any>(null);
  const themeMode = useThemeStore((state) => state.theme);
  const themeClass = themeMode === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';

  const { data: roles, isLoading } = useRoles();

  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Modal state
  const [modal, setModal] = useState<
    | { type: 'create' }
    | { type: 'edit'; role: Role }
    | { type: 'toggle'; role: Role }
    | { type: 'delete'; role: Role }
    | null
  >(null);

  // Per-row loading: tracks which row is mid-request
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleToggleConfirm = async () => {
    if (modal?.type !== 'toggle') return;
    const {role} = modal;
    const nextStatus = role.status === RoleStatus.ACTIVE ? RoleStatus.DISABLED : RoleStatus.ACTIVE;

    setLoadingId(role.id);
    try {
      await updateRole.mutateAsync({
        id: role.id,
        data: { name: role.name, permissions: role.permissionKeys ?? [], status: nextStatus },
      });
    } catch {
      // errors surfaced via React Query; no-op here
    } finally {
      setLoadingId(null);
      setModal(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (modal?.type !== 'delete') return;
    const {role} = modal;

    setLoadingId(role.id);
    try {
      await deleteRole.mutateAsync(role.id);
    } catch {
      // errors surfaced via React Query
    } finally {
      setLoadingId(null);
      setModal(null);
    }
  };

  // -------------------------------------------------------------------------
  // Column Definitions
  // -------------------------------------------------------------------------

  const columnDefs = useMemo<ColDef<Role>[]>(
    () => [
      /*
       * Role
       */
      {
        field: 'name',
        headerName: 'Role',
        minWidth: 240,
        flex: 1.5,

        cellRenderer: (params: ICellRendererParams<Role>) => {
          if (!params.data) return null;
          return (
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-sm font-semibold text-text">{params.data.name}</span>
              <span className="mt-0.5 font-mono text-[11px] text-text-light">{params.data.key}</span>
            </div>
          );
        },
      },

      /*
       * Status
       */
      {
        field: 'status',
        headerName: 'Status',
        width: 140,

        cellRenderer: (params: ICellRendererParams<Role>) => {
          if (!params.data) return null;
          const isActive = params.data.status === RoleStatus.ACTIVE;
          return (
            <span
              className={[
                'inline-flex items-center gap-1.5',
                'rounded-full border',
                'px-2.5 py-0.5',
                'text-xs font-medium',
                isActive
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
              ].join(' ')}
            >
              <span
                className={[
                  'h-1.5 w-1.5 rounded-full',
                  isActive ? 'bg-emerald-500' : 'bg-rose-500',
                ].join(' ')}
              />
              {isActive ? 'Active' : 'Disabled'}
            </span>
          );
        },
      },

      /*
       * Users
       */
      {
        field: 'userCount',
        headerName: 'Users',
        width: 100,
        type: 'numericColumn',

        cellRenderer: (params: ICellRendererParams<Role>) => {
          if (!params.data) return null;
          return <span className="text-sm text-text">{params.data.userCount ?? 0}</span>;
        },
      },

      /*
       * Permissions
       */
      {
        headerName: 'Permissions',
        width: 130,
        sortable: false,
        filter: false,

        valueGetter: (params) => params.data?.permissionKeys?.length ?? 0,

        cellRenderer: (params: ICellRendererParams<Role>) => {
          if (!params.data) return null;
          const count = params.data.permissionKeys?.length ?? 0;
          return <span className="text-sm text-text">{count}</span>;
        },
      },

      /*
       * Type
       */
      {
        field: 'isSystemRole',
        headerName: 'Type',
        width: 130,

        cellRenderer: (params: ICellRendererParams<Role>) => {
          if (!params.data) return null;
          if (params.data.isSystemRole) {
            return (
              <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                System
              </span>
            );
          }
          return (
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text-light">
              Custom
            </span>
          );
        },
      },

      /*
       * Actions
       */
      {
        headerName: 'Actions',
        width: 260,
        sortable: false,
        filter: false,

        cellRenderer: (params: ICellRendererParams<Role>) => {
          if (!params.data) return null;
          const role = params.data;
          if(role.isSystemRole) return null;

          const isActive = role.status === RoleStatus.ACTIVE;
          const isRowLoading = loadingId === role.id;

          if (isRowLoading) {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-light">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading...
              </span>
            );
          }

          return (
            <div className="flex items-center gap-2">
              {/* Edit */}
              <button
                type="button"
                disabled={!!loadingId}
                onClick={() => setModal({ type: 'edit', role })}
                className={[
                  'rounded-lg border',
                  'border-border',
                  'px-2.5 py-1',
                  'text-xs font-medium text-text',
                  'transition-colors',
                  'hover:bg-surface',
                  'disabled:cursor-not-allowed',
                  'disabled:opacity-40',
                ].join(' ')}
              >
                Edit
              </button>

              {/* Activate / Disable */}
              <button
                type="button"
                disabled={!!loadingId}
                onClick={() => setModal({ type: 'toggle', role })}
                className={[
                  'inline-flex items-center gap-1.5',
                  'rounded-lg border',
                  'px-2.5 py-1',
                  'text-xs font-medium',
                  'transition-colors',
                  'disabled:cursor-not-allowed',
                  'disabled:opacity-40',
                  isActive
                    ? 'border-rose-500/20 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400'
                    : 'border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400',
                ].join(' ')}
              >
                {isActive ? (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Disable
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Activate
                  </>
                )}
              </button>

              {/* Delete */}
              {/* <button
                type="button"
                disabled={role.isSystemRole || !!loadingId}
                title={role.isSystemRole ? 'System roles cannot be deleted' : 'Delete role'}
                onClick={() => setModal({ type: 'delete', role })}
                className={[
                  'rounded-lg border',
                  'px-2.5 py-1',
                  'text-xs font-medium',
                  'transition-colors',
                  role.isSystemRole
                    ? 'cursor-not-allowed border-border text-text-light/40'
                    : 'border-rose-500/20 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400',
                  'disabled:cursor-not-allowed',
                ].join(' ')}
              >
                Delete
              </button> */}
            </div>
          );
        },
      },
    ],
    [loadingId],
  );

  const defaultColDef = useMemo<ColDef<Role>>(
    () => ({
      flex: 1,
      minWidth: 120,
      filter: true,
      sortable: true,
      resizable: true,
    }),
    [],
  );

  const sideBar = useMemo<SideBarDef>(
    () => ({
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
    }),
    [],
  );

  const staticGridOptions = useMemo<GridOptions>(
    () => ({
      animateRows: true,
    }),
    [],
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="relative flex h-[calc(100vh-220px)] min-h-[600px] w-full flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[280px] flex-1">
            <Toolbar gridRef={gridRef} />
          </div>

          <button
            type="button"
            onClick={() => setModal({ type: 'create' })}
            className={[
              'inline-flex items-center gap-2',
              'rounded-lg',
              'bg-primary',
              'px-4 py-2',
              'text-sm font-medium text-white',
              'transition-colors',
              'hover:bg-primary/90',
            ].join(' ')}
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>

        {/* Table */}
        <section className="mt-2 flex flex-1 overflow-hidden">
          <div
            id="myGrid"
            className={[
              'h-full flex-1 overflow-hidden',
              'rounded-[20px]',
              'border border-slate-900/10',
              'bg-white/70',
              'shadow-[0_18px_40px_rgba(15,23,42,0.08)]',
              themeClass,
            ].join(' ')}
          >
            <AgGridReactMemo
              theme={themeQuartz}
              ref={gridRef}
              loading={isLoading}
              rowData={roles ?? []}
              columnDefs={columnDefs}
              suppressCellFocus
              animateRows={false}
              defaultColDef={defaultColDef}
              sideBar={sideBar}
              gridOptions={staticGridOptions}
              pagination
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
            />
          </div>
        </section>
      </div>

      {/* Create / Edit Modal */}
      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <RoleModal
          mode={modal.type}
          initialRole={modal.type === 'edit' ? modal.role : null}
          onClose={() => setModal(null)}
        />
      )}

      {/* Toggle Status Confirm */}
      {modal?.type === 'toggle' && (
        <ConfirmModal
          message={
            modal.role.status === RoleStatus.ACTIVE
              ? `Are you sure you want to disable the "${modal.role.name}" role? Users assigned this role will lose its permissions.`
              : `Are you sure you want to activate the "${modal.role.name}" role?`
          }
          confirmLabel={modal.role.status === RoleStatus.ACTIVE ? 'Disable' : 'Activate'}
          confirmVariant={modal.role.status === RoleStatus.ACTIVE ? 'danger' : 'primary'}
          isLoading={!!loadingId}
          onConfirm={handleToggleConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Delete Confirm */}
      {modal?.type === 'delete' && (
        <ConfirmModal
          message={`Are you sure you want to delete the "${modal.role.name}" role? This action cannot be undone.`}
          confirmLabel="Delete Role"
          confirmVariant="danger"
          isLoading={!!loadingId}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
