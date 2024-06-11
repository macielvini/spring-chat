package com.macielvini.spring_chat.user;

import com.macielvini.spring_chat.config.CronExpressions;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.macielvini.spring_chat.user.Status.OFFLINE;
import static com.macielvini.spring_chat.user.Status.ONLINE;

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

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    private boolean checkIfNicknameExists(String nickname) {
        return userRepository.findByNickname(nickname).isPresent();
    }

    @Scheduled(cron = CronExpressions.MIDNIGHT)
    private void wipeUsers() {
        System.out.println("Wiping users...");
        this.userRepository.deleteAll();
    }
}
