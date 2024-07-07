package br.com.websockets.example;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor 
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate; // é uma classe do Spring Framework que facilita o envio de mensagens para destinos específicos em aplicações que usam Spring WebSocket ou Spring Messaging
    
    private final Map<String, String> users = new HashMap<>();

    @MessageMapping("/connect") 
    public void connect(@Payload ConnectRequest connectRequest, SimpMessageHeaderAccessor headerAccessor) {
        final var sessionId = headerAccessor.getSessionId();
        if (users.containsKey(sessionId)) {
            return;
        }
        sendAll(new Message(connectRequest.username(), "conectou-se"), sessionId);
        users.put(sessionId, connectRequest.username());
        messagingTemplate.convertAndSend( "/topic/connected", new ConnectResponse(sessionId, "você foi conectado!"));   
    }  
  
    @MessageMapping("/receive-message")
    public void sendMessage(@Payload Message message) {
        sendAll(message, null); 
    }

    @MessageMapping("/disconnect")
    public void disconnect(SimpMessageHeaderAccessor headerAccessor) {
        users.remove(headerAccessor.getSessionId());
    }

    private void sendAll(Message message, String excludeKey) {
        for (final var set: users.entrySet()) {
            if (Objects.nonNull(excludeKey) && set.getKey().equalsIgnoreCase(excludeKey)) {
                continue;
            }
            messagingTemplate.convertAndSend( "/topic/receive-message/%s".formatted(set.getKey()), message);  
        }
    }
    

}
