# Interview Breakthrough

**AI-powered interview preparation tailored to your background and target role.**

Interview Breakthrough helps candidates prepare through personalized questions, typed or spoken practice, AI feedback, and structured mock interviews.

Preparation uses the target company, job description, seniority, selected interview stage, and saved career context.

Built with **Next.js, TypeScript, Supabase, Google Gemini, and Vercel**.

## Product Status

**Phase 1 complete. User testing and iteration ongoing.**

The Chrome extension to import job description from private sites like linkedIn, HiringCafe is available as a **BETA** feature.

## Features

### Guest Access and Accounts

- Start using the app through an anonymous guest session.
- Existing users can sign in with email and password.
- Guests can select **Save my progress** to link an email and password to their current guest profile.
- Linking the current guest profile preserves its interviews and practice history.
- Email verification completes the account-linking process.
- Signing into a separate existing account does not merge guest data into that account.

### Career Profile

- Upload a resume or LinkedIn PDF.
- Provide a supported professional profile or website URL.
- Review and edit extracted career information before saving.
- Use saved professional experience to personalize preparation.

### Interview Creation and Management

- Add the company, role title, job description, and interview stage.
- Explicitly select target seniority when creating an interview.
- Save an optional interview date and time.
- Add optional recruiter instructions.
- Return to saved interviews and preparation history.
- Edit interviews or delete them with confirmation.

The Add Interview seniority dropdown requires a selection. **Auto-detect from role** is no longer an option in that dropdown.

### Three Ways to Add Job Details

| Method | How it works |
|---|---|
| **Job link** | Import company, role, and job description from an accessible public posting. Best suited to company career pages that do not require login. |
| **Paste description** | Paste the job description and select **Extract company & role**. Review the extracted details and enter anything missing. |
| **Chrome extension — BETA** | Import job-description text from an open job page using the experimental Chrome extension, then review the details before saving. |

If a job-link import fails, the app switches to the paste-description option.

AI-extracted company and role fields remain editable. Missing details can be entered manually.

### Question Practice

- Generate questions tailored to company, role, job description, seniority, and interview stage.
- Type answers or use browser-based speech recognition.
- Receive AI-generated scores, strengths, and improvement suggestions.
- Review improved example answers.
- Understand why an improved answer is stronger and learn techniques for future responses.
- Revisit previous answers and feedback.

### Mock Interviews

- Practice in structured, 30-minute mock sessions.
- Answer through text or browser-based voice input.
- Receive interviewer questions and follow-up questions.
- Use spoken-question playback where supported.
- Review assessments and completed interview transcripts.
- Return to saved sessions and track preparation progress.

### Dashboard and Progress

- View saved interview workspaces.
- Track question-practice and mock-interview progress.
- Review preparation statuses and saved responses.
- See interview dates and times.

### Feedback and Usability

- Submit in-app feedback with a required 1–5 star rating.
- Add optional written feedback.
- Select a feedback category.
- Use guided onboarding and preparation choices after creating an interview.
- Switch between light and dark themes.
- Use the responsive interface on desktop and mobile.

## Latest Updates: October 25, 2026

- Added automatic guest access.
- Added **Save my progress** for linking a guest profile to email/password credentials.
- Added AI extraction of company and role from pasted job descriptions.
- Preserved direct job-link import with a paste fallback.
- Organized job imports into **Job link**, **Paste description**, and **Chrome extension** tabs.
- Added clearer instructions for each import method.
- Added the experimental Chrome extension and labeled it **BETA**.
- Removed **Auto-detect from role** from the Add Interview seniority dropdown.
- Added a required **Select seniority** placeholder.
- Updated Add Interview action buttons to retain blue styling in light and dark themes.
- Removed redundant job-import labels.

## How to Use

1. Open the app as a guest or sign into an existing account.
2. Add career context through **My Profile**.
3. Select **Add interview**.
4. Choose a job-import method and review the populated information.
5. Select seniority and interview stage, then save the interview.
6. Choose **Question Practice** or **Mock Interview**.
7. Review feedback, improve your answers, and revisit saved progress.
8. If using a guest session, select **Save my progress** to link your profile to an email and password.

