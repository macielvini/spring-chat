package com.macielvini.spring_ai_chat.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.macielvini.spring_ai_chat.user.Status.OFFLINE;
import static com.macielvini.spring_ai_chat.user.Status.ONLINE;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User connect() {
        User user = new User();
        user.setStatus(ONLINE);
        userRepository.save(user);
        return user;
    }

    public void disconnect(User user) {
        var storedUser = userRepository.findById(user.getId()).orElse(null);

        if (storedUser != null) {
            storedUser.setStatus(OFFLINE);
            userRepository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return userRepository.findAllByStatus(ONLINE);
    }
}
