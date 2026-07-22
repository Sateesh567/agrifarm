package com.satish.agrifarm.util

/**
 * StringConstants — Centralized static string resources for the AgriFarm Android app.
 *
 * Purpose: Eliminate hardcoded strings scattered across UI files.
 * Future migration path: Replace with Android strings.xml / R.string.* for full i18n support.
 */
object StringConstants {

    // ── App Name ──────────────────────────────────────────────────────────
    const val APP_NAME = "AgroLink"
    const val APP_VERSION = "Version 2.4.1 (Stable Build)"

    // ── Auth Screen Titles ────────────────────────────────────────────────
    const val TITLE_FARMER_LOGIN = "Farmer Login"
    const val TITLE_SELLER_LOGIN = "Shop Owner Login"
    const val TITLE_FARMER_REGISTER = "Farmer Registration"
    const val TITLE_OWNER_REGISTER = "Shop Owner Registration"
    const val TITLE_SETTINGS = "Settings"
    const val TITLE_EDIT_PROFILE = "Edit Profile"
    const val TITLE_CUSTOMER_SUPPORT = "Customer Support"

    // ── Auth Field Labels ─────────────────────────────────────────────────
    const val LABEL_EMAIL_OR_PHONE = "Email or Phone"
    const val LABEL_EMAIL_ADDRESS = "Email Address"
    const val LABEL_PASSWORD = "Password"
    const val LABEL_CONFIRM_PASSWORD = "Confirm Password"
    const val LABEL_FULL_NAME = "Full Name"
    const val LABEL_PHONE_NUMBER = "Phone Number"
    const val LABEL_DELIVERY_ADDRESS = "Delivery Address"
    const val LABEL_OWNER_NAME = "Owner Name"
    const val LABEL_SHOP_NAME = "Shop Name"
    const val LABEL_SHOP_ADDRESS = "Shop Address"
    const val LABEL_SHOP_CATEGORY = "Shop Category (e.g. Seeds, Fertilizers, Tools)"
    const val LABEL_SHOP_DESCRIPTION = "Shop Description (Optional)"

    // ── Auth Buttons ──────────────────────────────────────────────────────
    const val BTN_LOGIN = "Login"
    const val BTN_REGISTER_NOW = "Register Now"
    const val BTN_SUBMIT_FOR_APPROVAL = "Submit for Approval"
    const val BTN_FORGOT_PASSWORD = "Forgot Password?"
    const val BTN_NO_ACCOUNT_REGISTER = "Don't have an account? Register"
    const val BTN_TAKE_PHOTO = "Take Photo"
    const val BTN_FROM_GALLERY = "From Gallery"
    const val BTN_OK = "OK"
    const val BTN_SAVE_CHANGES = "Save Changes"
    const val BTN_LOGOUT = "Logout from AgriFarm"
    const val BTN_CHANGE_PASSWORD = "Change Password"
    const val BTN_CANCEL = "Cancel"
    const val BTN_CONFIRM = "Confirm"

    // ── Validation Error Messages ─────────────────────────────────────────
    const val ERR_EMAIL_REQUIRED = "Email is required"
    const val ERR_PASSWORD_REQUIRED = "Password is required"
    const val ERR_FILL_REQUIRED_FIELDS = "Please fill all required fields"
    const val ERR_PASSWORDS_MISMATCH = "Passwords do not match"
    const val ERR_NAME_EMAIL_REQUIRED = "Name and Email are required"
    const val ERR_REGISTRATION_FAILED = "Registration failed"
    const val ERR_LOGIN_FAILED = "Login failed"
    const val ERR_PROFILE_UPDATE_FAILED = "Failed to update profile"
    const val ERR_SHOP_SUBMIT_PARTIAL = "Account created, but shop request failed: "
    const val ERR_NEW_PASSWORD_REQUIRED = "New password cannot be empty"
    const val ERR_PASSWORD_TOO_SHORT = "Password must be at least 6 characters"

    // ── Success / Info Messages ───────────────────────────────────────────
    const val MSG_PROFILE_UPDATED = "Profile updated successfully!"
    const val MSG_PASSWORD_CHANGED = "Password changed successfully!"
    const val MSG_REGISTRATION_SUBMITTED_TITLE = "Registration Submitted"
    const val MSG_REGISTRATION_SUBMITTED_BODY =
        "Your account registration and shop request have been submitted. Please wait for admin approval to log in."

    // ── Accessibility Content Descriptions ───────────────────────────────
    const val CD_BACK = "Back"
    const val CD_MENU = "Menu"
    const val CD_SEARCH = "Search"
    const val CD_LOGOUT = "Logout"
    const val CD_SHOP_IMAGE = "Shop Image"
    const val CD_PROFILE_PICTURE = "Profile Picture"

    // ── Settings Screen ───────────────────────────────────────────────────
    const val SETTINGS_PREFERENCES_HEADER = "PREFERENCES"
    const val SETTINGS_SECURITY_HEADER = "SECURITY & SUPPORT"
    const val SETTINGS_PREF_NOTIFICATIONS = "Push Notifications"
    const val SETTINGS_PREF_NOTIFICATIONS_DESC = "Alerts for crop prices & orders"
    const val SETTINGS_PREF_BIOMETRIC = "Biometric Login"
    const val SETTINGS_PREF_BIOMETRIC_DESC = "Secure access with Touch/Face ID"
    const val SETTINGS_PREF_DARK_MODE = "Dark Mode"
    const val SETTINGS_PREF_DARK_MODE_DESC = "Reduce eye strain at night"
    const val SETTINGS_MENU_ACCOUNT_SECURITY = "Account Security"
    const val SETTINGS_MENU_PRIVACY_POLICY = "Privacy Policy"
    const val SETTINGS_MENU_SUPPORT = "AgriFarm Support"
    const val SETTINGS_MENU_ABOUT = "About AgriFarm"

    // ── Change Password Dialog ────────────────────────────────────────────
    const val DIALOG_CHANGE_PASSWORD_TITLE = "Change Password"
    const val LABEL_CURRENT_PASSWORD = "Current Password"
    const val LABEL_NEW_PASSWORD = "New Password"
    const val LABEL_CONFIRM_NEW_PASSWORD = "Confirm New Password"

    // ── Language Preference ───────────────────────────────────────────────
    const val LABEL_LANGUAGE_PREFERENCE = "Language Preference"
    const val LANG_ENGLISH = "English"
    const val LANG_TELUGU = "Telugu"

    // ── Profile Screen ────────────────────────────────────────────────────
    const val LABEL_TOTAL_LAND_AREA = "Total Land Area (Acres)"
    const val LABEL_MAJOR_CROPS = "Major Crops"
    const val LABEL_ADDRESS = "Address"
    const val LABEL_EMAIL = "Email"
    const val LABEL_PHONE = "Phone Number"
    const val LABEL_NAME = "Name"

    // ── Shop Status ───────────────────────────────────────────────────────
    const val STATUS_PENDING = "PENDING"
    const val STATUS_REJECTED = "REJECTED"
    const val STATUS_APPROVED = "APPROVED"

    // ── Roles ─────────────────────────────────────────────────────────────
    const val ROLE_FARMER = "FARMER"
    const val ROLE_SHOP_OWNER = "SHOP_OWNER"

    // ── SharedPreferences Keys ────────────────────────────────────────────
    const val PREFS_FILE = "agrifarm_prefs"
    const val PREF_NOTIFICATIONS_ENABLED = "notifications_enabled"
    const val PREF_BIOMETRIC_ENABLED = "biometric_enabled"
    const val PREF_DARK_MODE_ENABLED = "dark_mode_enabled"
}
