import SignUpForm from '@/domains/auth/components/SignUpForm';

export default function signUpPage(): React.JSX.Element {
    return (
        <>
            <h1 className="auth-title">New fish in town?</h1>
            <p className="auth-subtitle">Create your little desktop account.</p>
            <SignUpForm />
        </>
    );
}
