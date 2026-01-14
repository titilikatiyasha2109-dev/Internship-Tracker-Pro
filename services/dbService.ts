
import { InternshipApplication, UserProfile } from "../types";

const APPS_KEY = 'intern_tracker_apps';
const USER_KEY = 'intern_tracker_user';

// Simulating network latency for a "Production" feel
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const dbService = {
  async getApplications(): Promise<InternshipApplication[]> {
    await delay(400); // Simulate API call
    const data = localStorage.getItem(APPS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveApplications(apps: InternshipApplication[]): Promise<void> {
    await delay(600); // Simulate write latency
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  },

  async getUser(): Promise<UserProfile> {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : { name: 'Future Intern', goal: 'Land a top-tier tech internship', targetIndustry: 'Technology' };
  },

  async saveUser(user: UserProfile): Promise<void> {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Mock function to simulate pulling data from a Google Form via a backend
  async syncFromGoogleForm(): Promise<InternshipApplication[]> {
    await delay(1500);
    // In a real app, this would be: await fetch('your-google-apps-script-api-url')
    return []; 
  }
};
