export interface UserInfo {
  id: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  legalName?: string;
  preferredName?: string;
  titles?: string;
  position?: string;
  license?: string;
  tshirtSize?: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  bio?: string;
  additionalNotes?: string;
  photo?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      squared?: { url: string }; // Keep for backward compatibility
    };
  };
}

export interface ContactInfo {
  email: string;
  workEmail?: string;
  phone: string;
  ext?: string;
  homePhone?: string;
  cellPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  dietRestriction?: string;
}

export interface SocialLinksInfo {
  website?: string;
  secondaryWebsite?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  applicationLink?: string;
  appointmentScheduleLink?: string;
  googleReviewsLink?: string;
}

export interface OfficeAddress {
  address: string;
  suiteUnit?: string;
  city: string;
  province: string;
  postalCode: string;
  provinceLicenseNumber?: string;
  branch?: {
    id: string;
    [key: string]: any;
  };
}

export interface PersonalAddress {
  personalAddress: string;
  personalSuiteUnit?: string;
  personalCity: string;
  personalProvince: string;
  personalPostalCode: string;
}

export interface Badge {
  id: string | number;
  title: string | null;
  enabled: boolean;
  image?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
    };
  };
}

export interface BadgeSettings {
  website: boolean;
  emailSignature: boolean;
}

export interface Awards {
  badges: Badge[];
  showBadges: BadgeSettings;
}

// Flat user structure from /users/me endpoint
export interface FlatUserProfile {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  legalName?: string;
  preferredName?: string;
  titles?: string;
  position?: string;
  license?: string;
  tshirtSize?: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  bio?: string;
  additionalNotes?: string;
  workEmail?: string;
  phone?: string;
  ext?: string;
  homePhone?: string;
  cellPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  dietRestriction?: string;
  website?: string;
  secondaryWebsite?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  applicationLink?: string;
  appointmentScheduleLink?: string;
  googleReviewsLink?: string;
  address?: string;
  suiteUnit?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  provinceLicenseNumber?: string;
  branch?: any;
  personalAddress?: string;
  personalSuiteUnit?: string;
  personalCity?: string;
  personalProvince?: string;
  personalPostalCode?: string;
  badges?: Badge[];
  showBadges?: BadgeSettings;
  photo?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      squared?: { url: string }; // Keep for backward compatibility
    };
  };
}

export interface UserProfile {
  userInfo: UserInfo;
  contactInfo: ContactInfo;
  socialLinks: SocialLinksInfo;
  officeAddress: OfficeAddress;
  personalAddress: PersonalAddress;
  awards: Awards;
}

// Union type to handle both structures
export type ProfileData = UserProfile | FlatUserProfile;

export interface Branch {
  id: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  suiteUnit?: string;
  provinceLicenseNumber?: string;
}

export interface ProfileUpdatePayload {
  userInfo?: Partial<UserInfo>;
  contactInfo?: Partial<ContactInfo>;
  socialLinks?: Partial<SocialLinksInfo>;
  officeAddress?: Partial<OfficeAddress>;
  personalAddress?: Partial<PersonalAddress>;
  awards?: Partial<Awards>;
}

// New type for direct form data updates
export type ProfileFormData =
  | Partial<UserInfo>
  | Partial<ContactInfo>
  | Partial<SocialLinksInfo>
  | Partial<OfficeAddress & PersonalAddress>
  | Partial<Awards>
  | Record<string, any>; // Allow any other fields for flexibility
