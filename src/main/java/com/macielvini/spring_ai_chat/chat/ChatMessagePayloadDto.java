package com.macielvini.spring_ai_chat.chat;

public record ChatMessagePayloadDto(String senderId, String recipientId, String content) {
}
