export interface User {
  id?: string;
  username: string;
  password?: string;
  fullName: string;
  role: 'ADMIN' | 'MERCHANDISER' | 'PRODUCTION_MGR' | 'SUPERVISOR' | 'QA_OFFICER' | 'STOREKEEPER' | 'PURCHASE_MGR' | 'VIEWER';
  email: string;
  token?: string;
}

