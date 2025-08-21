package com.ranbow.restaurant.models;

public enum AdminPermission {
    // Dashboard permissions
    DASHBOARD_VIEW("儀表板查看"),
    DASHBOARD_EXPORT("儀表板數據導出"),
    
    // Menu management permissions
    MENU_VIEW("菜單查看"),
    MENU_CREATE("菜單創建"),
    MENU_UPDATE("菜單更新"),
    MENU_DELETE("菜單刪除"),
    MENU_BULK_OPERATIONS("菜單批量操作"),
    
    // Order management permissions
    ORDER_VIEW("訂單查看"),
    ORDER_UPDATE("訂單更新"),
    ORDER_CANCEL("訂單取消"),
    ORDER_ASSIGN("訂單分配"),
    
    // User management permissions
    USER_VIEW("用戶查看"),
    USER_CREATE("用戶創建"),
    USER_UPDATE("用戶更新"),
    USER_DEACTIVATE("用戶停用"),
    USER_DELETE("用戶刪除"),
    
    // Staff management permissions
    STAFF_VIEW("員工查看"),
    STAFF_CREATE("員工創建"),
    STAFF_UPDATE("員工更新"),
    STAFF_SCHEDULE("員工排班"),
    
    // Reports permissions
    REPORTS_VIEW("報表查看"),
    REPORTS_EXPORT("報表導出"),
    REPORTS_ADVANCED("高級報表"),
    
    // System settings permissions
    SETTINGS_VIEW("系統設定查看"),
    SETTINGS_UPDATE("系統設定更新"),
    SETTINGS_BACKUP("系統備份"),
    
    // Audit and security permissions
    AUDIT_VIEW("審計日誌查看"),
    SECURITY_MANAGE("安全管理"),
    
    // Super admin permissions
    SUPER_ADMIN("超級管理員");
    
    private final String displayName;
    
    AdminPermission(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}