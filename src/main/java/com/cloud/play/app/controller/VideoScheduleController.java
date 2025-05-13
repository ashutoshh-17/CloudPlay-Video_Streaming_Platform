
package com.cloud.play.app.controller;

import com.cloud.play.app.dto.VideoDTO;
import com.cloud.play.app.service.RoomService;
import com.cloud.play.app.service.VideoService;
import com.cloud.play.app.dto.ScheduleMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
public class VideoScheduleController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomService roomService;
    
    @Autowired
    private VideoService videoService;

    @MessageMapping("/room/{roomId}/sync")
    @SendTo("/topic/room/{roomId}")
    public ScheduleMessage syncRoom(@DestinationVariable String roomId) {
        return roomService.getRoomById(roomId)
                .map(room -> {
                    // Create final reference for the video that will be used in lambda
                    final VideoDTO[] videoRef = {null};
                    
                    if (room.getCurrentVideo() != null) {
                        videoService.getVideoById(room.getCurrentVideo().getId())
                                .ifPresent(v -> {
                                    // Assign to array element instead of variable
                                    videoRef[0] = videoService.convertToDTO(v);
                                });
                    }
                    
                    return new ScheduleMessage(
                            "SYNC",
                            roomId,
                            videoRef[0], // Use the array element
                            room.getScheduledTime() != null ? room.getScheduledTime().toString() : null
                    );
                })
                .orElse(new ScheduleMessage("ERROR", roomId, null, null));
    }

    // Check every minute for scheduled videos that should start
    @Scheduled(fixedRate = 60000)
    public void checkScheduledVideos() {
        LocalDateTime now = LocalDateTime.now();
        
        List<String> roomsToStart = roomService.getAllRooms().stream()
                .filter(room -> room.getScheduledTime() != null && 
                        now.isAfter(room.getScheduledTime()) && 
                        now.isBefore(room.getScheduledTime().plusMinutes(1)))
                .map(room -> room.getId())
                .collect(Collectors.toList());
        
        roomsToStart.forEach(roomId -> {
            ScheduleMessage message = new ScheduleMessage("START", roomId, null, null);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
        });
    }
}
