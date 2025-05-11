
import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rooms")
public class RoomEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private boolean isPrivate;
    
    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;
    
    @Column(name = "current_video_id")
    private Long currentVideoId;
    
    @ManyToMany
    @JoinTable(
        name = "room_viewers",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<UserEntity> viewers = new HashSet<>();
    
    // Constructors
    public RoomEntity() {}
    
    public RoomEntity(String name, boolean isPrivate) {
        this.name = name;
        this.isPrivate = isPrivate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
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
    
    public Long getCurrentVideoId() {
        return currentVideoId;
    }
    
    public void setCurrentVideoId(Long currentVideoId) {
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
