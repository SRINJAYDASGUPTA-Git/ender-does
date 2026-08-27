"use client";

import { useEffect, useState } from "react";
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

interface EditTodoDialogProps {
    todo: TodoResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: (todo: TodoResponse) => void;
}

export function EditTodoDialog({
                                   todo,
                                   open,
                                   onOpenChange,
                                   onUpdated,
                               }: EditTodoDialogProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (todo) {
            setTitle(todo.title);
            setBody(todo.body);
            setError("");
        }
    }, [todo]);

    if (!todo) {
        return null;
    }

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
                await axios.put<TodoResponse>(
                    `/todos/${todo.id}`,
                    request
                );

            onUpdated(response.data);
            onOpenChange(false);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to update task."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent data-testid="edit-todo-dialog">
                <DialogHeader>
                    <DialogTitle>
                        Edit task
                    </DialogTitle>

                    <DialogDescription>
                        Make changes to your task.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <Field>
                        <FieldLabel htmlFor="edit-todo-title">
                            Title
                        </FieldLabel>

                        <Input
                            id="edit-todo-title"
                            data-testid="edit-todo-title"
                            required
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="edit-todo-body">
                            Description
                        </FieldLabel>

                        <Textarea
                            id="edit-todo-body"
                            data-testid="edit-todo-body"
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
                            data-testid="edit-todo-cancel"
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            data-testid="edit-todo-submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}