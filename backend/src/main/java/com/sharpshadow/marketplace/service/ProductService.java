package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.dto.PageResponse;
import com.sharpshadow.marketplace.dto.ProductRequest;
import com.sharpshadow.marketplace.dto.ProductResponse;
import com.sharpshadow.marketplace.entity.Category;
import com.sharpshadow.marketplace.entity.OrderStatus;
import com.sharpshadow.marketplace.entity.Product;
import com.sharpshadow.marketplace.entity.ProductImage;
import com.sharpshadow.marketplace.exception.ConflictException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import com.sharpshadow.marketplace.mapper.EntityDtoMapper;
import com.sharpshadow.marketplace.repository.CategoryRepository;
import com.sharpshadow.marketplace.repository.OrderRepository;
import com.sharpshadow.marketplace.repository.ProductImageRepository;
import com.sharpshadow.marketplace.repository.ProductRepository;
import com.sharpshadow.marketplace.repository.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final OrderRepository orderRepository;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(
            String categorySlug,
            String query,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            int page,
            int size,
            Long currentUserId
    ) {
        return getProducts(categorySlug, query, minPrice, maxPrice, sortBy, null, page, size, currentUserId);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(
            String categorySlug,
            String query,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            String format,
            int page,
            int size,
            Long currentUserId
    ) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("popular".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "downloadCount");
        } else if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("title".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "title");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage;

        boolean hasFilters = StringUtils.hasText(categorySlug) || minPrice != null || maxPrice != null || StringUtils.hasText(query) || StringUtils.hasText(format);
        if (!hasFilters) {
            productPage = productRepository.findByStatus("PUBLISHED", pageable);
        } else {
            productPage = productRepository.findAll(
                    ProductSpecifications.filter(categorySlug, minPrice, maxPrice, query, format),
                    pageable
            );
        }

        return PageResponse.of(productPage.map(p -> {
            boolean purchased = currentUserId != null &&
                    orderRepository.existsByUserIdAndProductIdAndStatus(currentUserId, p.getId(), OrderStatus.PAID);
            return mapper.toProductResponse(p, purchased, false);
        }));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        Pageable pageable = PageRequest.of(0, 16, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByStatusAndFeaturedTrue("PUBLISHED", pageable).stream()
                .filter(p -> !p.isPng())
                .limit(8)
                .map(p -> mapper.toProductResponse(p, false, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getPopularProducts() {
        Pageable pageable = PageRequest.of(0, 16);
        return productRepository.findTopPopular(pageable).stream()
                .filter(p -> !p.isPng())
                .limit(8)
                .map(p -> mapper.toProductResponse(p, false, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLatestProducts() {
        Pageable pageable = PageRequest.of(0, 16, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByStatus("PUBLISHED", pageable).stream()
                .filter(p -> !p.isPng())
                .limit(8)
                .map(p -> mapper.toProductResponse(p, false, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug, Long currentUserId, boolean isAdmin) {
        Optional<Product> optionalProduct = isAdmin
                ? productRepository.findBySlug(slug)
                : productRepository.findBySlugAndStatus(slug, "PUBLISHED");

        // Fallback: If not found by slug and slug is numeric, check by primary key ID
        if (optionalProduct.isEmpty() && slug != null && slug.matches("\\d+")) {
            try {
                Long id = Long.parseLong(slug);
                optionalProduct = productRepository.findById(id);
                if (!isAdmin && optionalProduct.isPresent() && !"PUBLISHED".equals(optionalProduct.get().getStatus())) {
                    optionalProduct = Optional.empty();
                }
            } catch (NumberFormatException ignored) {
            }
        }

        Product product = optionalProduct
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with identifier: " + slug));

        boolean hasPurchased = currentUserId != null &&
                orderRepository.existsByUserIdAndProductIdAndStatus(currentUserId, product.getId(), OrderStatus.PAID);

        return mapper.toProductResponse(product, hasPurchased, isAdmin);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id, Long currentUserId, boolean isAdmin) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        boolean hasPurchased = currentUserId != null &&
                orderRepository.existsByUserIdAndProductIdAndStatus(currentUserId, product.getId(), OrderStatus.PAID);

        return mapper.toProductResponse(product, hasPurchased, isAdmin);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return productRepository.findTop4ByCategoryIdAndStatusAndIdNotOrderByCreatedAtDesc(
                product.getCategory().getId(),
                "PUBLISHED",
                productId
        ).stream().map(p -> mapper.toProductResponse(p, false, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAdminProducts(Pageable pageable) {
        Page<Product> page = productRepository.findPsdProducts(pageable);
        return PageResponse.of(page.map(p -> mapper.toProductResponse(p, false, true)));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String slug = StringUtils.hasText(request.getSlug())
                ? CategoryService.toSlug(request.getSlug())
                : CategoryService.toSlug(request.getTitle());

        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        Product product = Product.builder()
                .title(request.getTitle().trim())
                .slug(slug)
                .category(category)
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .thumbnailUrl(request.getThumbnailUrl())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .demoFileUrl(request.getDemoFileUrl())
                .demoFileName(request.getDemoFileName())
                .dimensions(request.getDimensions())
                .resolution(request.getResolution())
                .colorMode(request.getColorMode())
                .photoshopVersion(request.getPhotoshopVersion())
                .featured(Boolean.TRUE.equals(request.getFeatured()))
                .status(StringUtils.hasText(request.getStatus()) ? request.getStatus().toUpperCase() : "PUBLISHED")
                .downloadCount(0L)
                .build();

        Product saved = productRepository.save(product);

        if (request.getPreviewImages() != null && !request.getPreviewImages().isEmpty()) {
            if (saved.getPreviewImages() == null) {
                saved.setPreviewImages(new ArrayList<>());
            }
            for (int i = 0; i < request.getPreviewImages().size(); i++) {
                saved.getPreviewImages().add(ProductImage.builder()
                        .product(saved)
                        .imageUrl(request.getPreviewImages().get(i))
                        .sortOrder(i)
                        .build());
            }
            saved = productRepository.save(saved);
        }

        return mapper.toProductResponse(saved, false, true);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String newSlug = StringUtils.hasText(request.getSlug())
                ? CategoryService.toSlug(request.getSlug())
                : CategoryService.toSlug(request.getTitle());

        if (!product.getSlug().equalsIgnoreCase(newSlug) && productRepository.existsBySlug(newSlug)) {
            throw new ConflictException("Product with slug '" + newSlug + "' already exists");
        }

        product.setTitle(request.getTitle().trim());
        product.setSlug(newSlug);
        product.setCategory(category);
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());

        if (request.getThumbnailUrl() != null) product.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getFileUrl() != null) product.setFileUrl(request.getFileUrl());
        if (request.getFileName() != null) product.setFileName(request.getFileName());
        if (request.getFileSize() != null) product.setFileSize(request.getFileSize());
        product.setDemoFileUrl(request.getDemoFileUrl());
        product.setDemoFileName(request.getDemoFileName());
        if (request.getDimensions() != null) product.setDimensions(request.getDimensions());
        if (request.getResolution() != null) product.setResolution(request.getResolution());
        if (request.getColorMode() != null) product.setColorMode(request.getColorMode());
        if (request.getPhotoshopVersion() != null) product.setPhotoshopVersion(request.getPhotoshopVersion());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());
        if (request.getStatus() != null) product.setStatus(request.getStatus().toUpperCase());

        if (request.getPreviewImages() != null) {
            if (product.getPreviewImages() == null) {
                product.setPreviewImages(new ArrayList<>());
            } else {
                product.getPreviewImages().clear();
            }
            for (int i = 0; i < request.getPreviewImages().size(); i++) {
                product.getPreviewImages().add(ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getPreviewImages().get(i))
                        .sortOrder(i)
                        .build());
            }
        }

        Product updated = productRepository.save(product);
        return mapper.toProductResponse(updated, false, true);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getPngProducts(int page, int size, Long currentUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = productRepository.findPublishedPngProducts(pageable);
        return PageResponse.of(productPage.map(p -> {
            boolean purchased = currentUserId != null &&
                    orderRepository.existsByUserIdAndProductIdAndStatus(currentUserId, p.getId(), OrderStatus.PAID);
            return mapper.toProductResponse(p, purchased, false);
        }));
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAdminPngProducts(Pageable pageable) {
        Page<Product> productPage = productRepository.findPngProducts(pageable);
        return PageResponse.of(productPage.map(p -> mapper.toProductResponse(p, false, true)));
    }
}
