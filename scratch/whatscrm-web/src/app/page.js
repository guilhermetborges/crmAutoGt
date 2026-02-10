import { redirect } from 'next/navigation';

export default function HomePage() {
    // Simple redirect to login for now
    // Real logic would check for JWT in cookies/localStorage
    redirect('/login');
}
