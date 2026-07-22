// admin-portal/src/constants.js
// Centralized string constants for the Admin Portal.
// Fix 3: Eliminates hardcoded strings across all admin pages.

export const ADMIN_CONSTANTS = {
  // ── App Info ─────────────────────────────────────────────────
  APP_NAME: 'AgriFarm Admin',
  APP_SUBTITLE: 'Sign in to access the admin dashboard',
  PLATFORM_VERSION: 'AgriFarm v2.0',
  PORTAL_TECH: 'React 18 + Vite',
  BACKEND_TECH: 'Node.js + Express',
  DATABASE_TECH: 'MySQL 8.x (XAMPP)',
  AUTH_TECH: 'JWT + bcrypt',

  // ── Login Page ────────────────────────────────────────────────
  LOGIN_EMAIL_LABEL: 'Email Address',
  LOGIN_PASSWORD_LABEL: 'Password',
  LOGIN_EMAIL_PLACEHOLDER: 'admin@agrifarm.com',
  LOGIN_PASSWORD_PLACEHOLDER: '••••••••',
  LOGIN_BTN_LOADING: '⏳ Signing in…',
  LOGIN_BTN_DEFAULT: '🔐 Sign In',
  LOGIN_HINT_LABEL: 'Dev credentials:',
  LOGIN_ACCESS_DENIED: 'Access denied: Admin credentials required',

  // ── Sidebar / Nav Labels ──────────────────────────────────────
  NAV_OVERVIEW: 'Overview',
  NAV_SHOPS: 'Shop Management',
  NAV_PRODUCTS: 'Product Catalog',
  NAV_ORDERS: 'Orders',
  NAV_USERS: 'User Accounts',
  NAV_CONTENT: 'Content Manager',
  NAV_ANALYTICS: 'Analytics',
  NAV_AUDIT: 'Audit Logs',
  NAV_SETTINGS: 'Settings',

  // ── Settings Page ─────────────────────────────────────────────
  SETTINGS_TITLE: 'Settings',
  SETTINGS_SUBTITLE: 'Configure admin portal and platform settings',
  SETTINGS_SECTIONS: ['Profile', 'Security', 'Notifications', 'Platform', 'About'],

  // Settings – Profile
  SETTINGS_PROFILE_TITLE: 'Admin Profile',
  SETTINGS_PROFILE_DESC: 'Update your administrator profile and display name',
  SETTINGS_PROFILE_DISPLAY_NAME: 'Display Name',
  SETTINGS_PROFILE_EMAIL: 'Email',
  SETTINGS_PROFILE_EMAIL_HINT: 'Email cannot be changed here. Contact system admin.',
  SETTINGS_SAVE_BTN: '💾 Save Changes',
  SETTINGS_SAVED_BTN: '✅ Saved!',
  SETTINGS_SAVING_BTN: '⏳ Saving…',

  // Settings – Security
  SETTINGS_SECURITY_TITLE: 'Authentication',
  SETTINGS_SECURITY_DESC: 'JWT token and security configuration',
  SETTINGS_RATE_LIMIT_TITLE: 'Rate Limiting',
  SETTINGS_RATE_LIMIT_DESC: 'API rate limit configuration (set in .env)',
  SETTINGS_CHANGE_PASSWORD_TITLE: 'Change Admin Password',
  SETTINGS_CHANGE_PASSWORD_DESC: 'Update your login password. You will remain logged in.',
  SETTINGS_NEW_PASSWORD_LABEL: 'New Password',
  SETTINGS_CONFIRM_PASSWORD_LABEL: 'Confirm New Password',
  SETTINGS_CHANGE_PASSWORD_BTN: '🔑 Update Password',
  SETTINGS_CHANGE_PASSWORD_LOADING: '⏳ Updating…',

  // Settings – Platform
  SETTINGS_PLATFORM_TITLE: 'Appearance',
  SETTINGS_PLATFORM_DESC: 'Configure the admin portal visual theme',
  SETTINGS_DARK_MODE_TITLE: 'Dark Mode',
  SETTINGS_DARK_MODE_DESC: 'Use dark color scheme for the admin interface',
  SETTINGS_BACKEND_CONFIG_TITLE: 'Backend Configuration',
  SETTINGS_BACKEND_CONFIG_DESC: 'Current server connection settings',
  SETTINGS_API_URL_LABEL: 'Backend API URL',
  SETTINGS_PORTAL_URL_LABEL: 'Admin Portal URL',
  SETTINGS_DB_LABEL: 'Database',
  SETTINGS_ENV_HINT: 'To change these settings, edit <code>backend-server/.env</code> and restart the server.',

  // Settings – Notifications
  SETTINGS_NOTIF_TITLE: 'Notification Preferences',
  SETTINGS_NOTIF_DESC: 'Configure which events trigger admin notifications',
  SETTINGS_NOTIF_SHOP_REG: 'New Shop Registration',
  SETTINGS_NOTIF_SHOP_REG_DESC: 'Alert when a new shop registers and needs approval',
  SETTINGS_NOTIF_LOW_STOCK: 'Low Stock Alerts',
  SETTINGS_NOTIF_LOW_STOCK_DESC: 'Alert when a product stock falls below 10 units',
  SETTINGS_NOTIF_NEW_USERS: 'New User Registrations',
  SETTINGS_NOTIF_NEW_USERS_DESC: 'Alert when new farmers or sellers register',
  SETTINGS_NOTIF_ORDER_ANOMALY: 'Order Anomalies',
  SETTINGS_NOTIF_ORDER_ANOMALY_DESC: 'Alert on unusual order patterns or cancelled orders',
  SETTINGS_NOTIF_PREFS_KEY: 'agrifarm_notif_prefs',

  // Settings – About
  SETTINGS_ABOUT_TITLE: 'AgriFarm Platform',
  SETTINGS_ABOUT_DESC: 'Version and system information',
  SETTINGS_TEST_CREDS_TITLE: 'Test Credentials Info',
  SETTINGS_TEST_CREDS_DESC: 'Development credentials are defined and salted dynamically during database initialization.',
  SETTINGS_TEST_CREDS_HINT: 'Credentials for Admin, Farmer, and Seller accounts are configured in the setup_db.js configuration file.',

  // ── User Accounts Page ────────────────────────────────────────
  USERS_TITLE: 'User Accounts',
  USERS_SUBTITLE: 'Manage registered farmers, sellers, and administrators',
  USERS_ADD_BTN: '➕ Add User',
  USERS_EXPORT_BTN: '📥 Export CSV',
  USERS_SEARCH_PLACEHOLDER: 'Search by name, email…',
  USERS_COL_NAME: 'User',
  USERS_COL_ROLE: 'Role',
  USERS_COL_STATUS: 'Status',
  USERS_COL_JOINED: 'Joined',
  USERS_COL_ACTIONS: 'Actions',
  USERS_EMPTY: 'No users found matching the criteria.',
  USERS_MODAL_ADD_TITLE: '➕ Register New User',
  USERS_MODAL_EDIT_TITLE: '✏️ Edit User',
  USERS_BLOCK_TITLE: '🚫 Block User',
  USERS_RESET_PW_TITLE: '🔑 Reset Password',
  USERS_DEFAULT_PASSWORD_MSG: 'User registered! Default password: agrifarm@123',

  // ── General ───────────────────────────────────────────────────
  BTN_SAVE: '💾 Save',
  BTN_CANCEL: 'Cancel',
  BTN_CLOSE: 'Close',
  BTN_SAVING: '⏳ Saving…',
  BTN_DELETE: '🗑️ Delete',
  BTN_BLOCK: '🚫 Block',
  BTN_UNBLOCK: '✅ Unblock',
  BTN_RESET_PW: '🔑 Reset Password',
  ERR_BLOCK_REASON: 'Please provide a reason',
  ERR_LOAD_FAILED: 'Failed to load data: ',
  LABEL_FULL_NAME: 'Full Name *',
  LABEL_EMAIL: 'Email *',
  LABEL_PHONE: 'Phone',
  LABEL_ROLE: 'Role *',
  LABEL_ADDRESS: 'Address',
  LABEL_NEW_PASSWORD: 'New Password (min 6 chars)',
}
