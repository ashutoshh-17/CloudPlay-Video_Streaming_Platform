
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "rooms")
public class RoomEntity {
    @Id
    private String id;
    
    private String name;
    
    private boolean isPrivate;
    
    private LocalDateTime scheduledTime;
    
    private String currentVideoId;
    
    @DBRef
    private Set<UserEntity> viewers = new HashSet<>();
    
    // Constructors
    public RoomEntity() {}
    
    public RoomEntity(String name, boolean isPrivate) {
        this.name = name;
        this.isPrivate = isPrivate;
    }
    
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
    
    public String getCurrentVideoId() {
        return currentVideoId;
    }
    
    public void setCurrentVideoId(String currentVideoId) {
        this.currentVideoId = currentVideoId;
    }
    
    public Set<UserEntity> getViewers() {
        return viewers;
    }
    
    public void setViewers(Set<UserEntity> viewers) {
        this.viewers = viewers;
    }
    
    public void addViewer(UserEntity user) {
        this.viewers.add(user);
    }
    
    public void removeViewer(UserEntity user) {
        this.viewers.remove(user);
    }
    
    public int getViewerCount() {
        return this.viewers.size();
    }
}
