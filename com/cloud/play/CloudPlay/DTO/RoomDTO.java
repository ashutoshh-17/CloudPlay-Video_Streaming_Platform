package com.cloud.play.CloudPlay.DTO;

import com.cloud.play.app.dto.VideoDTO;
import java.time.LocalDateTime;

public class RoomDTO {
    private String id;
    private String name;
    private VideoDTO currentVideo;
    private int viewers;
    private boolean isPrivate;
    private LocalDateTime scheduledTime;
    
    // Constructors
    public RoomDTO() {}
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public VideoDTO getCurrentVideo() {
        return currentVideo;
    }
    
    public void setCurrentVideo(VideoDTO currentVideo) {
        this.currentVideo = currentVideo;
    }
    
    public int getViewers() {
        return viewers;
    }
    
    public void setViewers(int viewers) {
        this.viewers = viewers;
    }
    
    public boolean isPrivate() {
        return isPrivate;
    }
    
    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
    
    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }
    
    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }
}
