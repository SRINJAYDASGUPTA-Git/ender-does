package com.enderdev.enderdoesbackend.todo.repositories;

import com.enderdev.enderdoesbackend.todo.models.Todo;
import com.enderdev.enderdoesbackend.user.models.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TodoRepositoryTest {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private EntityManager entityManager;

    private User createUser(String email) {
        User user = User.builder()
                .name("Test User")
                .email(email)
                .password("password")
                .enabled(true)
                .accountLocked(false)
                .build();

        entityManager.persist(user);

        return user;
    }

    private Todo createTodo(User owner, String title) {

        Todo todo = Todo.builder()
                .title(title)
                .body("Body")
                .createdAt(LocalDateTime.now())
                .isDone(false)
                .owner(owner)
                .build();

        entityManager.persist(todo);

        return todo;
    }

    @Test
    @DisplayName("Should save Todo")
    void shouldSaveTodo() {

        User owner = createUser("save@test.com");

        Todo todo = createTodo(owner, "Test");

        Todo saved = todoRepository.save(todo);

        assertThat(saved.getId()).isNotNull();
    }

    @Test
    @DisplayName("Should find Todo by id")
    void shouldFindTodoById() {

        User owner = createUser("find@test.com");

        Todo todo = createTodo(owner, "Spring Boot");

        Todo found = todoRepository.findById(todo.getId()).orElse(null);

        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("Spring Boot");
    }

    @Test
    @DisplayName("Should return only owner's todos")
    void shouldFindTodosByOwner() {

        User alice = createUser("alice@test.com");
        User bob = createUser("bob@test.com");

        createTodo(alice, "A");
        createTodo(alice, "B");
        createTodo(bob, "C");

        List<Todo> todos = todoRepository.findAllByOwner_Id(alice.getId());

        assertThat(todos)

                .hasSize(2)

                .extracting(Todo::getTitle)

                .containsExactlyInAnyOrder("A", "B");
    }

    @Test
    @DisplayName("Should delete Todo")
    void shouldDeleteTodo() {

        User owner = createUser("delete@test.com");

        Todo todo = createTodo(owner, "Delete Me");

        UUID id = todo.getId();

        todoRepository.deleteTodoById(id);

        entityManager.flush();
        entityManager.clear();

        assertThat(todoRepository.findById(id)).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when owner has no todos")
    void shouldReturnEmptyList() {

        User owner = createUser("empty@test.com");

        List<Todo> todos =
                todoRepository.findAllByOwner_Id(owner.getId());

        assertThat(todos).isEmpty();
    }

    @Test
    @DisplayName("Should persist multiple todos")
    void shouldPersistMultipleTodos() {

        User owner = createUser("multi@test.com");

        createTodo(owner, "One");
        createTodo(owner, "Two");
        createTodo(owner, "Three");

        assertThat(todoRepository.count()).isEqualTo(3);
    }
}