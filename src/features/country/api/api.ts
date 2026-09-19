import type {
  ActivityItem,
  AddCommentInput,
  AssignReviewerInput,
  ChangeRequestQueryInput,
  CountryHierarchyNode,
  CreateCountryChangeRequestInput,
  DependencyMatrix,
  DependencyMatrixQueryInput,
  OperationalStats,
  ReviewChangeRequestInput,
  Reviewer,
  // StateQuery,
  TicketItem,
  UpdateCountryBodyDto,
  UpdateStateBodyDto,
} from '../types';
import type { ApiResponse, State } from '@/types';
import { apiClient } from '@/lib/http';

export const countriesApi = {
  prefix: '/geography',

  getCountries(isActive?: boolean) {
    return apiClient.get<
      ApiResponse<{ countryId: string; countryName: string; countryCode: string }[]>
    >(`${this.prefix}/countries`, {
      params: {
        isActive,
      },
    });
  },

  getStates(id: string, isActive?: boolean) {
    return apiClient.get<ApiResponse<State[]>>(`${this.prefix}/countries/states/${id}`, {
      params: {
        isActive,
      },
    });
  },

  getTimeline(countryId: string, stateId?: string) {
    return apiClient.get<ApiResponse<ActivityItem[]>>(`${this.prefix}/${countryId}/timeline`, {
      params: stateId ? { stateId } : undefined,
    });
  },

  getCountriesHierarchy() {
    return apiClient.get<ApiResponse<CountryHierarchyNode[]>>(`${this.prefix}/hierarchy`);
  },

  getOperationalStats() {
    return apiClient.get<ApiResponse<OperationalStats>>(`${this.prefix}/stats`);
  },

  getEligibleReviewers() {
    return apiClient.get<ApiResponse<Reviewer[]>>(`${this.prefix}/eligible-reviewers`);
  },

  getDependencyMatrix(query: DependencyMatrixQueryInput) {
    return apiClient.get<ApiResponse<DependencyMatrix>>(`${this.prefix}/dependency-matrix`, {
      params: query,
    });
  },

  getReviewsQueue(query?: ChangeRequestQueryInput) {
    return apiClient.get<ApiResponse<TicketItem[]>>(`${this.prefix}/change-requests`, {
      params: query,
    });
  },

  getChangeRequestDetails(requestId: string) {
    return apiClient.get<ApiResponse<TicketItem>>(`${this.prefix}/change-requests/${requestId}`);
  },

  createChangeRequest(input: CreateCountryChangeRequestInput) {
    return apiClient.post<ApiResponse<TicketItem>>(`${this.prefix}/change-requests`, input);
  },

  assignReviewer(requestId: string, input: AssignReviewerInput) {
    return apiClient.post<ApiResponse<TicketItem>>(
      `${this.prefix}/change-requests/${requestId}/assign`,
      input,
    );
  },

  addComment(requestId: string, input: AddCommentInput) {
    return apiClient.post<ApiResponse<any>>(
      `${this.prefix}/change-requests/${requestId}/comments`,
      input,
    );
  },

  reviewChangeRequest(requestId: string, input: ReviewChangeRequestInput) {
    return apiClient.post<ApiResponse<TicketItem>>(
      `${this.prefix}/change-requests/${requestId}/review`,
      input,
    );
  },

  getRequestTimeline(requestId: string) {
    return apiClient.get<ApiResponse<ActivityItem[]>>(
      `${this.prefix}/change-requests/${requestId}/timeline`,
    );
  },

  updateState(stateId: string, input: UpdateStateBodyDto) {
    return apiClient.patch<ApiResponse<State>>(`${this.prefix}/states/${stateId}`, input);
  },

  updateCountry(countryId: string, input: UpdateCountryBodyDto) {
    return apiClient.patch<ApiResponse<any>>(`${this.prefix}/${countryId}`, input);
  },

  updateCountryStatus(countryId: string, input: UpdateCountryBodyDto) {
    return apiClient.put<ApiResponse<any>>(`${this.prefix}/countries/${countryId}/status`, input);
  },

  updateStateStatus(stateId: string, input: UpdateStateBodyDto) {
    return apiClient.put<ApiResponse<any>>(`${this.prefix}/states/${stateId}/status`, input);
  },
};
