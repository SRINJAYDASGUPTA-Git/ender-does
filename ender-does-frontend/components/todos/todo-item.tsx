"use client";

import {
    CheckCircle2,
    Circle,
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react";

import { TodoResponse } from "@/types";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TodoItemProps {
    todo: TodoResponse;
    completingTodoId: string | null;

    onComplete: (todo: TodoResponse) => void;
    onReopen: (todo: TodoResponse) => void;
    onEdit: (todo: TodoResponse) => void;
    onDelete: (todo: TodoResponse) => void;
}

export function TodoItem({
                             todo,
                             completingTodoId,
                             onComplete,
                             onReopen,
                             onEdit,
                             onDelete,
                         }: TodoItemProps) {
    const isProcessing =
        completingTodoId === todo.id;

    return (
        <div
            data-testid={`todo-item-${todo.id}`}
            className="group flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
            {/* Complete */}
            <button
                data-testid={`todo-complete-${todo.id}`}
                type="button"
                onClick={() => {
                    if (!todo.done && !isProcessing) {
                        onComplete(todo);
                    }
                }}
                disabled={todo.done || isProcessing}
                className="shrink-0"
                aria-label={
                    todo.done
                        ? "Completed"
                        : "Mark as complete"
                }
            >
                {todo.done ? (
                    <CheckCircle2 className="size-5 text-primary" />
                ) : (
                    <Circle
                        className={
                            isProcessing
                                ? "size-5 animate-pulse text-primary"
                                : "size-5 text-muted-foreground transition-colors hover:text-primary"
                        }
                    />
                )}
            </button>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <p
                    data-testid={`todo-title-${todo.id}`}
                    className={
                        todo.done
                            ? "truncate text-sm text-muted-foreground line-through"
                            : "truncate text-sm font-medium"
                    }
                >
                    {todo.title}
                </p>

                {todo.body && (
                    <p data-testid={`todo-body-${todo.id}`} className="mt-1 truncate text-xs text-muted-foreground">
                        {todo.body}
                    </p>
                )}
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        data-testid={`todo-actions-${todo.id}`}
                        variant="ghost"
                        size="icon"
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">
              Task actions
            </span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => onEdit(todo)}
                    >
                        <Pencil className="size-4" />
                        Edit
                    </DropdownMenuItem>

                    {todo.done && (
                        <DropdownMenuItem
                            disabled={isProcessing}
                            onClick={() => onReopen(todo)}
                        >
                            <Circle className="size-4" />
                            Mark as not done
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(todo)}
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}