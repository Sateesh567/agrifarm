package com.satish.agrifarm.models;

public class ProductModel {
    private String productId;
    private String ownerId;
    private String productName;
    private String category;
    private String price;
    private String quantity;
    private String description;
    private String imageUrl;

    public ProductModel() {
        // Required for Firebase
    }

    public ProductModel(String productId, String ownerId, String productName, String category, String price, String quantity, String description, String imageUrl) {
        this.productId = productId;
        this.ownerId = ownerId;
        this.productName = productName;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
