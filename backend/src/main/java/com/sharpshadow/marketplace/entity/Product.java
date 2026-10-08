package com.sharpshadow.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountPrice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(length = 500)
    private String fileUrl;

    @Column(length = 255)
    private String fileName;

    @Column(length = 50)
    private String fileSize;

    @Column(length = 500)
    private String demoFileUrl;

    @Column(length = 255)
    private String demoFileName;

    @Column(length = 100)
    private String dimensions;

    @Column(length = 50)
    private String resolution;

    @Column(length = 50)
    private String colorMode;

    @Column(length = 100)
    private String photoshopVersion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PUBLISHED"; // PUBLISHED, DRAFT, ARCHIVED

    @Column(nullable = false)
    @Builder.Default
    private Long downloadCount = 0L;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductImage> previewImages = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean isFree() {
        BigDecimal effective = discountPrice != null ? discountPrice : price;
        return effective != null && effective.compareTo(BigDecimal.ZERO) <= 0;
    }

    public boolean isPng() {
        if (category != null && category.getSlug() != null &&
                (category.getSlug().contains("png") || category.getName().toLowerCase().contains("png"))) {
            return true;
        }
        if (fileName != null && fileName.toLowerCase().endsWith(".png")) {
            return true;
        }
        if (photoshopVersion != null && photoshopVersion.toUpperCase().contains("PNG")) {
            return true;
        }
        return false;
    }

    public String getFileFormat() {
        return isPng() ? "PNG" : "PSD";
    }
}
