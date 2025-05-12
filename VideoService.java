
package com.cloud.play.app.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Service
public class VideoService {

    @Autowired
    private Cloudinary cloudinary;
    
    @Autowired
    private VideoRepository videoRepository;

    public String uploadVideo(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "video"));

        return uploadResult.get("secure_url").toString(); // Returns Cloudinary URL
    }
    
    public Optional<VideoDTO> getVideoById(String id) {
        return videoRepository.findById(id)
            .map(this::convertToDTO);
    }
    
    private VideoDTO convertToDTO(VideoEntity video) {
        VideoDTO dto = new VideoDTO();
        dto.setId(video.getId());
        dto.setTitle(video.getTitle());
        dto.setDescription(video.getDescription());
        dto.setCloudinaryUrl(video.getCloudinaryUrl());
        dto.setThumbnailUrl(video.getThumbnailUrl());
        dto.setDuration(video.getDuration());
        dto.setCreatedAt(video.getCreatedAt());
        return dto;
    }
}
