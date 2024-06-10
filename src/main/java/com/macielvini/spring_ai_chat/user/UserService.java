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

    public void connect(User user) {
        user.setStatus(ONLINE);
        userRepository.save(user);
    }

    public void disconnect(User user) {
        var storedUser = userRepository.findById(user.getNickname()).orElse(null);

        if (storedUser != null) {
            storedUser.setStatus(OFFLINE);
            userRepository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return userRepository.findAllByStatus(ONLINE);
    }

    private boolean checkIfNicknameExists(String nickname) {
        return userRepository.findByNickname(nickname).isPresent();
    }
}
