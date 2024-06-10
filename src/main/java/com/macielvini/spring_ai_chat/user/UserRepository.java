package com.macielvini.spring_ai_chat.user;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findAllByStatus(Status status);

    Optional<User> findByNickname(String nickname);
}
