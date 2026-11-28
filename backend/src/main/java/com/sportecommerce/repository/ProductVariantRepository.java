package com.sportecommerce.repository;

import com.sportecommerce.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    boolean existsBySku(String sku);
    List<ProductVariant> findBySku(String sku);
    List<ProductVariant> findByProduct_Id(Long productId);

    /**
     * Trừ kho nguyên tử: chỉ trừ khi còn đủ hàng. Trả về số dòng được cập nhật (0 = hết hàng).
     * Tránh race "kiểm tra rồi trừ" làm tồn kho âm khi nhiều người mua cùng lúc.
     */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE ProductVariant v SET v.stock = v.stock - :qty WHERE v.id = :id AND v.stock >= :qty")
    int decreaseStockIfEnough(@Param("id") Long id, @Param("qty") int qty);

    /** Cộng kho nguyên tử (hủy đơn / hoàn trả). */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE ProductVariant v SET v.stock = v.stock + :qty WHERE v.id = :id")
    int increaseStock(@Param("id") Long id, @Param("qty") int qty);
}
