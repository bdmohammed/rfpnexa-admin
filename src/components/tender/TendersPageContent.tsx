//@ts-nocheck
'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
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
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import dayjs from 'dayjs';
import { Edit, FileText, Loader2, Plus, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import CategoryDropdown from '../auth/CategoryDropdown';
import CountryDropdown from '../auth/CountryDropdown';
import StateDropdown from '../auth/StateDropDown';
import { Toolbar } from '../ui/Toolbar';

import {
  type CreateTender,
  useCreateTender,
  useTenders,
  useUpdateTender,
} from '@/features/tenders';
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
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 10;

const ALLOWED_FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',

  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',

  zip: 'application/zip',
  tar: 'application/x-tar',
  gz: 'application/gzip',

  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
};

// const validateFile = (file: File): string | null => {
//   const extension = file.name.toLowerCase().split('.').pop();

//   if (!extension || !ALLOWED_FILE_TYPES[extension]) {
//     return `${file.name}: Invalid file type.`;
//   }

//   if (file.type && file.type !== ALLOWED_FILE_TYPES[extension]) {
//     return `${file.name}: Invalid file type.`;
//   }

//   if (file.size > MAX_FILE_SIZE) {
//     return `${file.name}: File size must not exceed 25 MB.`;
//   }

//   return null;
// };

interface Tender {
  id: string;
  referenceNo: string;
  title: string;
  description: string | null;
  eligibility: string | null;
  workPerformance: string | null;
  proposalSubmission: string | null;
  deadline: string;

  countryId: number;
  stateId: number;
  categoryId: string;

  country?: {
    id: number;
    name: string;
    code: string;
  };

  state?: {
    id: number;
    name: string;
    code: string;
  };

  category?: {
    id: string;
    name: string;
    code: string;
  };

  documents?: TenderDocument[];

  createdAt: string;
  updatedAt: string;
}

interface TenderFormValues {
  title: string;
  description: string;
  eligibility: string;
  workPerformance: string;
  proposalSubmission: string;
  deadline: string;
  countryId: string;
  stateId: string;
  categoryId: string;
  documents: File[];
}

interface TenderDocument {
  id: string;
  tenderId: string;
  documentType: string;
  documentS3Key: string;
  documentS3Bucket: string;
  documentOriginalName: string;
  mimeType: string | null;
  fileSize: number | null;
  downloadUrl: string;
}

interface TenderModalProps {
  mode: 'create' | 'edit';
  tender?: Tender | null;
  onClose: () => void;
}
function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const units = ['Bytes', 'KB', 'MB', 'GB'];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function createTenderFormData(body: CreateTender): FormData {
  const formData = new FormData();

  formData.append('title', body.title);

  if (body.description) {
    formData.append('description', body.description);
  }

  if (body.eligibility) {
    formData.append('eligibility', body.eligibility);
  }

  if (body.workPerformance) {
    formData.append('workPerformance', body.workPerformance);
  }

  if (body.proposalSubmission) {
    formData.append('proposalSubmission', body.proposalSubmission);
  }

  formData.append('deadline', new Date(body.deadline).toISOString());

  formData.append('categoryId', body.categoryId);

  formData.append('stateId', String(body.stateId));

  formData.append('countryId', String(body.countryId));

  body.documents.forEach((file) => {
    formData.append('documents', file);
  });

  return formData;
}

