package com.satish.agrifarm.data.model

data class Product(
    val id: String = "",
    val shopId: String = "",
    val name: String = "",
    val category: String = "",   // Seeds, Fertilizers, Pesticides, Weed Killers, Tools, Other
    val price: Double = 0.0,
    val stock: Int = 0,
    val description: String = "",
    val imageUrl: String = "",
    val usageInstructions: String = "",
    val rating: Float = 5.0f,
    val totalReviews: Int = 0,   // NEW: review count
    val isActive: Boolean = true,
    val isWishlisted: Boolean = false,  // NEW: client-side wishlist state
    val shopName: String? = "",  // NEW: associated shop name
    val imageUrls: List<String> = emptyList()
) {
    fun getProductImageUrls(): List<String> {
        return if (imageUrls.isNotEmpty()) imageUrls else if (imageUrl.isNotEmpty()) listOf(imageUrl) else emptyList()
    }
}
