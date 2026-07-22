package com.satish.agrifarm.data.model

import com.google.gson.annotations.SerializedName

data class MandiItem(
    val id: String = "",
    @SerializedName("crop_name") val cropName: String = "",
    val variety: String = "",
    @SerializedName("min_price") val minPrice: Double = 0.0,
    @SerializedName("max_price") val maxPrice: Double = 0.0,
    @SerializedName("price_change") val priceChange: Double = 0.0,
    val trend: String = "STABLE",
    val district: String = ""
)

data class DiseaseInfo(
    val id: String = "",
    @SerializedName("crop_name") val crop: String = "",
    @SerializedName("disease_name") val name: String = "",
    @SerializedName("scientific_name") val scientificName: String = "",
    val confidence: Int = 90,
    val severity: String = "MEDIUM",
    val description: String = "",
    val symptoms: List<String> = emptyList(),
    val solutions: List<String> = emptyList(),
    @SerializedName("recommended_product_name") val recommendedProductName: String = "",
    @SerializedName("recommended_product_price") val recommendedProductPrice: String = "",
    @SerializedName("recommended_product_category") val recommendedProductCategory: String = ""
)

data class WeatherForecastEntry(
    val id: String = "",
    @SerializedName("day_name") val dayName: String = "",
    val temp: String = "",
    @SerializedName("condition_icon") val conditionIcon: String = "",
    @SerializedName("is_alert") val isAlert: Boolean = false,
    val location: String = "Kumbakonam, Tamil Nadu",
    @SerializedName("temp_celsius") val tempCelsius: Int = 32,
    @SerializedName("condition_text") val conditionText: String = "Sunny Interval"
)
