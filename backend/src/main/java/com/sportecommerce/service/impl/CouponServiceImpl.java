package com.sportecommerce.service.impl;

import com.sportecommerce.repository.CouponRepository;
import com.sportecommerce.repository.CouponUsageRepository;
import com.sportecommerce.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;



}
