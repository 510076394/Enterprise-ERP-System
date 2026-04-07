/**
 * en.js
 * @description 前端界面组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */

export default {
  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    view: 'View',
    detail: 'Detail',
    status: 'Status',
    action: 'Action',
    remark: 'Remark',
    createTime: 'Create Time',
    updateTime: 'Update Time',
    operator: 'Operator',
    total: 'Total',
    select: 'Select',
    selectAll: 'Select All',
    clear: 'Clear',
    completed: 'Completed',
    pending: 'Pending',
    type: 'Type',
    title: 'Title',
    deadline: 'Deadline',
    handle: 'Handle',
    initiated: 'Initiated',
    received: 'Received',
    initiator: 'Initiator',
    initiateTime: 'Initiate Time',
    drawingNo: 'Drawing No.',
    defaultLocation: 'Default Location',
    minStock: 'Min Stock',
    maxStock: 'Max Stock',
    referencePrice: 'Reference Price',
    currency: 'CNY',
    adjust: 'Adjust'
  },

  // Navigation Menu
  menu: {
    dashboard: 'Dashboard',

    // Data Overview
    dataOverview: 'Data Overview',
    productionBoard: 'Production Board',
    inventoryBoard: 'Inventory Board',
    salesBoard: 'Sales Board',
    financeBoard: 'Finance Board',
    qualityBoard: 'Quality Board',
    purchaseBoard: 'Purchase Board',

    // Production Management
    production: 'Production',
    productionPlan: 'Production Plan',
    productionTask: 'Production Task',
    productionProcess: 'Production Process',
    productionReport: 'Production Report',

    // Base Data
    baseData: 'Base Data',
    materials: 'Materials',
    boms: 'BOM Management',
    customers: 'Customers',
    suppliers: 'Suppliers',
    categories: 'Categories',
    units: 'Units',
    locations: 'Locations',
    processTemplates: 'Process Templates',

    // Inventory Management
    inventory: 'Inventory',
    stock: 'Stock Query',
    inbound: 'Inbound',
    outbound: 'Outbound',
    transfer: 'Transfer',
    check: 'Stock Check',
    inventoryReport: 'Inventory Report',
    transaction: 'Transaction Report',

    // Purchase Management
    purchase: 'Purchase',
    requisitions: 'Purchase Requisitions',
    orders: 'Purchase Orders',
    receipts: 'Purchase Receipts',
    returns: 'Purchase Returns',
    processing: 'Outsourcing',
    processingReceipts: 'Outsourcing Receipts',

    // Sales Management
    sales: 'Sales',
    salesOrders: 'Sales Orders',
    salesOutbound: 'Sales Outbound',
    salesReturns: 'Sales Returns',
    exchanges: 'Sales Exchanges',
    quotations: 'Quotation Statistics',

    // Finance Management
    finance: 'Finance',
    accounts: 'Chart of Accounts',
    entries: 'Journal Entries',
    periods: 'Accounting Periods',
    arInvoices: 'Sales Invoice',
    receiptsManagement: 'Receipt Records',
    arAging: 'AR Aging',
    apInvoices: 'Purchase Invoice',
    payments: 'Payment Records',
    apAging: 'AP Aging',
    assets: 'Fixed Assets',
    assetCategories: 'Asset Categories',
    depreciation: 'Depreciation',
    cashierManagement: 'Cashier Management',
    bankAccounts: 'Bank Accounts',
    bankTransactions: 'Bank Transactions',
    cashTransactions: 'Cash Transactions',
    transactions: 'Transactions',
    reconciliation: 'Bank Reconciliation',
    balanceSheet: 'Balance Sheet',
    incomeStatement: 'Income Statement',
    cashFlow: 'Cashier Report',

    // Quality Management
    quality: 'Quality',
    incoming: 'Incoming Inspection',
    processInspection: 'Process Inspection',
    firstArticle: 'First Article Inspection',
    final: 'Final Inspection',
    templates: 'Inspection Templates',
    traceability: 'Traceability',
    nonconforming: 'Nonconforming Products',

    // Equipment Management
    equipment: 'Equipment',
    equipmentList: 'Equipment List',
    maintenance: 'Maintenance',
    inspection: 'Inspection',
    equipmentStatus: 'Equipment Status',

    // Human Resources
    hr: 'Human Resources',
    employees: 'Employees',
    attendance: 'Attendance',
    salary: 'Salary',
    performance: 'Performance',

    // System Management
    system: 'System',
    users: 'Users',
    departments: 'Departments',
    permissions: 'Permissions',
    print: 'Print Settings',

    backup: 'Backup'
  },

  // User Related
  user: {
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    department: 'Department',
    avatar: 'Avatar',
    name: 'Name',
    realName: 'Real Name',
    nickname: 'Nickname',
    gender: 'Gender',
    birthday: 'Birthday',
    address: 'Address',
    bio: 'Bio',
    changePassword: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password'
  },

  // Language Settings
  language: {
    title: 'Language Settings',
    chinese: '中文',
    english: 'English',
    korean: '한국어',
    switchSuccess: 'Language switched successfully',
    current: 'Current Language'
  },

  // System Title
  system: {
    title: ' KACON',
    welcome: 'Welcome',
    version: 'Version',
    copyright: 'Copyright'
  },

  // Form Validation
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    password: 'Password must be at least 6 characters',
    confirmPassword: 'Passwords do not match',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed',
    number: 'Please enter a number',
    positive: 'Please enter a positive number',
    integer: 'Please enter an integer'
  },

  // Messages
  message: {
    saveSuccess: 'Saved successfully',
    saveFailed: 'Save failed',
    deleteSuccess: 'Deleted successfully',
    deleteFailed: 'Delete failed',
    updateSuccess: 'Updated successfully',
    updateFailed: 'Update failed',
    createSuccess: 'Created successfully',
    createFailed: 'Create failed',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    logoutSuccess: 'Logout successful',
    networkError: 'Network error, please try again later',
    serverError: 'Server error',
    permissionDenied: 'Permission denied',
    dataNotFound: 'Data not found',
    operationConfirm: 'Are you sure you want to perform this operation?',
    deleteConfirm: 'Are you sure you want to delete? This action cannot be undone',
    unsavedChanges: 'You have unsaved changes, are you sure you want to leave?'
  },

  // Page titles and content
  page: {
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      managedUsers: 'Managed Users',
      todoItems: 'Todo Items',
      warningItems: 'Warning Items',
      documentCount: 'Document Count',
      workOverview: 'Work Overview',
      personalInfo: 'Personal Info',
      quickActions: 'Quick Actions',
      recentActivities: 'Recent Activities',
      systemStatus: 'System Status',
      dataStatistics: 'Data Statistics'
    },

    // Login page
    login: {
      title: 'Login',
      username: 'Username',
      password: 'Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      loginButton: 'Login',
      welcomeBack: 'Welcome Back',
      pleaseLogin: 'Please login to your account'
    },

    // User profile
    profile: {
      title: 'Profile',
      basicInfo: 'Basic Information',
      avatar: 'Avatar',
      username: 'Username',
      realName: 'Real Name',
      email: 'Email',
      phone: 'Phone',
      department: 'Department',
      role: 'Role',
      lastLogin: 'Last Login',
      changePassword: 'Change Password',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password'
    },

    // Base Data Management
    baseData: {
      // Materials Management
      materials: {
        title: 'Materials Management',
        add: 'Add Material',
        keywordSearch: 'Keyword Search',
        keywordPlaceholder: 'Material Code/Name/Specification',
        category: 'Material Category',
        categoryPlaceholder: 'Please select category',
        statusPlaceholder: 'Please select status',
        enabled: 'Enabled',
        disabled: 'Disabled',
        query: 'Query',
        reset: 'Reset',
        export: 'Export',
        import: 'Import',
        totalCount: 'Total Count',
        enabledCount: 'Enabled Count',
        disabledCount: 'Disabled Count',
        lowStockCount: 'Low Stock Count',
        code: 'Material Code',
        name: 'Material Name',
        specification: 'Specification',
        unit: 'Unit',
        price: 'Price',
        stock: 'Stock',
        safetyStock: 'Safety Stock',
        supplier: 'Supplier',
        lastUpdate: 'Last Update'
      },

      // Customer Management
      customers: {
        title: 'Customer Management',
        add: 'Add Customer',
        customerCode: 'Customer Code',
        customerName: 'Customer Name',
        customerCodePlaceholder: 'Enter customer code',
        customerNamePlaceholder: 'Enter customer name',
        contact: 'Contact',
        phone: 'Phone',
        address: 'Address',
        level: 'Customer Level',
        creditLimit: 'Credit Limit',
        totalCustomers: 'Total Customers',
        activeCustomers: 'Active Status',
        inactiveCustomers: 'Inactive Status'
      },

      // Supplier Management
      suppliers: {
        title: 'Supplier Management',
        add: 'Add Supplier',
        supplierCode: 'Supplier Code',
        supplierName: 'Supplier Name',
        supplierCodePlaceholder: 'Enter supplier code',
        supplierNamePlaceholder: 'Enter supplier name',
        contact: 'Contact',
        phone: 'Phone',
        address: 'Address',
        level: 'Supplier Level',
        paymentTerms: 'Payment Terms',
        totalSuppliers: 'Total Suppliers',
        activeSuppliers: 'Active Status',
        inactiveSuppliers: 'Inactive Status'
      }
    },

    // Inventory Management
    inventory: {
      title: 'Inventory Management',
      stock: {
        title: 'Stock Query',
        materialCode: 'Material Code',
        materialName: 'Material Name',
        materialSearchPlaceholder: 'Search materials',
        currentStock: 'Current Stock',
        availableStock: 'Available Stock',
        reservedStock: 'Reserved Stock',
        location: 'Location',
        lastUpdate: 'Last Update',
        stockAdjustment: 'Stock Adjustment'
      },
      inbound: {
        title: 'Inbound Management',
        add: 'Add Inbound',
        inboundNo: 'Inbound No.',
        inboundType: 'Inbound Type',
        supplier: 'Supplier',
        inboundDate: 'Inbound Date',
        totalAmount: 'Total Amount'
      },
      outbound: {
        title: 'Outbound Management',
        add: 'Add Outbound',
        outboundNo: 'Outbound No.',
        outboundType: 'Outbound Type',
        customer: 'Customer',
        outboundDate: 'Outbound Date',
        totalAmount: 'Total Amount'
      }
    },

    // Purchase Management
    purchase: {
      title: 'Purchase Management',
      orders: {
        title: 'Purchase Orders',
        add: 'Add Order',
        orderNo: 'Order No.',
        orderNoPlaceholder: 'Enter order number',
        supplier: 'Supplier',
        supplierPlaceholder: 'Select supplier',
        orderDate: 'Order Date',
        deliveryDate: 'Delivery Date',
        totalAmount: 'Order Amount',
        status: 'Order Status'
      },
      requisitions: {
        title: 'Purchase Requisitions',
        add: 'Add Requisition',
        requisitionNo: 'Requisition No.',
        applicant: 'Applicant',
        applyDate: 'Apply Date',
        urgency: 'Urgency',
        reason: 'Apply Reason'
      }
    },

    // Sales Management
    sales: {
      title: 'Sales Management',
      orders: {
        title: 'Sales Orders',
        add: 'Add Order',
        orderNo: 'Order No.',
        customer: 'Customer',
        orderDate: 'Order Date',
        deliveryDate: 'Delivery Date',
        totalAmount: 'Order Amount',
        status: 'Order Status',
        orderNoCustomer: 'Order No./Customer',
        orderNoCustomerPlaceholder: 'Order No./Customer Name'
      }
    },

    // Production Management
    production: {
      title: 'Production Management',
      plan: {
        title: 'Production Plan',
        add: 'Add Plan',
        planNo: 'Plan No.',
        productName: 'Product Name',
        planQuantity: 'Plan Quantity',
        startDate: 'Start Date',
        endDate: 'End Date',
        status: 'Plan Status'
      },
      task: {
        title: 'Production Task',
        add: 'Add Task',
        taskNo: 'Task No.',
        workOrder: 'Work Order',
        operator: 'Operator',
        startTime: 'Start Time',
        endTime: 'End Time',
        status: 'Task Status'
      }
    }
  }
}
