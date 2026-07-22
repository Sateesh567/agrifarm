package com.satish.agrifarm.data.model

data class Shop(
    val id: String = "",
    val name: String = "",
    val ownerId: String = "",
    val address: String = "",
    val rating: Float = 5.0f,
    val imageUrl: String = "",
    val description: String = "",
    val category: String = "",
    val status: String = "PENDING",
    val totalReviews: Int = 0,   // NEW: review count
    val qrCodeUrl: String? = ""   // NEW: payment QR code image URL
)
