package com.satish.agrifarm.data.model

enum class UserRole { FARMER, SHOP_OWNER, ADMIN }

data class User(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val role: UserRole = UserRole.FARMER,
    val address: String = "",
    val profileImage: String = "",
    val isSeller: Boolean = false,
    val isUser: Boolean = true,
    val isVerified: Boolean = false,
    // JWT tokens returned on login/register
    val accessToken: String = "",
    val refreshToken: String = ""
)
