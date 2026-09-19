export interface State {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: 'state' | 'territory' | 'federal';
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListDistinctCountries {
  id: string;
  name: string;
  code: string;
}
