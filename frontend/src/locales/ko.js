/**
 * ko.js
 * @description 前端界面组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */

export default {
  // 공통
  common: {
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    search: '검색',
    reset: '재설정',
    submit: '제출',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    loading: '로딩 중...',
    noData: '데이터 없음',
    success: '성공',
    error: '오류',
    warning: '경고',
    info: '정보',
    yes: '예',
    no: '아니오',
    close: '닫기',
    refresh: '새로고침',
    export: '내보내기',
    import: '가져오기',
    print: '인쇄',
    view: '보기',
    detail: '상세',
    status: '상태',
    action: '작업',
    remark: '비고',
    createTime: '생성 시간',
    updateTime: '수정 시간',
    operator: '운영자',
    total: '총계',
    select: '선택',
    selectAll: '전체 선택',
    clear: '지우기',
    completed: '완료됨',
    pending: '대기 중',
    type: '유형',
    title: '제목',
    deadline: '마감일',
    handle: '처리',
    initiated: '내가 시작함',
    received: '내가 받음',
    initiator: '시작자',
    initiateTime: '시작 시간',
    drawingNo: '도면 번호',
    defaultLocation: '기본 위치',
    minStock: '최소 재고',
    maxStock: '최대 재고',
    referencePrice: '참조 가격',
    currency: '원',
    adjust: '조정'
  },

  // 네비게이션 메뉴
  menu: {
    dashboard: '대시보드',

    // 데이터 개요
    dataOverview: '데이터 개요',
    productionBoard: '생산 대시보드',
    inventoryBoard: '재고 대시보드',
    salesBoard: '판매 대시보드',
    financeBoard: '재무 대시보드',
    qualityBoard: '품질 대시보드',
    purchaseBoard: '구매 대시보드',

    // 생산 관리
    production: '생산 관리',
    productionPlan: '생산 계획',
    productionTask: '생산 작업',
    productionProcess: '생산 공정',
    productionReport: '생산 보고',

    // 기초 데이터
    baseData: '기초 데이터',
    materials: '자재 관리',
    boms: 'BOM 관리',
    customers: '고객 관리',
    suppliers: '공급업체 관리',
    categories: '카테고리 관리',
    units: '단위 관리',
    locations: '위치 관리',
    processTemplates: '공정 템플릿',

    // 재고 관리
    inventory: '재고 관리',
    stock: '재고 조회',
    inbound: '입고 관리',
    outbound: '출고 관리',
    transfer: '재고 이동',
    check: '재고 실사',
    inventoryReport: '재고 보고서',
    transaction: '거래 보고서',

    // 구매 관리
    purchase: '구매 관리',
    requisitions: '구매 요청',
    orders: '구매 주문',
    receipts: '구매 입고',
    returns: '구매 반품',
    processing: '외주 가공',
    processingReceipts: '외주 입고',

    // 판매 관리
    sales: '판매 관리',
    salesOrders: '판매 주문',
    salesOutbound: '판매 출고',
    salesReturns: '판매 반품',
    exchanges: '판매 교환',
    quotations: '견적서 통계',

    // 재무 관리
    finance: '재무 관리',
    accounts: '계정과목',
    entries: '회계 전표',
    periods: '회계 기간',
    arInvoices: '매출 청구서',
    receiptsManagement: '수금 기록',
    arAging: '매출채권 연령',
    apInvoices: '매입 청구서',
    payments: '지급 기록',
    apAging: '매입채무 연령',
    assets: '고정자산',
    assetCategories: '자산 카테고리',
    depreciation: '감가상각',
    cashierManagement: '출납 관리',
    bankAccounts: '은행 계좌',
    bankTransactions: '은행 거래',
    cashTransactions: '현금 거래',
    transactions: '거래 내역',
    reconciliation: '은행 대사',
    balanceSheet: '대차대조표',
    incomeStatement: '손익계산서',
    cashFlow: '출납보고서',

    // 품질 관리
    quality: '품질 관리',
    incoming: '입고 검사',
    processInspection: '공정 검사',
    firstArticle: '첫 번째 기사 검사',
    final: '최종 검사',
    templates: '검사 템플릿',
    traceability: '추적성 관리',

    // 장비 관리
    equipment: '장비 관리',
    equipmentList: '장비 목록',
    maintenance: '유지보수',
    inspection: '점검',
    equipmentStatus: '장비 상태',

    // 인사 관리
    hr: '인사 관리',
    employees: '직원 관리',
    attendance: '출근 관리',
    salary: '급여 관리',
    performance: '성과 관리',

    // 시스템 관리
    system: '시스템 관리',
    users: '사용자 관리',
    departments: '부서 관리',
    permissions: '권한 관리',
    print: '인쇄 설정',

    backup: '데이터 백업'
  },

  // 사용자 관련
  user: {
    profile: '프로필',
    settings: '설정',
    logout: '로그아웃',
    login: '로그인',
    username: '사용자명',
    password: '비밀번호',
    email: '이메일',
    phone: '전화번호',
    role: '역할',
    department: '부서',
    avatar: '아바타',
    name: '이름',
    realName: '실명',
    nickname: '닉네임',
    gender: '성별',
    birthday: '생일',
    address: '주소',
    bio: '자기소개',
    changePassword: '비밀번호 변경',
    oldPassword: '기존 비밀번호',
    newPassword: '새 비밀번호',
    confirmPassword: '비밀번호 확인'
  },

  // 언어 설정
  language: {
    title: '언어 설정',
    chinese: '中文',
    english: 'English',
    korean: '한국어',
    switchSuccess: '언어가 성공적으로 변경되었습니다',
    current: '현재 언어'
  },

  // 시스템 제목
  system: {
    title: ' KACON',
    welcome: '환영합니다',
    version: '버전',
    copyright: '저작권'
  },

  // 폼 검증
  validation: {
    required: '이 필드는 필수입니다',
    email: '유효한 이메일 주소를 입력하세요',
    phone: '유효한 전화번호를 입력하세요',
    password: '비밀번호는 최소 6자 이상이어야 합니다',
    confirmPassword: '비밀번호가 일치하지 않습니다',
    minLength: '최소 {min}자 이상 입력하세요',
    maxLength: '최대 {max}자까지 입력 가능합니다',
    number: '숫자를 입력하세요',
    positive: '양수를 입력하세요',
    integer: '정수를 입력하세요'
  },

  // 메시지
  message: {
    saveSuccess: '저장되었습니다',
    saveFailed: '저장에 실패했습니다',
    deleteSuccess: '삭제되었습니다',
    deleteFailed: '삭제에 실패했습니다',
    updateSuccess: '업데이트되었습니다',
    updateFailed: '업데이트에 실패했습니다',
    createSuccess: '생성되었습니다',
    createFailed: '생성에 실패했습니다',
    loginSuccess: '로그인되었습니다',
    loginFailed: '로그인에 실패했습니다',
    logoutSuccess: '로그아웃되었습니다',
    networkError: '네트워크 오류입니다. 나중에 다시 시도하세요',
    serverError: '서버 오류',
    permissionDenied: '권한이 없습니다',
    dataNotFound: '데이터를 찾을 수 없습니다',
    operationConfirm: '이 작업을 수행하시겠습니까?',
    deleteConfirm: '정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다',
    unsavedChanges: '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?'
  },

  // 페이지 제목 및 내용
  page: {
    // 대시보드
    dashboard: {
      title: '대시보드',
      managedUsers: '관리 사용자',
      todoItems: '할 일 항목',
      warningItems: '경고 항목',
      documentCount: '문서 수',
      workOverview: '업무 개요',
      personalInfo: '개인 정보',
      quickActions: '빠른 작업',
      recentActivities: '최근 활동',
      systemStatus: '시스템 상태',
      dataStatistics: '데이터 통계'
    },

    // 로그인 페이지
    login: {
      title: '로그인',
      username: '사용자명',
      password: '비밀번호',
      rememberMe: '로그인 상태 유지',
      forgotPassword: '비밀번호를 잊으셨나요?',
      loginButton: '로그인',
      welcomeBack: '다시 오신 것을 환영합니다',
      pleaseLogin: '계정에 로그인해 주세요'
    },

    // 사용자 프로필
    profile: {
      title: '프로필',
      basicInfo: '기본 정보',
      avatar: '아바타',
      username: '사용자명',
      realName: '실명',
      email: '이메일',
      phone: '전화번호',
      department: '부서',
      role: '역할',
      lastLogin: '마지막 로그인',
      changePassword: '비밀번호 변경',
      oldPassword: '기존 비밀번호',
      newPassword: '새 비밀번호',
      confirmPassword: '비밀번호 확인'
    },

    // 기초 데이터 관리
    baseData: {
      // 자재 관리
      materials: {
        title: '자재 관리',
        add: '자재 추가',
        keywordSearch: '키워드 검색',
        keywordPlaceholder: '자재 코드/이름/사양',
        category: '자재 카테고리',
        categoryPlaceholder: '카테고리를 선택하세요',
        statusPlaceholder: '상태를 선택하세요',
        enabled: '활성화',
        disabled: '비활성화',
        query: '조회',
        reset: '재설정',
        export: '내보내기',
        import: '가져오기',
        totalCount: '총 수량',
        enabledCount: '활성화 수량',
        disabledCount: '비활성화 수량',
        lowStockCount: '낮은 재고 수량',
        code: '자재 코드',
        name: '자재 이름',
        specification: '사양',
        unit: '단위',
        price: '가격',
        stock: '재고',
        safetyStock: '안전 재고',
        supplier: '공급업체',
        lastUpdate: '마지막 업데이트'
      },

      // 고객 관리
      customers: {
        title: '고객 관리',
        add: '고객 추가',
        customerCode: '고객 코드',
        customerName: '고객 이름',
        customerCodePlaceholder: '고객 코드를 입력하세요',
        customerNamePlaceholder: '고객 이름을 입력하세요',
        contact: '연락처',
        phone: '전화번호',
        address: '주소',
        level: '고객 등급',
        creditLimit: '신용 한도',
        totalCustomers: '총 고객 수',
        activeCustomers: '활성 상태',
        inactiveCustomers: '비활성 상태'
      },

      // 공급업체 관리
      suppliers: {
        title: '공급업체 관리',
        add: '공급업체 추가',
        supplierCode: '공급업체 코드',
        supplierName: '공급업체 이름',
        supplierCodePlaceholder: '공급업체 코드를 입력하세요',
        supplierNamePlaceholder: '공급업체 이름을 입력하세요',
        contact: '연락처',
        phone: '전화번호',
        address: '주소',
        level: '공급업체 등급',
        paymentTerms: '결제 조건',
        totalSuppliers: '총 공급업체 수',
        activeSuppliers: '활성 상태',
        inactiveSuppliers: '비활성 상태'
      }
    },

    // 재고 관리
    inventory: {
      title: '재고 관리',
      stock: {
        title: '재고 조회',
        materialCode: '자재 코드',
        materialName: '자재 이름',
        materialSearchPlaceholder: '자재 검색',
        currentStock: '현재 재고',
        availableStock: '사용 가능 재고',
        reservedStock: '예약 재고',
        location: '위치',
        lastUpdate: '마지막 업데이트',
        stockAdjustment: '재고 조정'
      },
      inbound: {
        title: '입고 관리',
        add: '입고 추가',
        inboundNo: '입고 번호',
        inboundType: '입고 유형',
        supplier: '공급업체',
        inboundDate: '입고 날짜',
        totalAmount: '총 금액'
      },
      outbound: {
        title: '출고 관리',
        add: '출고 추가',
        outboundNo: '출고 번호',
        outboundType: '출고 유형',
        customer: '고객',
        outboundDate: '출고 날짜',
        totalAmount: '총 금액'
      }
    },

    // 구매 관리
    purchase: {
      title: '구매 관리',
      orders: {
        title: '구매 주문',
        add: '주문 추가',
        orderNo: '주문 번호',
        orderNoPlaceholder: '주문 번호를 입력하세요',
        supplier: '공급업체',
        supplierPlaceholder: '공급업체를 선택하세요',
        orderDate: '주문 날짜',
        deliveryDate: '배송 날짜',
        totalAmount: '주문 금액',
        status: '주문 상태'
      },
      requisitions: {
        title: '구매 요청',
        add: '요청 추가',
        requisitionNo: '요청 번호',
        applicant: '신청자',
        applyDate: '신청 날짜',
        urgency: '긴급도',
        reason: '신청 사유'
      }
    },

    // 판매 관리
    sales: {
      title: '판매 관리',
      orders: {
        title: '판매 주문',
        add: '주문 추가',
        orderNo: '주문 번호',
        customer: '고객',
        orderDate: '주문 날짜',
        deliveryDate: '배송 날짜',
        totalAmount: '주문 금액',
        status: '주문 상태',
        orderNoCustomer: '주문 번호/고객',
        orderNoCustomerPlaceholder: '주문 번호/고객 이름'
      }
    },

    // 생산 관리
    production: {
      title: '생산 관리',
      plan: {
        title: '생산 계획',
        add: '계획 추가',
        planNo: '계획 번호',
        productName: '제품 이름',
        planQuantity: '계획 수량',
        startDate: '시작 날짜',
        endDate: '종료 날짜',
        status: '계획 상태'
      },
      task: {
        title: '생산 작업',
        add: '작업 추가',
        taskNo: '작업 번호',
        workOrder: '작업 지시서',
        operator: '운영자',
        startTime: '시작 시간',
        endTime: '종료 시간',
        status: '작업 상태'
      }
    }
  }
}
