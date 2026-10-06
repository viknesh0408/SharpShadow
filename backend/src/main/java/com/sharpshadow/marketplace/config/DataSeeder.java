package com.sharpshadow.marketplace.config;

import com.sharpshadow.marketplace.entity.*;
import com.sharpshadow.marketplace.repository.*;
import com.sharpshadow.marketplace.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCategories();
        seedCoupons();
        seedProducts();
    }

    @org.springframework.beans.factory.annotation.Value("${sharpshadow.admin.email:admin@sharpshadow.com}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${sharpshadow.admin.password:}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${sharpshadow.admin.name:SharpShadows Administrator}")
    private String adminName;

    private static final String CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

    private String generateSecureBootstrapPassword() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(CHAR_SET.charAt(random.nextInt(CHAR_SET.length())));
        }
        return sb.toString();
    }

    private void seedUsers() {
        String effectiveEmail = (adminEmail != null && !adminEmail.isBlank()) ? adminEmail.trim().toLowerCase() : "admin@sharpshadow.com";
        String effectiveName = (adminName != null && !adminName.isBlank()) ? adminName.trim() : "SharpShadows Administrator";

        User admin = userRepository.findByEmail(effectiveEmail).orElse(null);
        if (admin == null) {
            String initialPassword;
            if (adminPassword != null && !adminPassword.isBlank()) {
                initialPassword = adminPassword.trim();
            } else {
                initialPassword = generateSecureBootstrapPassword();
                log.warn("================================================================================");
                log.warn("SECURITY NOTICE: No ADMIN_PASSWORD configured in environment!");
                log.warn("Created initial bootstrap administrator: {}", effectiveEmail);
                log.warn("Generated temporary bootstrap password: {}", initialPassword);
                log.warn("Please log in and immediately update your password via Admin Settings.");
                log.warn("================================================================================");
            }

            admin = User.builder()
                    .name(effectiveName)
                    .email(effectiveEmail)
                    .passwordHash(passwordEncoder.encode(initialPassword))
                    .role(Role.ADMIN)
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            log.info("Primary administrator seeded for email: {}", effectiveEmail);
        } else {
            // Administrator already exists: NEVER overwrite their password on restart!
            boolean updated = false;
            if (admin.getRole() != Role.ADMIN) {
                admin.setRole(Role.ADMIN);
                updated = true;
            }
            if (!admin.isEmailVerified()) {
                admin.setEmailVerified(true);
                updated = true;
            }
            if (updated) {
                userRepository.save(admin);
            }
        }

        // Clean up legacy shadow backdoor admin account if present
        userRepository.findByEmail("admin@sharpshadows.com").ifPresent(shadowUser -> {
            if (!shadowUser.getEmail().equalsIgnoreCase(effectiveEmail)) {
                log.warn("Removing legacy shadow administrator account: {}", shadowUser.getEmail());
                userRepository.delete(shadowUser);
            }
        });
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding initial categories...");

            String[][] categoryData = {
                    {"Wedding", "Elegant invitation suites, save-the-date cards, and wedding stationery PSDs.", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"},
                    {"Business", "Professional business card templates, corporate identities, and pitch decks.", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"},
                    {"Social Media", "Modern square and vertical post templates for creative brands and creators.", "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80"},
                    {"Posters", "High-resolution typographical, artistic, and movie poster Photoshop templates.", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"},
                    {"Banners", "Web display banners, hero artwork, and marketing campaign PSDs.", "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"},
                    {"Invitations", "Luxury birthday, corporate gala, and party announcement invitation templates.", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"},
                    {"Flyers", "Club nightlife, festival, product promotion, and event flyer PSD files.", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"},
                    {"Brochures", "Bi-fold and tri-fold corporate brochure templates with print-ready CMYK.", "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"},
                    {"Restaurant", "Artisan food menu templates, table tents, and culinary promotional graphics.", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"},
                    {"Events", "Concert tickets, VIP badges, and conference presentation assets.", "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"},
                    {"Certificates", "Diploma, course completion, and achievement certificate PSD layouts.", "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80"},
                    {"YouTube", "High-CTR gaming, podcast, and vlog YouTube thumbnail PSD kits.", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"},
                    {"Instagram", "Aesthetic story layouts, carousel frameworks, and reel cover PSDs.", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"},
                    {"Miscellaneous", "Unique graphic bundles, device mockups, and experimental texture PSDs.", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"}
            };

            List<Category> categories = new ArrayList<>();
            for (String[] cat : categoryData) {
                categories.add(Category.builder()
                        .name(cat[0])
                        .slug(CategoryService.toSlug(cat[0]))
                        .description(cat[1])
                        .imageUrl(cat[2])
                        .status("ACTIVE")
                        .build());
            }
            categoryRepository.saveAll(categories);
            log.info("Seeded {} categories", categories.size());
        }
    }

    private void seedCoupons() {
        if (couponRepository.count() == 0) {
            Coupon welcome = Coupon.builder()
                    .code("SHARP20")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(BigDecimal.valueOf(20))
                    .minimumAmount(BigDecimal.valueOf(299))
                    .usageLimit(500)
                    .expiryDate(LocalDateTime.now().plusMonths(6))
                    .status("ACTIVE")
                    .timesUsed(0)
                    .build();

            Coupon flatOff = Coupon.builder()
                    .code("FIRST100")
                    .discountType(DiscountType.FIXED)
                    .discountValue(BigDecimal.valueOf(100))
                    .minimumAmount(BigDecimal.valueOf(399))
                    .usageLimit(200)
                    .expiryDate(LocalDateTime.now().plusMonths(3))
                    .status("ACTIVE")
                    .timesUsed(0)
                    .build();

            couponRepository.saveAll(List.of(welcome, flatOff));
            log.info("Seeded coupons: SHARP20, FIRST100");
        }
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {
            log.info("Seeding initial products with private PSD dummy assets...");

            // Create a dummy private PSD asset in storage/private for demonstration
            String samplePrivateFile = createDummyPsdFile();

            Category wedding = categoryRepository.findBySlug("wedding").orElse(null);
            Category business = categoryRepository.findBySlug("business").orElse(null);
            Category restaurant = categoryRepository.findBySlug("restaurant").orElse(null);
            Category social = categoryRepository.findBySlug("social-media").orElse(null);
            Category posters = categoryRepository.findBySlug("posters").orElse(null);
            Category flyers = categoryRepository.findBySlug("flyers").orElse(null);

            List<Product> products = new ArrayList<>();

            if (wedding != null) {
                products.add(Product.builder()
                        .title("Minimalist Botanical Wedding Suite PSD")
                        .slug("minimalist-botanical-wedding-suite-psd")
                        .category(wedding)
                        .description("Elevate wedding stationery with this luxury botanical suite. Features editable typography, organized layers, smart object floral elements, and print-ready bleeds for a pristine finish.")
                        .price(BigDecimal.valueOf(499.00))
                        .discountPrice(BigDecimal.valueOf(349.00))
                        .thumbnailUrl("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePrivateFile)
                        .fileName("Botanical-Wedding-Suite-V2.psd")
                        .fileSize("124.6 MB")
                        .dimensions("5 x 7 in (A5)")
                        .resolution("300 DPI")
                        .colorMode("CMYK")
                        .photoshopVersion("Photoshop CC 2020+")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(42L)
                        .build());
            }

            if (business != null) {
                products.add(Product.builder()
                        .title("Dark Luxe Holographic Business Card Mockup & Template")
                        .slug("dark-luxe-holographic-business-card")
                        .category(business)
                        .description("Contemporary dark mode business card template with realistic holographic foil layer styling. Double-sided layout with clean geometric grids.")
                        .price(BigDecimal.valueOf(299.00))
                        .discountPrice(BigDecimal.valueOf(199.00))
                        .thumbnailUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePrivateFile)
                        .fileName("Holo-Business-Card-Mockup.psd")
                        .fileSize("88.4 MB")
                        .dimensions("3.5 x 2 in")
                        .resolution("300 DPI")
                        .colorMode("CMYK")
                        .photoshopVersion("Photoshop CC 2019+")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(78L)
                        .build());
            }

            if (restaurant != null) {
                products.add(Product.builder()
                        .title("Artisan Craft Burger & Bistro Menu PSD Template")
                        .slug("artisan-craft-burger-menu-template")
                        .category(restaurant)
                        .description("Chalkboard-inspired culinary layout for craft burgers, steakhouses, and cafes. Completely editable text headers, pricing columns, and vintage engraving icons.")
                        .price(BigDecimal.valueOf(399.00))
                        .discountPrice(null)
                        .thumbnailUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePrivateFile)
                        .fileName("Craft-Bistro-Menu-Layout.psd")
                        .fileSize("156.2 MB")
                        .dimensions("8.5 x 11 in (Letter)")
                        .resolution("300 DPI")
                        .colorMode("CMYK")
                        .photoshopVersion("Photoshop CC 2021+")
                        .featured(false)
                        .status("PUBLISHED")
                        .downloadCount(31L)
                        .build());
            }

            if (social != null) {
                products.add(Product.builder()
                        .title("Cyberpunk Neon Social Media Pack (12 PSDs)")
                        .slug("cyberpunk-neon-social-media-pack")
                        .category(social)
                        .description("High-impact futuristic cyberpunk graphics crafted for electronic music producers, tech influencers, and clothing drops. Includes 12 feed posts and 12 story templates.")
                        .price(BigDecimal.valueOf(599.00))
                        .discountPrice(BigDecimal.valueOf(449.00))
                        .thumbnailUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePrivateFile)
                        .fileName("Cyberpunk-Social-Pack-12x.zip")
                        .fileSize("310.8 MB")
                        .dimensions("1080 x 1080 px & 1080 x 1920 px")
                        .resolution("72 DPI")
                        .colorMode("RGB")
                        .photoshopVersion("Photoshop CC 2020+")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(114L)
                        .build());
            }

            if (posters != null) {
                products.add(Product.builder()
                        .title("Vintage Risograph Music Festival Poster PSD")
                        .slug("vintage-risograph-music-festival-poster")
                        .category(posters)
                        .description("Authentic riso-print grain effects with separated halftone ink channels. Smart object placeholders let you drag and drop any photograph for instant retro aesthetics.")
                        .price(BigDecimal.valueOf(499.00))
                        .discountPrice(BigDecimal.valueOf(329.00))
                        .thumbnailUrl("https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePrivateFile)
                        .fileName("Risograph-Festival-Poster.psd")
                        .fileSize("198.5 MB")
                        .dimensions("24 x 36 in (A1)")
                        .resolution("300 DPI")
                        .colorMode("RGB")
                        .photoshopVersion("Photoshop CC 2020+")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(65L)
                        .build());
            }

            if (flyers != null) {
                products.add(Product.builder()
                        .title("Electro Nightclub DJ Flyer PSD Template")
                        .slug("electro-nightclub-dj-flyer-psd")
                        .category(flyers)
                        .description("Dynamic energy nightclub flyer with 3D crystal shards, particle flares, and bold typography. Everything is labeled, colored, and layered for quick customization.")
                        .price(BigDecimal.valueOf(349.00))
                        .discountPrice(BigDecimal.valueOf(249.00))
                        .thumbnailUrl("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePrivateFile)
                        .fileName("Electro-Night-DJ-Flyer.psd")
                        .fileSize("142.0 MB")
                        .dimensions("4 x 6 in")
                        .resolution("300 DPI")
                        .colorMode("CMYK")
                        .photoshopVersion("Photoshop CC 2018+")
                        .featured(false)
                        .status("PUBLISHED")
                        .downloadCount(53L)
                        .build());
            }

            List<Product> savedProducts = productRepository.saveAll(products);

            // Add preview gallery images for each product
            for (Product p : savedProducts) {
                List<ProductImage> gallery = List.of(
                        ProductImage.builder().product(p).imageUrl(p.getThumbnailUrl()).sortOrder(0).build(),
                        ProductImage.builder().product(p).imageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80").sortOrder(1).build(),
                        ProductImage.builder().product(p).imageUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80").sortOrder(2).build()
                );
                productImageRepository.saveAll(gallery);
                p.setPreviewImages(gallery);
            }

            log.info("Seeded {} products with preview galleries", savedProducts.size());
        }

        // Seed PNG Category if missing
        Category pngCat = categoryRepository.findBySlug("png-elements")
                .or(() -> categoryRepository.findBySlug("png"))
                .orElse(null);
        if (pngCat == null) {
            log.info("Seeding dedicated PNG Elements category...");
            pngCat = Category.builder()
                    .name("PNG Elements")
                    .slug("png-elements")
                    .description("Transparent background cutouts, 3D elements, typography accents, and free PNG assets.")
                    .imageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80")
                    .status("ACTIVE")
                    .build();
            pngCat = categoryRepository.save(pngCat);
        }

        // Seed PNG Products if none exist
        if (productRepository.countPngProducts() == 0 && pngCat != null) {
            log.info("Seeding initial transparent PNG products...");
            String samplePngFile = createDummyPngFile();

            List<Product> pngProducts = List.of(
                Product.builder()
                        .title("3D Glossy Holographic Geometry Isolated Elements (PNG)")
                        .slug("3d-glossy-holographic-geometry-png")
                        .category(pngCat)
                        .description("Pack of high-resolution 3D geometric shapes with pristine alpha transparent backgrounds and specular reflections. Ready for dark & light mode compositions.")
                        .price(BigDecimal.ZERO)
                        .discountPrice(BigDecimal.ZERO)
                        .thumbnailUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePngFile)
                        .fileName("3D-Holo-Shapes-Transparent.png")
                        .fileSize("34.2 MB")
                        .dimensions("4000 x 4000 px")
                        .resolution("300 DPI")
                        .colorMode("RGB (Alpha)")
                        .photoshopVersion("Transparent PNG")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(128L)
                        .build(),
                Product.builder()
                        .title("Cyberpunk Neon Glow & Light Flare Cutouts (PNG)")
                        .slug("cyberpunk-neon-glow-light-flares-png")
                        .category(pngCat)
                        .description("Vibrant hyper-glowing neon light streaks and lens flare graphics with seamless transparent alpha channels. Drop directly onto banners and social posts.")
                        .price(BigDecimal.ZERO)
                        .discountPrice(BigDecimal.ZERO)
                        .thumbnailUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePngFile)
                        .fileName("Neon-Flares-Cutouts.png")
                        .fileSize("28.6 MB")
                        .dimensions("3840 x 2160 px")
                        .resolution("300 DPI")
                        .colorMode("RGB (Alpha)")
                        .photoshopVersion("Transparent PNG")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(95L)
                        .build(),
                Product.builder()
                        .title("Botanical Floral & Greenery Isolated Leaf Cutouts (PNG)")
                        .slug("botanical-floral-greenery-leaf-cutouts-png")
                        .category(pngCat)
                        .description("Hand-extracted tropical leaves, eucalyptus sprigs, and botanical foliage on transparent backgrounds. Ideal for wedding invitations, packaging, and branding.")
                        .price(BigDecimal.ZERO)
                        .discountPrice(BigDecimal.ZERO)
                        .thumbnailUrl("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePngFile)
                        .fileName("Botanical-Leaf-Cutouts.png")
                        .fileSize("45.1 MB")
                        .dimensions("3000 x 4500 px")
                        .resolution("300 DPI")
                        .colorMode("RGB (Alpha)")
                        .photoshopVersion("Transparent PNG")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(164L)
                        .build(),
                Product.builder()
                        .title("Luxury Liquid Gold Splash & Fluid Acrylic Accent (PNG)")
                        .slug("luxury-liquid-gold-splash-fluid-png")
                        .category(pngCat)
                        .description("High-definition metallic liquid gold paint splatter and marbled fluid strokes with transparent edges. Clean alpha channel for luxury packaging.")
                        .price(BigDecimal.ZERO)
                        .discountPrice(BigDecimal.ZERO)
                        .thumbnailUrl("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80")
                        .fileUrl(samplePngFile)
                        .fileName("Liquid-Gold-Fluid-Accent.png")
                        .fileSize("52.8 MB")
                        .dimensions("4500 x 4500 px")
                        .resolution("300 DPI")
                        .colorMode("RGB (Alpha)")
                        .photoshopVersion("Transparent PNG")
                        .featured(true)
                        .status("PUBLISHED")
                        .downloadCount(210L)
                        .build()
            );

            productRepository.saveAll(pngProducts);
            log.info("Seeded {} free transparent PNG products successfully", pngProducts.size());
        }
    }

    private String createDummyPngFile() {
        try {
            Path privateDir = Paths.get("./storage/private/seed-assets").toAbsolutePath().normalize();
            Files.createDirectories(privateDir);
            Path dummyFile = privateDir.resolve("sample-asset.png");
            if (!Files.exists(dummyFile)) {
                byte[] pngHeader = new byte[] { (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
                Files.write(dummyFile, pngHeader);
            }
            return "seed-assets/sample-asset.png";
        } catch (Exception e) {
            log.warn("Could not create dummy PNG seed file: {}", e.getMessage());
            return "seed-assets/sample-asset.png";
        }
    }

    private String createDummyPsdFile() {
        try {
            Path privateDir = Paths.get("./storage/private/seed-assets").toAbsolutePath().normalize();
            Files.createDirectories(privateDir);
            Path dummyFile = privateDir.resolve("sample-asset.psd");
            if (!Files.exists(dummyFile)) {
                String dummyHeader = "8BPS\0\1\0\0\0\0\0\0\0\0SharpShadow Digital PSD Asset Archive Seed Header";
                Files.writeString(dummyFile, dummyHeader);
            }
            return "seed-assets/sample-asset.psd";
        } catch (Exception e) {
            log.warn("Could not create dummy PSD seed file: {}", e.getMessage());
            return "seed-assets/sample-asset.psd";
        }
    }
}
