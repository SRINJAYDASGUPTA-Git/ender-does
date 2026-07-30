package com.enderdev.enderdoesbackend.todo.repositories;

import com.enderdev.enderdoesbackend.todo.models.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface TodoRepository extends JpaRepository<Todo, UUID> {

    @Query(value = """
                        SELECT * FROM todo t WHERE t.owner_id = :id
            """, nativeQuery = true)
    List<Todo> findAllByOwner_Id(@Param("id") UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM Todo t WHERE t.id = :id")
    void deleteTodoById(@Param("id") UUID id);

}
