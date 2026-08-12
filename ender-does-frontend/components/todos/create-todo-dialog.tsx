"use client";

import { useState } from "react";
import axios from "@/utils/axiosInstance";
import { TodoRequest, TodoResponse } from "@/types";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldLabel,
} from "@/components/ui/field";

interface CreateTodoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (todo: TodoResponse) => void;
}

export function CreateTodoDialog({
                                     open,
                                     onOpenChange,
                                     onCreated,
                                 }: CreateTodoDialogProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setTitle("");
        setBody("");
        setError("");
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const request: TodoRequest = {
                title,
                body,
            };

            const response =
                await axios.post<TodoResponse>(
                    "/todos",
                    request
                );

            onCreated(response.data);

            reset();
            onOpenChange(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to create task."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) reset();
                onOpenChange(value);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create a task
                    </DialogTitle>

                    <DialogDescription>
                        What needs to get done?
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <Field>
                        <FieldLabel htmlFor="todo-title">
                            Title
                        </FieldLabel>

                        <Input
                            id="todo-title"
                            placeholder="Finish the frontend"
                            required
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="todo-body">
                            Description
                        </FieldLabel>

                        <Textarea
                            id="todo-body"
                            placeholder="Add some details..."
                            rows={4}
                            value={body}
                            onChange={(event) =>
                                setBody(event.target.value)
                            }
                        />
                    </Field>

                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}