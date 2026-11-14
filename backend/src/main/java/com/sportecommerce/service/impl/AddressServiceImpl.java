package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.AddressRequest;
import com.sportecommerce.dto.response.AddressResponse;
import com.sportecommerce.entity.User;
import com.sportecommerce.entity.UserAddress;
import com.sportecommerce.enums.AddressType;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.UserAddressRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Sổ địa chỉ của user đang đăng nhập. Mọi thao tác đều lọc theo userId lấy từ JWT,
 * nên user không thể đọc/sửa/xóa địa chỉ của người khác.
 * Quy tắc: mỗi user có tối đa một địa chỉ mặc định; địa chỉ đầu tiên luôn là mặc định.
 */
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(AddressResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse create(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        List<UserAddress> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);

        boolean makeDefault = existing.isEmpty() || Boolean.TRUE.equals(request.getIsDefault());
        if (makeDefault) {
            clearDefault(existing);
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .recipientName(request.getRecipientName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .addressLine(request.getAddressLine().trim())
                .ward(trimToNull(request.getWard()))
                .district(trimToNull(request.getDistrict()))
                .city(request.getCity().trim())
                .country("Vietnam")
                .type(AddressType.SHIPPING)
                .isDefault(makeDefault)
                .build();
        return AddressResponse.fromEntity(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse update(Long userId, Long addressId, AddressRequest request) {
        UserAddress address = getOwnedAddress(userId, addressId);

        address.setRecipientName(request.getRecipientName().trim());
        address.setPhoneNumber(request.getPhoneNumber().trim());
        address.setAddressLine(request.getAddressLine().trim());
        address.setWard(trimToNull(request.getWard()));
        address.setDistrict(trimToNull(request.getDistrict()));
        address.setCity(request.getCity().trim());

        // Chỉ cho phép "bật" mặc định; bỏ mặc định của địa chỉ hiện hành phải làm bằng cách chọn địa chỉ khác.
        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefault(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId));
            address.setIsDefault(true);
        }
        return AddressResponse.fromEntity(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse setDefault(Long userId, Long addressId) {
        UserAddress address = getOwnedAddress(userId, addressId);
        if (!Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefault(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId));
            address.setIsDefault(true);
            addressRepository.save(address);
        }
        return AddressResponse.fromEntity(address);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long addressId) {
        UserAddress address = getOwnedAddress(userId, addressId);

        // orders.shipping_address_id là khóa ngoại bắt buộc → địa chỉ đã gắn với đơn hàng thì không xóa được.
        if (orderRepository.existsByShippingAddress_Id(addressId)) {
            throw new AppException("Địa chỉ này đã được dùng cho đơn hàng nên không thể xóa", HttpStatus.CONFLICT);
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);
        addressRepository.flush();

        if (wasDefault) {
            // Địa chỉ mặc định bị xóa → chuyển mặc định sang địa chỉ mới nhất còn lại (nếu có).
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setIsDefault(true);
                        addressRepository.save(next);
                    });
        }
    }

    private UserAddress getOwnedAddress(Long userId, Long addressId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ"));
    }

    private void clearDefault(List<UserAddress> addresses) {
        for (UserAddress a : addresses) {
            if (Boolean.TRUE.equals(a.getIsDefault())) {
                a.setIsDefault(false);
            }
        }
        addressRepository.saveAll(addresses);
        addressRepository.flush();
    }

    private String trimToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