// eslint-disable-next-line complexity
function TenderModal({ mode, tender, onClose }: TenderModalProps) {
  const createTender = useCreateTender();
  const updateTender = useUpdateTender();

  const isSubmitting = createTender.isPending || updateTender.isPending;
  const [removedDocumentIds, setRemovedDocumentIds] = useState<string[]>([]);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<TenderFormValues>({
    mode: 'onChange',
    defaultValues: {
      title: tender?.title ?? '',
      description: tender?.description ?? '',
      eligibility: tender?.eligibility ?? '',
      workPerformance: tender?.workPerformance ?? '',
      proposalSubmission: tender?.proposalSubmission ?? '',
      deadline: tender?.deadline ? dayjs(tender.deadline).format('YYYY-MM-DDTHH:mm') : '',
      countryId: tender?.countryId.toString() ?? '',
      stateId: tender?.stateId.toString() ?? '',
      categoryId: tender?.categoryId ?? '',
      documents: [],
    },
  });

  const countryId = watch('countryId');
  const documents = watch('documents');

  /**
   * Keep track of the previous country.
   *
   * We don't want to clear state on the initial render
   * when editing an existing tender.
   */
  const previousCountryId = useRef(countryId);

  useEffect(() => {
    if (previousCountryId.current !== countryId) {
      setValue('stateId', '', {
        shouldValidate: true,
        shouldDirty: true,
      });

      previousCountryId.current = countryId;
    }
  }, [countryId, setValue]);

  const onSubmit = async (values: unknown) => {
    const formData = createTenderFormData(values as CreateTender);

    try {
      if (mode === 'create') {
        await createTender.mutateAsync(formData);
      } else {
        await updateTender.mutateAsync({
          id: tender!.id,
          data: formData,
        });
      }

      onClose();
    } catch {
      // Mutation error is displayed below.
    }
  };

  const mutationError = createTender.error ?? updateTender.error;

  const newDocumentsCount = Array.isArray(documents) ? documents.length : 0;

  const existingDocumentsCount =
    mode === 'edit'
      ? (tender!.documents?.filter((document) => !removedDocumentIds.includes(document.id)) ?? [])
          .length
      : 0;

  const hasDocuments = newDocumentsCount + existingDocumentsCount > 0;

  const canSubmit = isValid && hasDocuments && !isSubmitting;

  const handleRemoveExistingDocument = (documentId: string) => {
    setRemovedDocumentIds((current) => {
      if (current.includes(documentId)) {
        return current;
      }

      return [...current, documentId];
    });
  };

  const handleRestoreExistingDocument = (documentId: string) => {
    setRemovedDocumentIds((current) => current.filter((id) => id !== documentId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="flex w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        {/* ================= HEADER ================= */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-text">
              {mode === 'create' ? 'Create Tender' : 'Edit Tender'}
            </h2>

            <p className="mt-1 text-sm text-text-light">
              {mode === 'create' ? 'Create a new tender.' : 'Update tender details.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="shrink-0 rounded-lg p-1.5 text-text-light transition hover:bg-surface hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          {/* ================= BODY ================= */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 p-5 sm:p-6">
              {/* ================= REFERENCE ================= */}
              {mode === 'edit' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">
                    RFPNEXA ID / Reference No
                  </label>

                  <input
                    value={tender?.referenceNo ?? ''}
                    readOnly
                    className="h-10 w-full cursor-not-allowed rounded-lg border border-border bg-surface px-3 text-sm text-text-light outline-none"
                  />
                </div>
              )}

              {/* ================= TITLE ================= */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Title
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <input
                  {...register('title', {
                    required: 'Title is required.',
                    maxLength: {
                      value: 255,
                      message: 'Title cannot exceed 255 characters.',
                    },
                  })}
                  placeholder="Tender title"
                  className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary ${
                    errors.title ? 'border-rose-500' : 'border-border'
                  }`}
                />

                {errors.title && (
                  <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>
                )}
              </div>

              {/* ================= DESCRIPTION ================= */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Statement of Work / Description
                </label>

                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Statement of Work / Description"
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                />
              </div>

              {/* ================= ELIGIBILITY ================= */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">Eligibility</label>

                <textarea
                  {...register('eligibility')}
                  rows={3}
                  placeholder="Eligibility requirements"
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                />
              </div>

              {/* ================= WORK PERFORMANCE ================= */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Work Performance
                </label>

                <textarea
                  {...register('workPerformance')}
                  rows={3}
                  placeholder="Work performance requirements"
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                />
              </div>

              {/* ================= PROPOSAL ================= */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Proposal Submission
                </label>

                <textarea
                  {...register('proposalSubmission')}
                  rows={3}
                  placeholder="Proposal submission details"
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                />
              </div>

              {/* ================= DEADLINE ================= */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Deadline
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <input
                  type="datetime-local"
                  {...register('deadline', {
                    required: 'Deadline is required.',
                    validate: (value) =>
                      new Date(value).getTime() > Date.now() || 'Deadline must be in the future.',
                  })}
                  className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary ${
                    errors.deadline ? 'border-rose-500' : 'border-border'
                  }`}
                />

                {errors.deadline && (
                  <p className="mt-1 text-xs text-rose-500">{errors.deadline.message}</p>
                )}
              </div>

              {/* ================= LOCATION ================= */}
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-text">Location & Category</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* COUNTRY */}
                  <Controller
                    name="countryId"
                    control={control}
                    rules={{
                      required: 'Country is required.',
                    }}
                    render={({ field }) => (
                      <CountryDropdown
                        isActive={true}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.countryId?.message}
                      />
                    )}
                  />

                  {/* STATE */}
                  <Controller
                    name="stateId"
                    control={control}
                    rules={{
                      required: 'State is required.',
                    }}
                    render={({ field }) => (
                      <StateDropdown
                        isActive={true}
                        value={field.value}
                        countryId={countryId}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.stateId?.message}
                      />
                    )}
                  />

                  {/* CATEGORY */}
                  <Controller
                    name="categoryId"
                    control={control}
                    rules={{
                      required: 'Category is required.',
                    }}
                    render={({ field }) => (
                      <CategoryDropdown
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.categoryId?.message}
                      />
                    )}
                  />
                </div>
              </div>

              {/* ================= DOCUMENTS ================= */}
              {/* ================= DOCUMENTS ================= */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Documents
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                {/* Existing documents */}
                {mode === 'edit' && tender?.documents?.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-medium text-text-light">Existing documents</p>

                    {tender?.documents.map((document) => {
                      const isRemoved = removedDocumentIds.includes(document.id);

                      if (isRemoved) {
                        return (
                          <div
                            key={document.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-rose-300 bg-rose-50/50 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-text-light line-through">
                                {document.documentOriginalName}
                              </p>

                              <p className="text-xs text-rose-500">This document will be removed</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRestoreExistingDocument(document.id)}
                              className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text transition hover:bg-background"
                            >
                              Undo
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={document.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                        >
                          {/* File icon */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background">
                            <FileText className="h-4 w-4 text-text-light" />
                          </div>

                          {/* File information */}
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-sm font-medium text-text"
                              title={document.documentOriginalName}
                            >
                              {document.documentOriginalName}
                            </p>

                            <p className="text-xs text-text-light">
                              {formatFileSize(document.fileSize ?? 0)}
                            </p>
                          </div>

                          {/* Download */}
                          {document.downloadUrl && (
                            <a
                              href={document.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={document.documentOriginalName}
                              className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text transition hover:bg-background"
                            >
                              Download
                            </a>
                          )}

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingDocument(document.id)}
                            className="shrink-0 rounded-md p-1.5 text-text-light transition hover:bg-rose-50 hover:text-rose-500"
                            title="Remove document"
                            aria-label={`Remove ${document.documentOriginalName}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Controller
                  name="documents"
                  control={control}
                  rules={{
                    validate: (files) => {
                      const newDocumentsCount = files.length;

                      const existingDocumentsCount =
                        mode === 'edit'
                          ? (
                              tender?.documents?.filter(
                                (document) => !removedDocumentIds.includes(document.id),
                              ) ?? []
                            ).length
                          : 0;

                      if (newDocumentsCount + existingDocumentsCount === 0) {
                        return 'At least one document is required.';
                      }

                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <div className="space-y-3">
                      {/* Upload */}
                      <label
                        htmlFor="tender-documents"
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition hover:bg-surface ${
                          errors.documents ? 'border-rose-500' : 'border-border'
                        }`}
                      >
                        <Plus className="mb-2 h-5 w-5 text-text-light" />

                        <span className="text-sm font-medium text-text">Add documents</span>

                        <span className="mt-1 text-xs text-text-light">
                          PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, etc. Max 25 MB per
                          file, 10 files total.
                        </span>

                        <input
                          id="tender-documents"
                          type="file"
                          multiple
                          accept={Object.entries(ALLOWED_FILE_TYPES)
                            .map(([extension, mimeType]) => `.${extension},${mimeType}`)
                            .join(',')}
                          className="hidden"
                          onChange={(event) => {
                            const selectedFiles = Array.from(event.target.files ?? []);

                            if (!selectedFiles.length) {
                              return;
                            }

                            const existingFiles = field.value;

                            // Clear previous upload error.
                            setDocumentError(null);

                            // -----------------------------------------
                            // Maximum file count
                            // -----------------------------------------
                            if (existingFiles.length + selectedFiles.length > MAX_FILES) {
                              setDocumentError(
                                `You can upload a maximum of ${MAX_FILES} documents.`,
                              );

                              event.target.value = '';
                              return;
                            }

                            // -----------------------------------------
                            // Validate every selected file
                            // -----------------------------------------
                            for (const file of selectedFiles) {
                              const extension = file.name.toLowerCase().split('.').pop();

                              // File extension
                              if (!extension || !ALLOWED_FILE_TYPES[extension]) {
                                setDocumentError(`"${file.name}" is not a supported file type.`);

                                event.target.value = '';
                                return;
                              }

                              // MIME type
                              if (file.type && file.type !== ALLOWED_FILE_TYPES[extension]) {
                                setDocumentError(`"${file.name}" has an invalid file type.`);

                                event.target.value = '';
                                return;
                              }

                              // File size
                              if (file.size > MAX_FILE_SIZE) {
                                setDocumentError(
                                  `"${file.name}" exceeds the maximum file size of 25 MB.`,
                                );

                                event.target.value = '';
                                return;
                              }
                            }

                            // -----------------------------------------
                            // Everything is valid
                            // -----------------------------------------
                            field.onChange([...existingFiles, ...selectedFiles]);

                            // Allow selecting the same file again.
                            event.target.value = '';
                          }}
                        />
                      </label>

                      {/* Upload validation error */}
                      {documentError && <p className="text-xs text-rose-500">{documentError}</p>}

                      {/* Newly selected files */}
                      {field.value?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-text-light">New documents</p>

                          {field.value.map((file, index) => (
                            <div
                              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                            >
                              {/* File icon */}
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background">
                                <FileText className="h-4 w-4 text-text-light" />
                              </div>

                              {/* File information */}
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-sm font-medium text-text"
                                  title={file.name}
                                >
                                  {file.name}
                                </p>

                                <p className="text-xs text-text-light">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((_, fileIndex) => fileIndex !== index),
                                  );

                                  setDocumentError(null);
                                }}
                                className="shrink-0 rounded-md p-1.5 text-text-light transition hover:bg-rose-50 hover:text-rose-500"
                                title="Remove file"
                                aria-label={`Remove ${file.name}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Required validation */}
                      {errors.documents && (
                        <p className="text-xs text-rose-500">{errors.documents.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* ================= API ERROR ================= */}
              {mutationError && (
                <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                  {mutationError instanceof Error
                    ? mutationError.message
                    : 'Something went wrong. Please try again.'}
                </p>
              )}
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-background px-5 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

              {mode === 'create' ? 'Create Tender' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TendersPageContent() {
  const gridRef = useRef<AgGridReact>(null);

  const themeMode = useThemeStore((state) => state.theme);

  const themeClass = themeMode === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';

  const { data: tenders, isLoading } = useTenders();
  console.log('tenders', tenders);
  const [modal, setModal] = useState<{
    mode: 'create' | 'edit';
    tender?: Tender | null;
  } | null>(null);

  const columnDefs = useMemo<ColDef<Tender>[]>(
    () => [
      {
        headerName: 'Reference No',
        field: 'referenceNo',
        minWidth: 140,
        width: 150,
        cellClass: 'font-mono text-xs font-semibold',
      },

      {
        headerName: 'Title',
        field: 'title',
        minWidth: 250,
        flex: 1,
      },

      {
        headerName: 'Category',
        field: 'category.name',
        minWidth: 160,
        width: 180,
      },

      {
        headerName: 'State',
        field: 'state.name',
        minWidth: 150,
        width: 170,
      },

      {
        headerName: 'Country',
        field: 'country.name',
        minWidth: 140,
        width: 150,
      },

      {
        headerName: 'Deadline',
        field: 'deadline',
        minWidth: 180,
        width: 190,
        valueFormatter: ({ value }) => (value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '—'),
      },

      {
        headerName: 'Updated At',
        field: 'updatedAt',
        minWidth: 180,
        width: 190,
        valueFormatter: ({ value }) => (value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '—'),
      },

      {
        headerName: 'Actions',
        width: 90,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data: Tender }) => (
          <button
            type="button"
            onClick={() =>
              setModal({
                mode: 'edit',
                tender: params.data,
              })
            }
            className="rounded-md p-1.5 text-text-light hover:bg-surface hover:text-text"
            title="Edit tender"
          >
            <Edit className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
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

  return (
    <>
      <div className="space-y-6">
        <div className="relative flex h-[calc(100vh-220px)] min-h-[600px] w-full flex-col">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Toolbar gridRef={gridRef as any} />
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
              Create Tender
            </button>
          </div>

          {/* Grid */}
          <section className="mt-2 flex flex-1 overflow-hidden">
            <div
              id="tendersGrid"
              className={`h-full flex-1 overflow-hidden rounded-[20px] border border-border bg-surface shadow-sm ${themeClass}`}
            >
              <AgGridReactMemo
                theme={themeQuartz}
                ref={gridRef}
                loading={isLoading}
                rowData={tenders?.data ?? []}
                columnDefs={columnDefs as any}
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
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        //@ts-ignore
        <TenderModal mode={modal.mode} tender={modal.tender} onClose={() => setModal(null)} />
      )}
    </>
  );
}
