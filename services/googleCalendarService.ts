
import { InternshipApplication } from "../types";

// The Client ID should be provided via environment variables for security and portability.
//@ts-ignore
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1009349046392-9c1idl0q30o1mn3joe77qvfeitmfeo5d.apps.googleusercontent.com'
//@ts-ignore
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export const googleCalendarService = {
  getAccessToken(): string | null {
    return localStorage.getItem('google_access_token');
  },

  setAccessToken(token: string) {
    localStorage.setItem('google_access_token', token);
    // Also track expiration - usually Google tokens last 1 hour
    localStorage.setItem('google_token_expiry', (Date.now() + 3500 * 1000).toString());
  },

  isTokenValid(): boolean {
    const token = this.getAccessToken();
    const expiry = localStorage.getItem('google_token_expiry');
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry);
  },

  logout() {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('synced_calendar_events');
  },

  async createEvent(app: InternshipApplication): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token || !app.interviewDate) return false;

    const startTime = new Date(app.interviewDate);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1hr interview

    const event = {
      summary: `📅 Interview: ${app.role} @ ${app.company}`,
      location: app.location || 'Remote / TBA',
      description: `Interview for the ${app.role} position.\n\nNotes from InternTrack:\n${app.notes || 'No specific notes added.'}\n\nTracked via InternTrack Pro: Smart Career Management`,
      start: {
        dateTime: new Date(app.interviewDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 1440 }, // 1 day before
        ],
      },
    };

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return false;
        }
        const errorData = await response.json();
        console.error('Google API Error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Network Error during Calendar Sync:', error);
      return false;
    }
  }
};
