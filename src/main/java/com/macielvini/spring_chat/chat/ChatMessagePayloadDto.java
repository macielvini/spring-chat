package com.macielvini.spring_chat.chat;

public record ChatMessagePayloadDto(String senderId, String recipientId, String content) {
}
