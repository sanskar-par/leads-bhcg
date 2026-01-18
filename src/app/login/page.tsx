import LoginForm from "@/components/auth/login-form";
import { Briefcase } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Briefcase className="h-12 w-12 text-primary" />
                    <h1 className="mt-4 text-3xl font-headline font-bold">BHCG Leads Central</h1>
                    <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
