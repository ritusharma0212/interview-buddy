# Interview Breakthrough

**AI-powered, company-specific interview preparation platform**

Interview Breakthrough helps job seekers prepare for interviews through personalized practice questions, AI-generated feedback, and realistic mock interviews.

The platform tailors preparation to the user's professional background, target role, company, job description, seniority, and selected interview stage.

Built with **Next.js, TypeScript, Supabase, Google Gemini, and Vercel**.

## Key Features

### 1. User Authentication and Profiles
- Email/password authentication using Supabase Auth
- Secure user-specific accounts and persistent data
- Resume PDF upload and professional profile information
- LinkedIn/profile URL support
- Seniority detection with manual override
- Profile information used to personalize interview preparation

### 2. Interview Creation and Management
- Create interviews using company name, job title, and job description
- Import job details from supported public job posting URLs
- Manually enter job details when automated import is unavailable
- Select interview stage and seniority
- Save interview dates and times
- View, edit, and delete saved interviews
- Track interview preparation status and progress

### 3. AI-Powered Question Practice
- Generate interview questions using Google Gemini
- Tailor questions to the company, role, job description, seniority, and interview stage
- Submit practice answers
- Receive AI-generated feedback on responses
- Review improved example answers and explanations
- Access previous responses for continued learning

### 4. AI Mock Interviews
- Conduct structured, 30-minute mock interview sessions
- Practice through text or voice input
- Capture spoken answers through browser-based speech recognition
- Receive AI-generated feedback on interview responses
- Track mock interview completion and progress

### 5. Interview Dashboard
- Centralized view of saved interviews
- Interview dates and preparation status
- Question practice and mock interview progress
- Progress tracking across preparation activities
- Persistent interview history

### 6. User Feedback
- In-app feedback submission
- Mandatory 1–5 star experience rating
- Optional written feedback
- Feedback categories: Bug report, Feature request, and General feedback
- Feedback stored in Supabase with user ID, email, rating, category, and submission timestamp

### 7. User Experience
- Responsive interface for desktop and mobile
- Light and dark mode
- Guided next steps after interview creation
- Simplified navigation between Dashboard, Question Practice, Mock Interview, and Profile

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| AI | Google Gemini |
| File Storage | Supabase |
| Hosting | Vercel |
| Validation | Zod |
| Version Control | GitHub |

## How It Works

1. **Create an account:** Sign up and complete your professional profile.
2. **Add your background:** Upload a resume and provide relevant career information.
3. **Create an interview:** Enter the company, role, job description, interview stage, and optional interview date.
4. **Practice questions:** Generate tailored questions, submit answers, and receive AI feedback.
5. **Take a mock interview:** Practice answering questions through text or voice.
6. **Review progress:** Track preparation activities and revisit saved interviews.
7. **Share feedback:** Rate your experience and suggest improvements.

## Current Limitations

The following capabilities are not currently supported or are subject to limitations:

- **Verified company research:** Interview questions are AI-generated using the information provided. The platform does not verify actual company interview processes or perform live external company research.
- **Job posting import:** Some websites restrict automated access. Users can manually paste job descriptions when imports fail.
- **Adaptive study plans:** Automatically generated day-by-day preparation schedules are not currently available.
- **Calendar integrations:** Interview dates can be saved, but Google Calendar and Outlook synchronization are not implemented.
- **Automated reminders:** Interview notifications and scheduled preparation reminders are not currently supported.
- **Production hardening:** Comprehensive automated testing, rate limiting, and monitoring remain areas for further improvement.

## Local Development

### Prerequisites

- Node.js and npm
- Supabase project
- Google Gemini API credentials
- GitHub repository access

### Installation

Clone the repository:

```bash
git clone https://github.com/ritusharma0212/interview-buddy.git
cd interview-buddy
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env.local
```

Configure Supabase credentials and the Gemini API key required by the application's AI integration.

Ensure the Supabase database schema, migrations, authentication settings, and storage configuration are applied.

Run type checking:

```bash
npm run typecheck
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Interview Breakthrough is deployed using Vercel.

**Application:** https://interview-breakthrough.vercel.app

Deployment requirements include:

- Vercel project connected to the GitHub repository
- Required environment variables configured in Vercel
- Supabase authentication redirect URLs configured for the deployment domain
- Supabase database and storage policies configured
- Gemini API credentials available to server-side AI functionality

## Security and Privacy

- Supabase authentication protects user accounts.
- PostgreSQL Row Level Security (RLS) is used for user-specific data access.
- User documents and interview responses should remain accessible only to authorized users.
- Feedback is associated with authenticated users.
- API credentials and secrets must remain in server-side environment variables.
- Do not commit secrets, access tokens, resumes, or personal user data to GitHub.

## Product Status

**Current stage: Deployed application / User testing and iteration**

Interview Breakthrough supports end-to-end interview preparation, from profile setup and interview creation to question practice, mock interviews, AI feedback, and progress tracking.

The product is undergoing user testing and iterative improvements based on feedback.

## Future Enhancements

Potential future enhancements include:

- Verified company-specific interview intelligence
- Personalized adaptive preparation plans
- Google Calendar and Outlook integration
- Automated interview reminders
- Expanded interview analytics
- Additional AI evaluation and coaching capabilities
- Improved job posting import compatibility
- Enhanced production testing and monitoring

---

**Interview Breakthrough — Prepare with purpose. Practice with confidence.**
