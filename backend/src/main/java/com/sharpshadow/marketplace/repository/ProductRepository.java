package com.sharpshadow.marketplace.repository;

import com.sharpshadow.marketplace.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySlugAndStatus(String slug, String status);
    boolean existsBySlug(String slug);
    long countByCategoryId(Long categoryId);

    Page<Product> findByStatus(String status, Pageable pageable);
    Page<Product> findByStatusAndFeaturedTrue(String status, Pageable pageable);
    Page<Product> findByCategorySlugAndStatus(String categorySlug, String status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'PUBLISHED' AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'PUBLISHED' " +
           "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug) " +
           "AND (:minPrice IS NULL OR COALESCE(p.discountPrice, p.price) >= :minPrice) " +
           "AND (:maxPrice IS NULL OR COALESCE(p.discountPrice, p.price) <= :maxPrice) " +
           "AND (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> filterProducts(
            @Param("categorySlug") String categorySlug,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("query") String query,
            Pageable pageable
    );

    List<Product> findTop4ByCategoryIdAndStatusAndIdNotOrderByCreatedAtDesc(Long categoryId, String status, Long currentProductId);

    @Query("SELECT p FROM Product p WHERE p.status = 'PUBLISHED' ORDER BY p.downloadCount DESC")
    List<Product> findTopPopular(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.category.slug) LIKE '%png%' OR LOWER(p.category.name) LIKE '%png%' OR LOWER(p.fileName) LIKE '%.png' OR UPPER(p.photoshopVersion) LIKE '%PNG%')")
    Page<Product> findPngProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE NOT " +
           "(LOWER(p.category.slug) LIKE '%png%' OR LOWER(p.category.name) LIKE '%png%' OR LOWER(p.fileName) LIKE '%.png' OR UPPER(p.photoshopVersion) LIKE '%PNG%')")
    Page<Product> findPsdProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'PUBLISHED' AND " +
           "(LOWER(p.category.slug) LIKE '%png%' OR LOWER(p.category.name) LIKE '%png%' OR LOWER(p.fileName) LIKE '%.png' OR UPPER(p.photoshopVersion) LIKE '%PNG%')")
    Page<Product> findPublishedPngProducts(Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE " +
           "(LOWER(p.category.slug) LIKE '%png%' OR LOWER(p.category.name) LIKE '%png%' OR LOWER(p.fileName) LIKE '%.png' OR UPPER(p.photoshopVersion) LIKE '%PNG%')")
    long countPngProducts();

    @Query("SELECT COALESCE(SUM(p.downloadCount), 0) FROM Product p WHERE " +
           "(LOWER(p.category.slug) LIKE '%png%' OR LOWER(p.category.name) LIKE '%png%' OR LOWER(p.fileName) LIKE '%.png' OR UPPER(p.photoshopVersion) LIKE '%PNG%')")
    long sumPngDownloads();

    @Query("SELECT COUNT(p) FROM Product p WHERE (COALESCE(p.discountPrice, p.price) <= 0) AND " +
           "(LOWER(p.category.slug) LIKE '%png%' OR LOWER(p.category.name) LIKE '%png%' OR LOWER(p.fileName) LIKE '%.png' OR UPPER(p.photoshopVersion) LIKE '%PNG%')")
    long countFreePngProducts();
}
