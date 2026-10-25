import {AuthForm} from '@/components/AuthForm';
export default function Login(){return <main className="app-shell"><div className="auth-layout surface"><h1>Welcome to Interview Breakthrough</h1><p>Sign in to recover your existing interviews. Guest data is separate and will not automatically merge.</p><AuthForm/><p><a href="/dashboard">Continue as guest →</a></p></div></main>}
