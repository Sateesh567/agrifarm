package com.satish.agrifarm.data.model

/**
 * Order status follows a strict state machine:
 * PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
 *         ↘ CANCELLED (before SHIPPED)
 *                                    DELIVERED → RETURN_REQUESTED → REFUNDED
 */
enum class OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    RETURN_REQUESTED,
    REFUNDED
}

data class Order(
    val orderId: String = "",
    val farmerUid: String = "",
    val buyerId: String = "",            // backward compat alias
    val shopId: String = "",
    val items: List<CartItem> = emptyList(),
    val subtotal: Double = 0.0,
    val totalAmount: Double = 0.0,
    val deliveryAddress: String = "",    // NEW: required for placing orders
    val status: OrderStatus = OrderStatus.PENDING,
    val notes: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val shopName: String? = "",
    val shopQrCode: String? = ""
)

data class CartItem(
    val productId: String = "",
    val productName: String = "",
    val quantity: Int = 0,
    val price: Double = 0.0,
    val shopName: String? = ""
)
