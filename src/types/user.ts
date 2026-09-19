export enum UserStatus {
  PENDING_EMAIL_VERIFICATION = 'pending_email_verification',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
  ARCHIVED = 'archived',
}

export enum AccountType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  accountType: string;
  companyName: string;
  countryId: number;
  createdAt: string;
  email: string;
  name: string;
  permissions: string[];
  roles: string[];
  updatedAt: string;
}
