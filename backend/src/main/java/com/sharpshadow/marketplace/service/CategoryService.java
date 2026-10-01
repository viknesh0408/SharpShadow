package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.dto.CategoryRequest;
import com.sharpshadow.marketplace.dto.CategoryResponse;
import com.sharpshadow.marketplace.dto.PageResponse;
import com.sharpshadow.marketplace.entity.Category;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ConflictException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import com.sharpshadow.marketplace.mapper.EntityDtoMapper;
import com.sharpshadow.marketplace.repository.CategoryRepository;
import com.sharpshadow.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final EntityDtoMapper mapper;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatusOrderByCreatedAtAsc("ACTIVE").stream()
                .map(cat -> mapper.toCategoryResponse(cat, productRepository.countByCategoryId(cat.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> getAllCategories(Pageable pageable) {
        Page<Category> page = categoryRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.of(page.map(cat -> mapper.toCategoryResponse(cat, productRepository.countByCategoryId(cat.getId()))));
    }

    @Transactional(readOnly = true)
    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return mapper.toCategoryResponse(category, productRepository.countByCategoryId(category.getId()));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String slug = StringUtils.hasText(request.getSlug()) ? toSlug(request.getSlug()) : toSlug(request.getName());

        if (categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("Category with slug '" + slug + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(StringUtils.hasText(request.getStatus()) ? request.getStatus().toUpperCase() : "ACTIVE")
                .build();

        Category saved = categoryRepository.save(category);
        return mapper.toCategoryResponse(saved, 0L);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String newSlug = StringUtils.hasText(request.getSlug()) ? toSlug(request.getSlug()) : toSlug(request.getName());
        if (!category.getSlug().equalsIgnoreCase(newSlug) && categoryRepository.existsBySlug(newSlug)) {
            throw new ConflictException("Category with slug '" + newSlug + "' already exists");
        }

        category.setName(request.getName().trim());
        category.setSlug(newSlug);
        category.setDescription(request.getDescription());
        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }
        if (StringUtils.hasText(request.getStatus())) {
            category.setStatus(request.getStatus().toUpperCase());
        }

        Category updated = categoryRepository.save(category);
        return mapper.toCategoryResponse(updated, productRepository.countByCategoryId(updated.getId()));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete category with " + productCount + " active products. Please reassign or delete the products first.");
        }

        categoryRepository.delete(category);
    }

    public static String toSlug(String input) {
        if (!StringUtils.hasText(input)) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-");
    }
}
