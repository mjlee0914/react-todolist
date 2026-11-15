import SignInForm from '@/domains/auth/components/SignInForm';
export default function SignInPage(): React.JSX.Element {
    return (
        <>
            <h1 className="auth-title">Welcome!</h1>
            <p className="auth-subtitle">Log in to open your Todo List.</p>
            <SignInForm />
        </>
    );
}
