package com.macielvini.spring_ai_chat.chat;

import com.macielvini.spring_ai_chat.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatRoomService chatRoomService;
    private final ChatMessageRepository messageRepository;

    public ChatMessage save(ChatMessagePayloadDto chatMessage) {
        var chatId = chatRoomService
                .getChatRoomId(chatMessage.senderId(), chatMessage.recipientId(), true)
                .orElseThrow();

        return messageRepository.save(ChatMessage.builder()
                .chatId(chatId)
                .senderId(chatMessage.senderId())
                .recipientId(chatMessage.recipientId())
                .content(chatMessage.content())
                .timestamp(new Date())
                .build());
    }

    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        var chatId = chatRoomService
                .getChatRoomId(senderId, recipientId, false);
        return chatId.map(messageRepository::findAllByChatId).orElse(new ArrayList<>());
    }
}
