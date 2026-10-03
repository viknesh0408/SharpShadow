package com.sharpshadow.marketplace.repository;

import com.sharpshadow.marketplace.entity.Product;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecifications {

    public static Specification<Product> filter(
            String categorySlug,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String query
    ) {
        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always enforce PUBLISHED status for public user catalog
            predicates.add(cb.equal(root.get("status"), "PUBLISHED"));

            if (StringUtils.hasText(categorySlug)) {
                predicates.add(cb.equal(cb.lower(root.get("category").get("slug")), categorySlug.trim().toLowerCase()));
            }

            if (minPrice != null) {
                Expression<BigDecimal> effectivePrice = cb.coalesce(root.get("discountPrice"), root.get("price"));
                predicates.add(cb.greaterThanOrEqualTo(effectivePrice, minPrice));
            }

            if (maxPrice != null) {
                Expression<BigDecimal> effectivePrice = cb.coalesce(root.get("discountPrice"), root.get("price"));
                predicates.add(cb.lessThanOrEqualTo(effectivePrice, maxPrice));
            }

            if (StringUtils.hasText(query)) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                Predicate catMatch = cb.like(cb.lower(root.get("category").get("name")), pattern);
                predicates.add(cb.or(titleMatch, descMatch, catMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
