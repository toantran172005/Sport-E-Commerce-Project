package com.sportecommerce.service;

import com.sportecommerce.dto.request.AddressRequest;
import com.sportecommerce.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {

    List<AddressResponse> getMyAddresses(Long userId);

    AddressResponse create(Long userId, AddressRequest request);

    AddressResponse update(Long userId, Long addressId, AddressRequest request);

    AddressResponse setDefault(Long userId, Long addressId);

    void delete(Long userId, Long addressId);
}