## Chrome Extension — BETA

The extension is experimental and requires manual installation. It is not published in the Chrome Web Store.

### Installation

1. Download and unzip this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository's `extension` folder.

### Importing a Job

1. Open a job posting.
2. If the description is not detected automatically, select the job-description text.
3. Click the extension, select **Import**, and approve the text transfer.
4. In Interview Breakthrough, extract company and role.
5. Review the description and extracted fields before saving.

The extension operates when clicked and does not access browser cookies. Compatibility with LinkedIn, Hiring Cafe, and other job sites is not guaranteed.

For Vercel Preview testing, configure the extension's destination URL for the intended preview deployment.

See [extension setup instructions](extension/README.md).

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Next.js API routes |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| AI | Google Gemini |
| Validation | Zod |
| Hosting | Vercel |
| Version control | GitHub |

## Local Development

### Prerequisites

- Node.js and npm compatible with the project's Next.js version
- Supabase project
- Google Gemini API key
- Access to this repository

### Installation

```bash
git clone https://github.com/ritusharma0212/interview-buddy.git
cd interview-buddy
npm install
```

Create `.env.local` with the required configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

GEMINI_API_KEY=your_gemini_api_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

Keep `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` server-side. Never prefix them with `NEXT_PUBLIC_` or commit them to GitHub.

The existing `.env.example` contains older integration placeholders. The current AI integration uses Gemini.

### Supabase Setup

- Apply the required SQL migrations from `supabase/migrations` in order.
- Configure the database policies and any required storage configuration.
- Enable anonymous sign-ins for guest access.
- Enable email/password authentication.
- Configure the Site URL and allowed authentication redirects, including `/auth/callback`.
- Configure email verification for guest-to-email account linking.

See [mock interview setup](docs/mock-interview-setup.md) for additional requirements.

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Validate and Build

```bash
npm run typecheck
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Deployment

The application is hosted on Vercel.

Deployment requires:

- A Vercel project connected to the repository
- Required environment variables configured for the intended environment
- Supabase migrations and access policies applied
- Anonymous and email/password authentication configured
- Authentication redirect URLs configured for the deployment domain
- Server-side Gemini credentials
- The extension destination URL configured for the intended application deployment

Review the Vercel Preview before merging changes and verify the production deployment afterward.

## Current Limitations

- **Company interview processes:** Questions and mock interviews are AI-generated. The app does not verify a company's actual interview rounds or guarantee the questions an interviewer will ask.
- **Job-link imports:** LinkedIn, Hiring Cafe, and other websites may block automated imports. Paste the description if an import fails.
- **Chrome extension:** BETA functionality may fail when job-page layouts, permissions, or browser behavior differ.
- **AI accuracy:** Extracted fields, feedback, scores, and suggested answers may contain errors. Review them before relying on them.
- **Voice support:** Speech recognition and playback depend on browser support and microphone permissions.
- **Guest continuity:** Link an email and password before relying on access from another device. Signing into a different existing account does not merge guest work.
- **Scheduling:** The app saves interview dates and times. Automated study plans, reminders, and calendar synchronization are not supported.
- **Production hardening:** Broader automated testing, monitoring, rate limiting, and AI-quality evaluation remain areas for improvement.

## Security and Privacy

- Supabase Auth provides user identities, including anonymous guest identities.
- Row Level Security and ownership checks restrict access to user-specific data.
- Anonymous access still uses a Supabase identity.
- Service-role credentials must remain server-side.
- Do not commit API keys, access tokens, resumes, or personal user information.
- Avoid including passwords or sensitive information in feedback.
- Review imported job descriptions and AI-generated content before saving or using them.

## Future Enhancements

Potential areas for further development include:

- More reliable job imports and extension compatibility
- Verified company interview intelligence
- Adaptive preparation plans
- Calendar integrations and reminders
- Expanded preparation analytics
- Stronger automated testing, monitoring, and AI evaluations

## Repository Name

The product is branded **Interview Breakthrough**. The GitHub repository retains its original name, `interview-buddy`.
