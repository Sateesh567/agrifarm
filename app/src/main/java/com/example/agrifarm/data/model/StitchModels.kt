package com.satish.agrifarm.data.model

data class CategoryItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val tintHex: Long,
    val iconName: String
)

data class AddressItem(
    val id: String = "",
    val label: String = "", // Farm, Home, Office
    val addressDetail: String = "",
    val recipientName: String = "",
    val phone: String = ""
)

data class SocialPost(
    val id: String = "",
    val authorName: String = "",
    val authorRole: String = "",
    val isVerified: Boolean = false,
    val content: String = "",
    val imageUrl: String = "",
    val likesCount: Int = 0,
    val commentsCount: Int = 0,
    val timeAgo: String = ""
)

data class PayoutItem(
    val id: String = "",
    val referenceId: String = "",
    val date: String = "",
    val amount: Double = 0.0
)

data class NotificationItem(
    val id: String = "",
    val category: String = "", // Orders, Harvest, Offers, Account, Security
    val title: String = "",
    val message: String = "",
    val isRead: Boolean = false,
    val timeAgo: String = "",
    val iconType: String = ""
)

data class ReviewItem(
    val id: String = "",
    val authorName: String = "",
    val rating: Int = 5,
    val timeAgo: String = "",
    val content: String = "",
    val helpfulCount: Int = 0,
    val isVerifiedPurchase: Boolean = true,
    val photosCount: Int = 0
)

data class TicketItem(
    val id: String = "",
    val title: String = "",
    val ticketNumber: String = "",
    val status: String = "" // In Progress, Resolved, Pending
)
