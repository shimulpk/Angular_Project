export interface User {
  id?: string;
  username: string;
  password?: string;
  fullName: string;
  role: 'ADMIN' | 'MERCHANDISER' | 'PRODUCTION_MGR' | 'STOREKEEPER' | 'PURCHASE_MGR';
  email: string;
  token?: string;
}

