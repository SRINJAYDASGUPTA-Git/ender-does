"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { validateCredentials } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import MFADialog from "./security/mfa-dialog";

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

  const [openMfaDialog, setOpenMfaDialog] = useState(false);
  const [userId, setUserId] = useState("");
  const router = useRouter();

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await validateCredentials(
      email,
      password
    );

    console.log(result)

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // MFA Enabled
    if (result.requiresMfa) {
      setUserId(result.userId);
      setOpenMfaDialog(true);
      setLoading(false);
      return;
    }

    // No MFA
    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!signInResult?.ok) {
      setError("Unable to sign in.");
      setLoading(false);
      return;
    }

    router.push("/");
  }


  return (
    <>
      <MFADialog
        open={openMfaDialog}
        onOpenChange={setOpenMfaDialog}
        email={email}
        password={password}
        userId={userId}
      />
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

            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
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
            {loading
              ? "Signing in..."
              : "Sign In"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Protected by Email + Password.
            <br />
            Two-Factor Authentication will be
            requested if enabled.
          </p>
        </FieldGroup>
      </form>
    </>

  );
}