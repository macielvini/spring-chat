package com.macielvini.spring_ai_chat.chat;

import com.macielvini.spring_ai_chat.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatRoomService chatRoomService;
    private final ChatMessageRepository messageRepository;

    public ChatMessage save(ChatMessage chatMessage) {
        var chatId = chatRoomService
                .getChatRoomId(chatMessage.getSenderId(), chatMessage.getRecipientId(), true)
                .orElseThrow();
        chatMessage.setChatId(chatId);
        return messageRepository.save(chatMessage);
    }

    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        var chatId = chatRoomService
                .getChatRoomId(senderId, recipientId, false);
        return chatId.map(messageRepository::findAllByChatId).orElse(new ArrayList<>());
    }
}
