
package com.cloud.play.CloudPlay.controller;

import com.cloud.play.CloudPlay.DTO.RoomDTO;
import com.cloud.play.CloudPlay.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RoomController {

    @Autowired
    private RoomService roomService;
    
    @GetMapping
    public ResponseEntity<List<RoomDTO>> getAllRooms() {
        List<RoomDTO> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable String id) {
        return roomService.getRoomById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String videoId = (String) request.get("videoId");
        
        LocalDateTime scheduledTime = null;
        if (request.get("scheduledTime") != null) {
            try {
                scheduledTime = LocalDateTime.parse(request.get("scheduledTime").toString());
            } catch (Exception e) {
                // Ignore parsing error, keep scheduledTime as null
            }
        }
        
        boolean isPrivate = false;
        if (request.get("isPrivate") != null) {
            isPrivate = Boolean.parseBoolean(request.get("isPrivate").toString());
        }
        
        RoomDTO newRoom = roomService.createRoom(name, videoId, scheduledTime, isPrivate);
        return ResponseEntity.status(HttpStatus.CREATED).body(newRoom);
    }
    
    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinRoom(
            @PathVariable String roomId, 
            @RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        boolean success = roomService.joinRoom(roomId, userId);
        
        return success 
            ? ResponseEntity.ok().build() 
            : ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable String roomId, 
            @RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        boolean success = roomService.leaveRoom(roomId, userId);
        
        return success 
            ? ResponseEntity.ok().build() 
            : ResponseEntity.notFound().build();
    }
}
