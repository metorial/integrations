import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Google OAuth',
    key: 'google_oauth',

    scopes: [
      {
        title: 'Manage Courses',
        description: 'Create, edit, and delete classes',
        scope: 'https://www.googleapis.com/auth/classroom.courses',
      },
      {
        title: 'View Courses',
        description: 'View classes',
        scope: 'https://www.googleapis.com/auth/classroom.courses.readonly',
      },
      {
        title: 'Manage Rosters',
        description: 'Manage class rosters',
        scope: 'https://www.googleapis.com/auth/classroom.rosters',
      },
      {
        title: 'View Rosters',
        description: 'View class rosters',
        scope: 'https://www.googleapis.com/auth/classroom.rosters.readonly',
      },
      {
        title: 'Manage Own Coursework',
        description: 'Manage own coursework and grades',
        scope: 'https://www.googleapis.com/auth/classroom.coursework.me',
      },
      {
        title: 'View Own Coursework',
        description: 'View own coursework and grades',
        scope: 'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      },
      {
        title: 'Manage Student Coursework',
        description: 'Manage coursework and grades for students in classes you teach',
        scope: 'https://www.googleapis.com/auth/classroom.coursework.students',
      },
      {
        title: 'View Student Coursework',
        description: 'View coursework and grades for students in classes you teach',
        scope: 'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
      },
      {
        title: 'Manage Coursework Materials',
        description: 'Manage classwork materials',
        scope: 'https://www.googleapis.com/auth/classroom.courseworkmaterials',
      },
      {
        title: 'View Coursework Materials',
        description: 'View classwork materials',
        scope: 'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
      },
      {
        title: 'Manage Announcements',
        description: 'Manage announcements',
        scope: 'https://www.googleapis.com/auth/classroom.announcements',
      },
      {
        title: 'View Announcements',
        description: 'View announcements',
        scope: 'https://www.googleapis.com/auth/classroom.announcements.readonly',
      },
      {
        title: 'Manage Topics',
        description: 'Manage topics',
        scope: 'https://www.googleapis.com/auth/classroom.topics',
      },
      {
        title: 'View Topics',
        description: 'View topics',
        scope: 'https://www.googleapis.com/auth/classroom.topics.readonly',
      },
      {
        title: 'Manage Guardians',
        description: 'Manage guardians for students',
        scope: 'https://www.googleapis.com/auth/classroom.guardianlinks.students',
      },
      {
        title: 'View Guardians',
        description: 'View guardians for students',
        scope: 'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
      },
      {
        title: 'View Own Guardians',
        description: 'View own guardians',
        scope: 'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
      },
      {
        title: 'View Profile Emails',
        description: 'View email addresses of people in classes',
        scope: 'https://www.googleapis.com/auth/classroom.profile.emails',
      },
      {
        title: 'View Profile Photos',
        description: 'View profile photos of people in classes',
        scope: 'https://www.googleapis.com/auth/classroom.profile.photos',
      },
      {
        title: 'Push Notifications',
        description: 'Receive notifications about Classroom data changes',
        scope: 'https://www.googleapis.com/auth/classroom.push-notifications',
      },
      {
        title: 'Manage Add-ons (Teacher)',
        description: 'Manage add-on attachments as a teacher',
        scope: 'https://www.googleapis.com/auth/classroom.addons.teacher',
      },
      {
        title: 'View Add-ons (Student)',
        description: 'View/update add-on attachments as a student',
        scope: 'https://www.googleapis.com/auth/classroom.addons.student',
      },
      {
        title: 'View Own Submissions',
        description: 'View own submissions and grades',
        scope: 'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
      },
      {
        title: 'View Student Submissions',
        description: 'View student submissions in classes you teach',
        scope: 'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
      },
      {
        title: 'User Profile Info',
        description: 'View basic profile information',
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
      },
      {
        title: 'User Email',
        description: 'View email address',
        scope: 'https://www.googleapis.com/auth/userinfo.email',
      },
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        access_type: 'offline',
        state: ctx.state,
        prompt: 'consent',
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      };
    },

    handleCallback: async (ctx) => {
      let http = createAxios();

      let response = await http.post('https://oauth2.googleapis.com/token', {
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        grant_type: 'authorization_code',
      });

      let data = response.data;

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
        },
      };
    },

    handleTokenRefresh: async (ctx) => {
      let http = createAxios();

      let response = await http.post('https://oauth2.googleapis.com/token', {
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken,
        grant_type: 'refresh_token',
      });

      let data = response.data;

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: {}; scopes: string[] }) => {
      let http = createAxios({
        baseURL: 'https://www.googleapis.com',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let response = await http.get('/oauth2/v2/userinfo');
      let data = response.data;

      return {
        profile: {
          id: data.id,
          email: data.email,
          name: data.name,
          imageUrl: data.picture,
        },
      };
    },
  });
