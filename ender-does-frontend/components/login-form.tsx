"use client";

import {useState} from "react";
import {cn} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Field, FieldGroup, FieldLabel,} from "@/components/ui/field";
import {useRouter} from "next/navigation";
import axios from "@/utils/axiosInstance"
import {Eye, EyeOff} from "lucide-react";

type LoginFormProps = {
  className?: string;
} & React.HTMLAttributes<HTMLFormElement>;

export function LoginForm({
  className,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await axios.post("/auth/login", {
      email,
      password,
    });

    console.log(result)
    if (result.status !== 200) {
      setError(result.data.message || "Something went wrong");
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }


  return (
    <>
      <form
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
              Welcome back
            </h1>

            <p className="text-sm text-muted-foreground">
              Sign in to manage your infrastructure.
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="email">
              Email
            </FieldLabel>

            <Input
              id="email"
              type="email"
              placeholder="admin@srinjaydg.in"
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

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
              type="submit"
              disabled={loading}
              className="w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
                type="button"
                onClick={() => router.push("/register")}
                className="font-medium text-foreground hover:underline"
            >
              Register
            </button>
          </p>
        </FieldGroup>
      </form>
    </>

  );
}