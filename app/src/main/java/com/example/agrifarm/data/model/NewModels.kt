package com.satish.agrifarm.data.model

data class Review(
    val id: String = "",
    val productId: String = "",
    val userId: String = "",
    val orderId: String = "",
    val rating: Int = 5,
    val title: String = "",
    val body: String = "",
    val authorName: String = "",
    val isVerified: Boolean = true,   // verified purchase
    val helpfulCount: Int = 0,
    val createdAt: String = ""
)

data class WishlistItem(
    val id: String = "",
    val productId: String = "",
    val name: String = "",
    val price: Double = 0.0,
    val imageUrl: String = "",
    val rating: Float = 5.0f,
    val category: String = "",
    val stock: Int = 0,
    val createdAt: String = ""
)

data class NotificationItem2(
    val id: String = "",
    val userId: String = "",
    val title: String = "",
    val body: String = "",
    val type: String = "SYSTEM",  // ORDER, PAYMENT, PROMO, ALERT, SYSTEM
    val refId: String = "",
    val isRead: Boolean = false,
    val createdAt: String = ""
)
