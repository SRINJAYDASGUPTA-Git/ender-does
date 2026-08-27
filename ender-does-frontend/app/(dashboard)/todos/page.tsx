import { Suspense } from "react";
import { TodoList } from "@/components/todos/todo-list";

export default function TodosPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            }
        >
            <TodoList />
        </Suspense>
    );
}