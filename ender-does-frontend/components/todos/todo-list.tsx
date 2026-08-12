"use client";

import {CheckCircle2, ListTodo,} from "lucide-react";

import {useEffect, useMemo, useState} from "react";

import axios from "@/utils/axiosInstance";
import {TodoResponse} from "@/types";

import {TodoItem} from "@/components/todos/todo-item";
import {CreateTodoDialog} from "@/components/todos/create-todo-dialog";
import {EditTodoDialog} from "@/components/todos/edit-todo-dialog";
import {DeleteTodoDialog} from "@/components/todos/delete-todo-dialog";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {useSearchParams} from "next/navigation";

type TodoView = "all" | "active" | "completed";

export function TodoList() {
    const searchParams = useSearchParams();

    const rawView = searchParams.get("view");

    const view: TodoView =
        rawView === "active" || rawView === "completed"
            ? rawView
            : "all";

    const [todos, setTodos] = useState<TodoResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTodo, setEditTodo] =
        useState<TodoResponse | null>(null);
    const [deleteTodo, setDeleteTodo] =
        useState<TodoResponse | null>(null);

    const [completingTodoId, setCompletingTodoId] =
        useState<string | null>(null);

    const fetchTodos = async () => {
        try {
            setLoading(true);

            const response =
                await axios.get<TodoResponse[]>("/todos");

            setTodos(response.data);
        } catch (error) {
            console.error("Failed to fetch todos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const visibleTodos = useMemo(() => {
        switch (view) {
            case "active":
                return todos.filter((todo) => !todo.done);

            case "completed":
                return todos.filter((todo) => todo.done);

            default:
                return todos;
        }
    }, [todos, view]);

    const handleCreated = (todo: TodoResponse) => {
        setTodos((current) => [todo, ...current]);
    };

    const handleUpdated = (todo: TodoResponse) => {
        setTodos((current) =>
            current.map((item) =>
                item.id === todo.id ? todo : item
            )
        );
    };

    const handleDeleted = (id: string) => {
        setTodos((current) =>
            current.filter((todo) => todo.id !== id)
        );
    };

    const handleComplete = async (todo: TodoResponse) => {
        if (completingTodoId === todo.id) {
            return;
        }

        try {
            setCompletingTodoId(todo.id);

            const response =
                await axios.patch<TodoResponse>(
                    `/todos/${todo.id}`
                );

            handleUpdated(response.data);
        } catch (error) {
            console.error("Failed to complete todo:", error);
        } finally {
            setCompletingTodoId(null);
        }
    };

    const handleReopen = async (todo: TodoResponse) => {
        if (completingTodoId === todo.id) {
            return;
        }

        try {
            setCompletingTodoId(todo.id);

            const response =
                await axios.patch<TodoResponse>(
                    `/todos/${todo.id}/reopen`
                );

            handleUpdated(response.data);
        } catch (error) {
            console.error("Failed to reopen todo:", error);
        } finally {
            setCompletingTodoId(null);
        }
    };

    const getTitle = () => {
        switch (view) {
            case "active":
                return "Active Tasks";

            case "completed":
                return "Completed Tasks";

            default:
                return "Your Tasks";
        }
    };

    const getDescription = () => {
        switch (view) {
            case "active":
                return "Things that still need to get done.";

            case "completed":
                return "Everything you've already finished.";

            default:
                return "Keep track of what needs to get done.";
        }
    };

    const getEmptyMessage = () => {
        switch (view) {
            case "active":
                return {
                    title: "You're all caught up!",
                    description: "No active tasks right now.",
                };

            case "completed":
                return {
                    title: "Nothing completed yet",
                    description:
                        "Complete a task and it'll show up here.",
                };

            default:
                return {
                    title: "Nothing here yet",
                    description:
                        "Create your first task and get things moving.",
                };
        }
    };

    const emptyMessage = getEmptyMessage();

    return (
        <>
            <div className="mx-auto w-full max-w-5xl space-y-8 p-6 lg:p-8">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                            {view === "completed" ? (
                                <CheckCircle2 className="size-4 text-primary" />
                            ) : (
                                <ListTodo className="size-4 text-primary" />
                            )}

                            {view === "active"
                                ? "Active"
                                : view === "completed"
                                    ? "Completed"
                                    : "Tasks"}
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight">
                            {getTitle()}
                        </h1>

                        <p className="mt-1 text-muted-foreground">
                            {getDescription()}
                        </p>
                    </div>

                    {/* Only show create on All / Active */}
                    {view !== "completed" && (
                        <Button
                            onClick={() => setCreateOpen(true)}
                        >
                            Create Task
                        </Button>
                    )}
                </div>

                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="p-5">
                            <p className="text-2xl font-bold">
                                {todos.length}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <p className="text-2xl font-bold">
                                {todos.filter((todo) => !todo.done).length}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <p className="text-2xl font-bold">
                                {todos.filter((todo) => todo.done).length}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* To do list */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {visibleTodos.length}{" "}
                            {visibleTodos.length === 1
                                ? "task"
                                : "tasks"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        ) : visibleTodos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                                    <CheckCircle2 className="size-7 text-primary" />
                                </div>

                                <h3 className="font-semibold">
                                    {emptyMessage.title}
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {emptyMessage.description}
                                </p>

                                {view !== "completed" && (
                                    <Button
                                        className="mt-5"
                                        onClick={() =>
                                            setCreateOpen(true)
                                        }
                                    >
                                        Create Task
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {visibleTodos.map((todo) => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        completingTodoId={
                                            completingTodoId
                                        }
                                        onComplete={handleComplete}
                                        onReopen={handleReopen}
                                        onEdit={setEditTodo}
                                        onDelete={setDeleteTodo}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create */}
            <CreateTodoDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={handleCreated}
            />

            {/* Edit */}
            <EditTodoDialog
                todo={editTodo}
                open={!!editTodo}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditTodo(null);
                    }
                }}
                onUpdated={handleUpdated}
            />

            {/* Delete */}
            <DeleteTodoDialog
                todo={deleteTodo}
                open={!!deleteTodo}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTodo(null);
                    }
                }}
                onDeleted={handleDeleted}
            />
        </>
    );
}