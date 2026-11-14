package com.sportecommerce.config;

import com.sportecommerce.security.CustomUserDetailsService;
import com.sportecommerce.security.JwtAccessDeniedHandler;
import com.sportecommerce.security.JwtAuthenticationEntryPoint;
import com.sportecommerce.security.JwtAuthenticationFilter;
import com.sportecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cau hinh Spring Security: JWT stateless, BCrypt cho mat khau, CORS cho frontend.
 *
 * Ghi chu: "/api/auth/**" la nhom endpoint public duy nhat hien tai. Khi cac module
 * khac (catalog, san pham...) co controller public (vi du xem san pham khong can dang
 * nhap), can bo sung them pattern tuong ung vao PUBLIC_ENDPOINTS.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    /** Endpoint public hoàn toàn (đăng nhập/đăng ký/OTP/refresh...). logout-all được chặn riêng ở trên. */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/error"
    };

    /** Catalog: ai cũng được XEM (GET); chỉ ADMIN/STAFF được ghi (POST/PUT/PATCH/DELETE). */
    private static final String[] CATALOG_ENDPOINTS = {
            "/api/products/**",
            "/api/categories/**",
            "/api/brands/**",
            "/api/tags/**"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * KHONG danh dau @Bean o day: neu de Spring quan ly JwtAuthenticationFilter nhu mot
     * bean rieng, Spring Boot se tu dong dang ky no nhu mot servlet Filter thong thuong
     * (ServletContextInitializerBeans) BEN CANH viec Spring Security da them no qua
     * addFilterBefore ben duoi, khien filter chay 2 lan/request. Vi vay chi khoi tao truc
     * tiep va dung noi bo trong securityFilterChain().
     */
    private JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // Thứ tự rất quan trọng: rule cụ thể đặt TRƯỚC rule chung (Spring lấy rule khớp đầu tiên).
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Chỉ ADMIN (AdminUserController còn có @PreAuthorize), STAFF được vào các API quản trị khác.
                        .requestMatchers("/api/admin/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF")

                        // Cần đăng nhập (thiếu token -> 401 thay vì principal = null gây 500).
                        .requestMatchers("/api/auth/logout-all").authenticated()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers("/api/users/**", "/api/notifications/**").authenticated()
                        .requestMatchers("/api/orders/**", "/api/payments/create").authenticated()

                        // Webhook VNPay gọi từ server của VNPay -> không có JWT, được xác thực bằng chữ ký bên trong service.
                        .requestMatchers("/api/payments/webhook").permitAll()
                        .requestMatchers("/api/payments/**").authenticated()

                        // Coupon: xem + áp mã cho cả khách vãng lai; tạo/sửa/xóa chỉ ADMIN/STAFF.
                        .requestMatchers(HttpMethod.GET, "/api/coupons/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/coupons/apply").permitAll()
                        .requestMatchers("/api/coupons/**").hasAnyRole("ADMIN", "STAFF")

                        // Review: xem công khai cho cả khách vãng lai; duyệt/phản hồi/xóa chỉ ADMIN/STAFF.
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**", "/api/products/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/*/status").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/reviews/*/reply").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/*/reply").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/*").hasAnyRole("ADMIN", "STAFF")

                        .requestMatchers(HttpMethod.GET, "/api/shipments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, CATALOG_ENDPOINTS).permitAll()
                        .requestMatchers(CATALOG_ENDPOINTS).hasAnyRole("ADMIN", "STAFF")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
