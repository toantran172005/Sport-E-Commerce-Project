package com.sportecommerce.security;

import com.sportecommerce.entity.User;
import com.sportecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Thời gian giữ thông tin người dùng trong bộ nhớ (giây). Trước đây MỌI request có JWT đều truy vấn DB để
     * nạp user; với DB ở xa (~0,7 giây/truy vấn) mỗi API tốn thêm 1 lượt. Đặt 0 để tắt cache.
     * Khóa/đổi mật khẩu/xóa tài khoản gọi evictUser() nên có hiệu lực ngay; còn lại trễ tối đa bằng TTL này.
     */
    @Value("${app.auth.principal-cache-ttl-seconds:10}")
    private long principalCacheTtlSeconds;

    private static final int MAX_CACHED_USERS = 5_000;

    private record CachedPrincipal(UserPrincipal principal, long expiresAtNanos) {
    }

    private final ConcurrentHashMap<Long, CachedPrincipal> principalCache = new ConcurrentHashMap<>();

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        return new UserPrincipal(user);
    }

    public UserDetails loadUserById(Long id) {
        long now = System.nanoTime();
        if (principalCacheTtlSeconds > 0) {
            CachedPrincipal cached = principalCache.get(id);
            if (cached != null && cached.expiresAtNanos() > now) {
                return cached.principal();
            }
        }

        User user = userRepository.findById(id)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng vơi id: " + id));
        UserPrincipal principal = new UserPrincipal(user);

        if (principalCacheTtlSeconds > 0) {
            if (principalCache.size() >= MAX_CACHED_USERS) {
                principalCache.clear();
            }
            principalCache.put(id, new CachedPrincipal(principal,
                    now + TimeUnit.SECONDS.toNanos(principalCacheTtlSeconds)));
        }
        return principal;
    }

    /** Xóa user khỏi cache để thay đổi (khóa, đổi mật khẩu, xóa...) có hiệu lực ngay trên bản này. */
    public void evictUser(Long id) {
        if (id != null) {
            principalCache.remove(id);
        }
    }
}
