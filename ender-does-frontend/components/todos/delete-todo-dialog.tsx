"use client";

import { useState } from "react";
import axios from "@/utils/axiosInstance";
import { TodoResponse } from "@/types";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTodoDialogProps {
    todo: TodoResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted: (id: string) => void;
}

export function DeleteTodoDialog({
                                     todo,
                                     open,
                                     onOpenChange,
                                     onDeleted,
                                 }: DeleteTodoDialogProps) {
    const [loading, setLoading] = useState(false);

    if (!todo) {
        return null;
    }

    const handleDelete = async () => {
        setLoading(true);

        try {
            await axios.delete(`/todos/${todo.id}`);

            onDeleted(todo.id);
            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to delete todo:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent data-testid="delete-todo-dialog">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete this task?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        This will permanently delete{" "}
                        <span className="font-medium text-foreground">
              &quot;{todo.title}&quot;
            </span>
                        . This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel data-testid="delete-todo-cancel" disabled={loading}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        data-testid="delete-todo-confirm"
                        variant="destructive"
                        disabled={loading}
                        onClick={handleDelete}
                    >
                        {loading
                            ? "Deleting..."
                            : "Delete Task"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}