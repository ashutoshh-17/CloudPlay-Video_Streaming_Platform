
package com.cloud.play.app.controller;

import com.cloud.play.app.dto.VideoDTO;
import com.cloud.play.app.entity.VideoEntity;
import com.cloud.play.app.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description) {
        
        try {
            // Upload video to Cloudinary and get URL
            String cloudinaryUrl = videoService.uploadVideo(file);
            
            // Create video entity with metadata
            VideoEntity video = new VideoEntity();
            video.setTitle(title);
            video.setDescription(description);
            video.setCloudinaryUrl(cloudinaryUrl);
            
            // Generate a thumbnail URL (could be enhanced with actual thumbnail generation)
            video.setThumbnailUrl(cloudinaryUrl.replace("video/upload", "video/upload/so_auto,w_400,h_225,c_fill"));
            
            // Set estimated duration (this is a placeholder, real duration detection would be better)
            video.setDuration(0); // This should be determined from the video itself
            
            video.setCreatedAt(LocalDateTime.now());
            
            // Save the video to database
            VideoEntity savedVideo = videoService.saveVideo(video);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(videoService.convertToDTO(savedVideo));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload video: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllVideos() {
        return ResponseEntity.ok(videoService.getAllVideos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVideoById(@PathVariable String id) {
        Optional<VideoEntity> video = videoService.getVideoById(id);
        return video.map(v -> ResponseEntity.ok(videoService.convertToDTO(v)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
