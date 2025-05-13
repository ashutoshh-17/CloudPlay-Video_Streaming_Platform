
package com.cloud.play.app.dto;

public class ScheduleMessage {
    private String type;
    private String roomId;
    private VideoDTO video;
    private String scheduledTime;

    public ScheduleMessage() {
    }

    public ScheduleMessage(String type, String roomId, VideoDTO video, String scheduledTime) {
        this.type = type;
        this.roomId = roomId;
        this.video = video;
        this.scheduledTime = scheduledTime;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public VideoDTO getVideo() {
        return video;
    }

    public void setVideo(VideoDTO video) {
        this.video = video;
    }

    public String getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(String scheduledTime) {
        this.scheduledTime = scheduledTime;
    }
}
