"use client";

import {
    ArrowRight,
    CheckCircle2,
    ListTodo,
    ShieldCheck,
    Sparkles,
    Target,
    Zap,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
    const router = useRouter();
    const { user, loading } = useUser();

    const handleGetStarted = () => {
        if (loading) return;

        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    };

    return (
        <main className="min-h-screen bg-background">

            {/* HELLOOOO */}
            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-3"
                    >
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <CheckCircle2 className="size-5" />
                        </div>

                        <div className="text-left">
                            <p className="font-semibold leading-none">
                                EnderDoes
                            </p>

                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Simple. Focused. Done.
                            </p>
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        {!loading && user ? (
                            <Button onClick={() => router.push("/dashboard")}>
                                Dashboard
                                <ArrowRight className="size-4" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/login")}
                                >
                                    Sign in
                                </Button>

                                <Button onClick={() => router.push("/register")}>
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 py-20 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                            <Sparkles className="size-4 text-primary" />
                            <span>A better way to get things done</span>
                        </div>

                        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                            Turn your plans into
                            <span className="block text-primary">
                things actually done.
              </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                            EnderDoes helps you organize your tasks, stay focused,
                            and keep track of what matters without getting in your way.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                size="lg"
                                className="h-12 gap-2 px-7"
                                onClick={handleGetStarted}
                            >
                                {user ? "Open Dashboard" : "Get Started"}
                                <ArrowRight className="size-4" />
                            </Button>

                            {!user && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-12 px-7"
                                    onClick={() => router.push("/login")}
                                >
                                    Sign In
                                </Button>
                            )}
                        </div>

                        <p className="mt-5 text-xs text-muted-foreground">
                            Simple task management. No unnecessary complexity.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="border-t bg-muted/20 py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-medium text-primary">
                            EVERYTHING YOU NEED
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Stay organized without the clutter.
                        </h2>

                        <p className="mt-4 text-muted-foreground">
                            EnderDoes keeps task management focused on the things
                            that actually matter.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                                    <ListTodo className="size-5 text-primary" />
                                </div>

                                <h3 className="mt-5 text-lg font-semibold">
                                    Organize Your Tasks
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Keep everything you need to do in one place and
                                    quickly see what still needs your attention.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                                    <Target className="size-5 text-primary" />
                                </div>

                                <h3 className="mt-5 text-lg font-semibold">
                                    Track Your Progress
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    See your completed, active, and total tasks at a
                                    glance and know exactly where you stand.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                                    <ShieldCheck className="size-5 text-primary" />
                                </div>

                                <h3 className="mt-5 text-lg font-semibold">
                                    Secure by Design
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Your account and your tasks stay private and
                                    protected behind authentication.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t py-24">
                <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Zap className="size-6" />
                    </div>

                    <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to get things done?
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                        Create your workspace and start turning your to-do list
                        into a done list.
                    </p>

                    <Button
                        size="lg"
                        className="mt-8 h-12 gap-2 px-7"
                        onClick={handleGetStarted}
                    >
                        {user ? "Go to Dashboard" : "Start Using EnderDoes"}
                        <ArrowRight className="size-4" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
                    <p>
                        © {new Date().getFullYear()} EnderDoes
                    </p>

                    <p>
                        Simple. Focused. Done.
                    </p>
                </div>
            </footer>
        </main>
    );
}