
package com.cloud.play.CloudPlay.service;

import com.cloud.play.CloudPlay.DTO.RoomDTO;
import com.cloud.play.CloudPlay.entity.RoomEntity;
import com.cloud.play.CloudPlay.entity.UserEntity;
import com.cloud.play.CloudPlay.repository.RoomRepository;
import com.cloud.play.CloudPlay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private VideoService videoService;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Optional<RoomDTO> getRoomById(String id) {
        return roomRepository.findById(id)
            .map(this::convertToDTO);
    }
    
    public RoomDTO createRoom(String name, String videoId, LocalDateTime scheduledTime, boolean isPrivate) {
        RoomEntity room = new RoomEntity();
        room.setName(name);
        room.setCurrentVideoId(videoId);
        room.setScheduledTime(scheduledTime);
        room.setPrivate(isPrivate);
        
        RoomEntity savedRoom = roomRepository.save(room);
        return convertToDTO(savedRoom);
    }
    
    public boolean joinRoom(String roomId, String userId) {
        Optional<RoomEntity> roomOpt = roomRepository.findById(roomId);
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        
        if (roomOpt.isPresent() && userOpt.isPresent()) {
            RoomEntity room = roomOpt.get();
            UserEntity user = userOpt.get();
            
            room.addViewer(user);
            roomRepository.save(room);
            return true;
        }
        
        return false;
    }
    
    public boolean leaveRoom(String roomId, String userId) {
        Optional<RoomEntity> roomOpt = roomRepository.findById(roomId);
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        
        if (roomOpt.isPresent() && userOpt.isPresent()) {
            RoomEntity room = roomOpt.get();
            UserEntity user = userOpt.get();
            
            room.removeViewer(user);
            roomRepository.save(room);
            return true;
        }
        
        return false;
    }
    
    private RoomDTO convertToDTO(RoomEntity room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setViewers(room.getViewerCount());
        dto.setPrivate(room.isPrivate());
        dto.setScheduledTime(room.getScheduledTime());
        
        // Set current video if exists
        if (room.getCurrentVideoId() != null) {
            videoService.getVideoById(room.getCurrentVideoId())
                .ifPresent(video -> dto.setCurrentVideo(videoService.convertToDTO(video)));
        }
        
        return dto;
    }
}
