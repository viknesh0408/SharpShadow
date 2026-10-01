package com.sharpshadow.marketplace.repository;

import com.sharpshadow.marketplace.entity.Download;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DownloadRepository extends JpaRepository<Download, Long> {
    Page<Download> findByUserIdOrderByDownloadedAtDesc(Long userId, Pageable pageable);
    List<Download> findByProductId(Long productId);
    long countByUserId(Long userId);
    Page<Download> findAllByOrderByDownloadedAtDesc(Pageable pageable);
}
