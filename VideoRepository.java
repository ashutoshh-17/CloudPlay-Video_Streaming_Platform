
package com.cloud.play.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends MongoRepository<VideoEntity, String> {
    // You can add custom query methods here if needed
}
