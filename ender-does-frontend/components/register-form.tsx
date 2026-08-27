"use client";

import {useState} from "react";
import {cn} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Eye, EyeOff} from "lucide-react";
import {useRouter} from "next/navigation";
import axios from "@/utils/axiosInstance";

type RegisterFormProps = {
    className?: string;
} & React.HTMLAttributes<HTMLFormElement>;

export function RegisterForm({
                                 className,
                                 ...props
                             }: RegisterFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const result = await axios.post("/auth/register", {
                name: name,
                email: email,
                password: password,
                imageUrl: `https://avatar.vercel.sh/${name}`
            });

            if (result.status !== 200 && result.status !== 201) {
                setError(
                    result.data?.message || "Something went wrong"
                );
                setLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Unable to create your account."
            );
            setLoading(false);
        }
    }

    return (
        <form
            data-testid={"register-form"}
            onSubmit={handleSubmit}
            className={cn(
                "flex flex-col gap-6",
                className
            )}
            {...props}
        >
            <FieldGroup>
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create an account
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Create your account to start managing your todos.
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="name">
                        Name
                    </FieldLabel>

                    <Input
                        data-testid={"register-name"}
                        id="name"
                        type="text"
                        placeholder="Srinjay Dasgupta"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="email">
                        Email
                    </FieldLabel>

                    <Input
                        data-testid={"register-email"}
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">
                        Password
                    </FieldLabel>

                    <div className="relative">
                        <Input
                            data-testid={"register-password"}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="size-4"/>
                            ) : (
                                <Eye className="size-4"/>
                            )}
                        </button>
                    </div>
                </Field>

                <Field>
                    <FieldLabel htmlFor="confirm-password">
                        Confirm Password
                    </FieldLabel>

                    <div className="relative">
                        <Input
                            data-testid={"register-confirm-password"}
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pr-10"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={
                                showConfirmPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="size-4"/>
                            ) : (
                                <Eye className="size-4"/>
                            )}
                        </button>
                    </div>
                </Field>

                {error && (
                    <p data-testid={"register-error"} className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <Button
                    data-testid={"register-submit"}
                    type="submit"
                    disabled={loading}
                    className="w-full"
                >
                    {loading
                        ? "Creating account..."
                        : "Create Account"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                    By creating an account, you agree to the
                    application&apos;s terms and policies.
                </p>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign in
                    </button>
                </p>
            </FieldGroup>
        </form>
    );
}