export interface User {
  id: string;
  documentId?: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "editor" | "user" | string;
  company?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  username?: string;
  photo?: {
    url?: string;
    [key: string]: any;
  };
  team?: {
    name?: string;
    id?: string;
    logo?: {
      url?: string;
      [key: string]: any;
    };
    showFSRA?: boolean;
    [key: string]: any;
  };
  // Additional fields required by the PDF generator
  position?: string;
  titles?: string;
  license?: string;
  workEmail?: string;
  workPhone?: string;
  phone?: string;
  cellPhone?: string;
  website?: string;
  brokerage?: string;
  bio?: string;
  isOnboarding?: boolean;
  isStaffMember?: boolean;
  notListed?: boolean;
  profileComplete?: boolean;
  websiteOptIn?: boolean;
  createdAt?: string;
  updatedAt?: string;
  province?: string;

  // Social media links
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;

  // Application links
  applicationLink?: string;
  appointmentScheduleLink?: string;

  // Printable preferences
  photoOnPrintable?: boolean;
  qrCodeOnPrintable?: boolean;
  emptyPrintableFooter?: boolean;

  // QR Codes
  qrCodes?: Array<{
    id: string;
    url: string;
    qrImage: string;
    isLastUsed?: boolean;
  }>;

  // Realtors
  realtors?: Array<{
    id: string;
    firstname: string;
    middlename?: string;
    lastname: string;
    position?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    photo?: {
      id: string;
      url: string;
      formats?: {
        thumbnail?: { url: string };
        small?: { url: string };
        medium?: { url: string };
      };
      [key: string]: any;
    };
    createdAt?: string;
    updatedAt?: string;
  }>;
}

// Raw API response user structure
export interface RawApiUser {
  id?: string;
  _id?: any;
  documentId?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string | { name?: string; [key: string]: any };
  avatar?: string;
  photo?: {
    url?: string;
    [key: string]: any;
  };
  team?: {
    name?: string;
    id?: string;
    logo?: {
      url?: string;
      [key: string]: any;
    };
    showFSRA?: boolean;
    [key: string]: any;
  };
  company?: string;
  // Additional fields that might come from the API
  position?: string;
  workEmail?: string;
  workPhone?: string;
  phone?: string;
  cellPhone?: string;
  website?: string;
  brokerage?: string;
  [key: string]: any; // Allow for additional unknown properties
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
}

export interface OnePage {
  id: string;
  _id?: string;
  Title: string;
  slug: string;
}

export interface AuthState {
  isAuth: boolean;
  userInfo: User | null;
  notifications: Notification[];
  onePages: OnePage[];
  initialized: boolean;
  error: string | null;
}

export interface AuthContextType {
  userAuth: AuthState;
  setUserAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUserData: (updatedUserData: any) => void;
}

export interface LoginResponse {
  jwt: string;
  documentId: string; 
  cookie_token: string;
  user: User;
}
