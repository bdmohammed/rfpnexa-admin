//@ts-nocheck
'use client';

import { memo, useMemo, useRef, useState } from 'react';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { AllCommunityModule, type ColDef, themeQuartz } from 'ag-grid-community';
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  IntegratedChartsModule,
  MasterDetailModule,
  MultiFilterModule,
  PivotModule,
  RichSelectModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  RowNumbersModule,
  SetFilterModule,
  SideBarModule,
  SparklinesModule,
  StatusBarModule,
  TreeDataModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import dayjs from 'dayjs';
import { Edit, Loader2, Plus, X } from 'lucide-react';

import { Toolbar } from '@/components/ui/Toolbar';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/features/categories';
import { useThemeStore } from '@/store/theme.store';

const CommunityModule = [
  AllCommunityModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
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
  TreeDataModule,
  PivotModule,
  RowNumbersModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  SparklinesModule.with(AgChartsEnterpriseModule),
];

const AgGridReactMemo = memo(AgGridReact);

interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
}

interface CategoryModalProps {
  mode: 'create' | 'edit';
  category?: Category | null;
  onClose: () => void;
}

function CategoryModal({ mode, category, onClose }: CategoryModalProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [code, setCode] = useState(category?.code ?? '');
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = async () => {
    setError(null);

    if (!code.trim()) {
      setError('Category code is required.');
      return;
    }

    if (!/^\d{3}$/.test(code.trim())) {
      setError('Category code must be exactly 3 digits.');
      return;
    }

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      if (mode === 'create') {
        await createCategory.mutateAsync({
          code: code.trim(),
          name: name.trim(),
          description: description.trim() || null,
          isActive,
        });
      } else {
        await updateCategory.mutateAsync({
          id: category!.id,
          input: {
            code: code.trim(),
            name: name.trim(),
            description: description.trim() || null,
            isActive,
          },
        });
      }

      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-text sm:text-lg">
              {mode === 'create' ? 'Create Category' : 'Edit Category'}
            </h2>

            <p className="mt-0.5 text-xs text-text-light sm:text-sm">
              {mode === 'create' ? 'Create a new category.' : 'Update category details.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-text-light hover:bg-surface disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 p-4 sm:p-6">
            {/* Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Code <span className="text-rose-500">*</span>
              </label>

              <input
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setCode(value);
                }}
                inputMode="numeric"
                maxLength={3}
                placeholder="3-digit NAICS-style code e.g. '001'..'084'"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm uppercase outline-none focus:border-primary"
              />
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Name <span className="text-rose-500">*</span>
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Construction"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">Description</label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">Status</label>

              <select
                value={isActive ? 'ACTIVE' : 'INACTIVE'}
                onChange={(e) => setIsActive(e.target.value === 'ACTIVE')}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface disabled:opacity-40 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-40 sm:w-auto"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}

            {mode === 'create' ? 'Create Category' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoriesPageContent() {
  const { theme } = useThemeStore();

  const themeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

  const gridRef = useRef<AgGridReact>(null as any);

  const { data: categories, isLoading } = useCategories();
  const [modal, setModal] = useState<{
    mode: 'create' | 'edit';
    category?: Category | null;
  } | null>(null);

  const columnDefs: ColDef<Category>[] = useMemo(
    () => [
      {
        headerName: 'Code',
        field: 'code',
        width: 140,
        cellClass: 'font-mono text-xs font-semibold',
      },
      {
        headerName: 'Name',
        field: 'name',
        minWidth: 220,
        flex: 1,
        cellClass: 'font-medium',
      },
      {
        headerName: 'Slug',
        field: 'slug',
        minWidth: 180,
        flex: 1,
        cellClass: 'font-mono text-xs text-text-light',
      },
      {
        headerName: 'Description',
        field: 'description',
        minWidth: 220,
        flex: 1,
        valueFormatter: ({ value }) => value || '—',
      },
      {
        headerName: 'Status',
        field: 'isActive',
        width: 120,
      },
      {
        headerName: 'Updated At',
        field: 'updatedAt',
        width: 180,
        valueFormatter: ({ value }) => (value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '—'),
      },
      {
        headerName: 'Actions',
        width: 90,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <button
            type="button"
            onClick={() =>
              setModal({
                mode: 'edit',
                category: params.data,
              })
            }
            className="rounded-md p-1.5 text-text-light hover:bg-surface hover:text-text"
            title="Edit category"
          >
            <Edit className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <Toolbar gridRef={gridRef} />
            </div>

            <button
              type="button"
              onClick={() =>
                setModal({
                  mode: 'create',
                })
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Category
            </button>
          </div>

          <div
            id="categoriesGrid"
            className={`h-150 w-full overflow-hidden rounded-[20px] border border-border bg-surface shadow-sm ${themeClass}`}
          >
            <AgGridReactMemo
              theme={themeQuartz}
              ref={gridRef}
              rowData={categories ?? [] as any}
              modules={CommunityModule}
              columnDefs={columnDefs as any}
              loading={isLoading}
              pagination
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
            />
          </div>
        </div>
      </div>

      {modal && (
        <CategoryModal mode={modal.mode} category={modal.category} onClose={() => setModal(null)} />
      )}
    </>
  );
}
