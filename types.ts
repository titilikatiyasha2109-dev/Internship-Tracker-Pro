
export enum ApplicationStatus {
  WISHLIST = 'Wishlist',
  APPLIED = 'Applied',
  INTERVIEWING = 'Interviewing',
  OFFER = 'Offer',
  REJECTED = 'Rejected'
}

export interface UserProfile {
  name: string;
  goal: string;
  targetIndustry: string;
}

export interface InternshipApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdate: string;
  interviewDate?: string;
  salary?: string;
  url?: string;
  notes?: string;
}

export interface DashboardStats {
  total: number;
  applied: number;
  interviews: number;
  offers: number;
  rejections: number;
}
