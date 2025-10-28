export type Language = 'tr' | 'en';
export type TranslationKey = keyof typeof translations['tr'];

export const translations = {
  tr: {
    // Header
    features: "Özellikler",
    dashboard: "Dashboard",
    integrations: "Entegrasyonlar", 
    contact: "İletişim",
    login: "Giriş",
    startFree: "Ücretsiz Başla",
    testMode: "Test Modu",
    profile: "Profil",
    settings: "Ayarlar",
    
    // Hero
    heroTitle: "E-ticaret İşletmeniz İçin",
    heroSubtitle: "AI Destekli Büyüme Ortağı",
    heroDescription: "Shopify, Meta, Google ve TikTok verilerinizi tek platformda birleştirin. Pazarlama kararlarınızı AI ile otomatikleştirin ve karlılığınızı artırın.",
    
    // Navigation
    getStarted: "Başlayın",
    switchLanguage: "Dil Değiştir",
    selectLanguage: "Dil Seçin",
    logout: "Çıkış",
    
    // Dashboard specific
    performanceOverview: "Performans Genel Bakış",
    topCampaigns: "En İyi Kampanyalar",
    recentActivities: "Son Aktiviteler",
    quickActions: "Hızlı Aksiyonlar",
    revenueTrend: "Gelir Trendi",
    conversionTrend: "Dönüşüm Trendi",
    comparative: "Karşılaştırmalı",
    previous: "Önceki",
    compare: "Karşılaştır",
    allChannels: "Tüm Kanallar",
    dateRange: "Tarih Aralığı",
    filter: "Filtre",
    
    // Dashboard KPIs
    totalRevenue: "Toplam Gelir",
    adSpend: "Reklam Harcaması",
    avgRoas: "Ortalama ROAS",
    totalConversions: "Toplam Dönüşüm",
    
    // Dashboard sections
    kpiAnalysis: "KPI Analizi",
    aiRecommendations: "AI Önerileri",
    performanceChart: "Performans Grafiği",
    channelBreakdown: "Kanal Dağılımı",
    
    // Common dashboard terms
    last7Days: "Son 7 Gün",
    last30Days: "Son 30 Gün", 
    last90Days: "Son 90 Gün",
    custom: "Özel",
    
    // Status and alerts
    loginRequired: "Giriş Gerekli",
    pleaseLogin: "Devam etmek için lütfen giriş yapın",
    loading: "Yükleniyor",
    error: "Hata",
    
    // AI Assistant
    aiAssistant: "AI Asistan",
    askQuestion: "Soru sorun...",
    send: "Gönder",
    
    // Navigation categories
    general: "Genel",
    analysis: "Analiz",
    management: "Yönetim", 
    configuration: "Yapılandırma",
    channels: "Kanallar",
    cro: "CRO",
    strategy: "Strateji",
    helper: "Yardımcı",
    automation: "Otomasyon",
    
    // Additional terms
    performance: "performans",
    systemActive: "Sistem Aktif",
    
    // Dashboard specific translations
    genelBakış: "Genel Bakış",
  store: "Mağaza",
    
    // KPI translations
  conversions: "Dönüşümler",
  revenue: "Gelir",
  orders: "Sipariş",
  aov: "Ortalama Sepet",

  // Meta widgets
  spend: "Harcama",
  impressions: "Gösterimler",
  clicks: "Tıklamalar",
  ctr: "CTR",
  cpc: "TBM (CPC)",
  cpm: "BGBM (CPM)",
  metaAds: "Meta Ads",
  googleAds: "Google Ads",
  newUsers: "Yeni Kullanıcılar",
  activeUsers: "Aktif Kullanıcılar",

  // CEO KPIs
  netProfit: "Net Kâr",
  grossProfit: "Brüt Kâr",
  profitMargin: "Kâr Marjı",

  // Pie selectors
  revenueVsAdSpend: "Gelir vs Reklam Harcaması",
  ordersVsClicks: "Sipariş vs Tıklama",
  newVsActive: "Yeni vs Aktif",
  sessionsVsEvents: "Oturum vs Olay",
  chartData: "Grafik Verisi",
    
    // Action Center
    todaysInsight: "Bugünün İçgörüsü",
    opportunity: "Fırsat",
    confidence: "güven",
    potential: "potansiyel",
    viewDetails: "Detayları Gör",
    teamTasks: "Ekip Görevleri",
    actionCenter: "Aksiyon Merkezi",
    actionableItems: "Eyleme Geçirilebilir Öğeler",
    impact: "Etki",
    apply: "Uygula",
    anomaliesAndAlerts: "Anormallikler ve Uyarılar",
    inspect: "İncele",
    automatedActions: "Otomatik Aksiyonlar",
    completed: "Tamamlandı",
    
    // Navigation items
    attributionModule: "Atıflandırma Modülü",
    profitabilityPanel: "Kârlılık Paneli",
    croCenter: "CRO Merkezi",
    marketAnalysis: "Pazar Analizi", 
    competitorAnalysis: "Rakip Analizi",
    customers: "Müşteriler",
    products: "Ürünler",
    campaigns: "Kampanyalar",
    collaborations: "İş Birlikleri",
    strategyPlanning: "Strateji ve Planlama",
    creative: "Kreatif",
    reports: "Raporlar",
    opportunitiesActions: "Fırsatlar ve Aksiyonlar",
    autopilot: "Otopilot"
  },
  en: {
    // Header
    features: "Features",
    dashboard: "Dashboard",
    integrations: "Integrations", 
    contact: "Contact",
    login: "Login",
    startFree: "Start Free",
    testMode: "Test Mode",
    
    // Hero
    heroTitle: "For Your E-commerce Business",
    heroSubtitle: "AI-Powered Growth Partner",
    heroDescription: "Unify your Shopify, Meta, Google and TikTok data in one platform. Automate your marketing decisions with AI and boost your profitability.",
    
    // Navigation
    getStarted: "Get Started",
    switchLanguage: "Switch Language",
    selectLanguage: "Select Language",
    logout: "Logout",
    
    // Dashboard specific
    performanceOverview: "Performance Overview",
    topCampaigns: "Top Campaigns",
    recentActivities: "Recent Activities",
    quickActions: "Quick Actions",
    revenueTrend: "Revenue Trend",
    conversionTrend: "Conversion Trend",
    comparative: "Comparative",
    previous: "Previous",
    compare: "Compare",
    allChannels: "All Channels",
    dateRange: "Date Range",
    filter: "Filter",
    
    // Dashboard KPIs
    totalRevenue: "Total Revenue",
    adSpend: "Ad Spend",
    avgRoas: "Average ROAS",
    totalConversions: "Total Conversions",
    
    // Dashboard sections
    kpiAnalysis: "KPI Analysis",
    aiRecommendations: "AI Recommendations",
    performanceChart: "Performance Chart",
    channelBreakdown: "Channel Breakdown",
    
    // Common dashboard terms
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days", 
    custom: "Custom",
    
    // Status and alerts
    loginRequired: "Login Required",
    pleaseLogin: "Please login to continue",
    loading: "Loading",
    error: "Error",
    
    // AI Assistant
    aiAssistant: "AI Assistant",
    askQuestion: "Ask a question...",
    send: "Send",
    
    // Navigation categories
    general: "General",
    analysis: "Analysis", 
    management: "Management",
    configuration: "Configuration",
    channels: "Channels",
    cro: "CRO",
    strategy: "Strategy",
    helper: "Helper", 
    automation: "Automation",
    
    // User profile
    profile: "Profile",
    
    // Additional terms
    performance: "performance",
    systemActive: "System Active",
    
    // Dashboard specific translations
    genelBakış: "Overview",
  store: "Store",
    
    // KPI translations
    conversions: "Conversions",
  orders: "Orders",
  aov: "AOV",
    
    // Action Center
    todaysInsight: "Today's Insight",
    opportunity: "Opportunity",
    confidence: "confidence",
    potential: "potential", 
    viewDetails: "View Details",
    teamTasks: "Team Tasks",
    actionCenter: "Action Center",
    actionableItems: "Actionable Items",
    impact: "Impact",
    apply: "Apply",
    anomaliesAndAlerts: "Anomalies and Alerts",
    inspect: "Inspect",
    automatedActions: "Automated Actions",
    completed: "Completed",
    
    // Navigation items
    attributionModule: "Attribution Module",
    profitabilityPanel: "Profitability Panel", 
    croCenter: "CRO Center",
    marketAnalysis: "Market Analysis",
    competitorAnalysis: "Competitor Analysis",
    customers: "Customers",
    products: "Products", 
    campaigns: "Campaigns",
    collaborations: "Collaborations",
    strategyPlanning: "Strategy & Planning",
    creative: "Creative",
    reports: "Reports",
    opportunitiesActions: "Opportunities & Actions",
    autopilot: "Autopilot",
  // Pie selectors
  revenueVsAdSpend: "Revenue vs Ad Spend",
  ordersVsClicks: "Orders vs Clicks",
  newVsActive: "New vs Active",
  sessionsVsEvents: "Sessions vs Events",
  chartData: "Chart Data",
    
    // Dashboard page specific content
    overview: "Overview",
    conversionRate: "Conversion Rate",
    activeCustomers: "Active Customers",
    organic: "Organic",
    traffic: "Traffic",
    cost: "Cost",
    revenue: "Revenue",
    roas: "ROAS",
    kpiAnalysisPage: "KPI Analysis",
    touchpointAnalysis: "Touchpoint Analysis",
    settings: "Settings",
    aiAssistantPage: "AI Assistant",
    
    // Dashboard widgets and sections
    enhancedControls: "Enhanced Controls",
    metricSelector: "Metric Selector",
    channelSelector: "Channel Selector",
    compareToggle: "Compare Toggle",
    comparisonPeriod: "Comparison Period",
    previous7Days: "Previous 7 Days",
    previous30Days: "Previous 30 Days", 
    previous90Days: "Previous 90 Days",
    
    // KPI Cards
    netProfit: "Net Profit (What's Left in Your Pocket)",
    grossProfit: "Gross Profit",
    profitMargin: "Profit Margin",
    
    // Charts and data
    chartTitle: "Chart Title",
    dataVisualization: "Data Visualization",
    trendAnalysis: "Trend Analysis",
    
    // Insights and recommendations
    dailyInsight: "Daily Insight",
    recommendation: "Recommendation",
    suggestion: "Suggestion",
    optimization: "Optimization",
    
    // Actions and buttons
    startTimer: "Start Timer",
    viewReport: "View Report",
    generateReport: "Generate Report",
    exportData: "Export Data",
    
    // Time periods
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    
    // Status indicators
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    inProgress: "In Progress",
    
    // Marketing channels
    googleAds: "Google Ads",
    metaAds: "Meta Ads",
  // GA users split
  newUsers: "New Users",
  activeUsers: "Active Users",
    tiktokAds: "TikTok Ads",
    emailMarketing: "Email Marketing",
    organicTraffic: "Organic Traffic",
    
    // Metrics and KPIs
    impressions: "Impressions",
    clicks: "Clicks",
    ctr: "CTR",
    cpc: "CPC",
    cpm: "CPM",
    cpa: "CPA",
    ltv: "LTV",
    
    // Analysis terms
    trends: "Trends",
    insights: "Insights",
    analytics: "Analytics",
    data: "Data",
    metrics: "Metrics",
    
    // Actions and operations
    optimize: "Optimize",
    export: "Export",
    import: "Import",
    configure: "Configure",
    
    // Common UI elements
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    remove: "Remove",
    update: "Update",
    refresh: "Refresh",
    sort: "Sort",
    
    // Notifications and alerts
    success: "Success",
    warning: "Warning",
    info: "Info",
    alert: "Alert",
    notification: "Notification",
    
    // Attribution page
    attributionCommandCenter: "Attribution Command Center",
    intelligentAnalysisPlatform: "Intelligent analysis platform that guides you step by step",
    perspectiveSelector: "Perspective:",
    lastClick: "Last Click",
    firstClick: "First Click",
    linearModel: "Linear Model",
    smartModel: "Smart Model",
    lastClickDesc: "The final step that completes the sale",
    firstClickDesc: "The first introduction step",
    linearModelDesc: "Equal distribution",
    smartModelDesc: "AI-based analysis",
    treasureDistribution: "Treasure Distribution",
    totalRevenueDistribution: "Distribution of total revenue across channels",
    goldenPaths: "Golden Paths",
    mostCommonCustomerJourneys: "Most common customer journeys",
    journey: "Journey",
    conversion: "Conversion",
    
    // Profitability page
    profitabilityAnalysis: "Profitability Analysis",
    channelProductAudienceAnalysis: "In-depth profitability analysis by channel, product and target audience",
    netProfitPocket: "Net Profit (What Goes to Your Pocket)",
    channelProfitability: "Channel Profitability",
    profitDistribution: "Profit Distribution",
    productAnalysis: "Product Analysis",
    audienceAnalysis: "Audience Analysis",
    detailedProductProfitability: "Detailed Product Profitability",
    deepAudienceAnalysis: "Deep Audience Analysis",
    interests: "Interests",
    behaviorPatterns: "Behavior Patterns",
    
    // CRO / Touchpoint Analysis page
    croWizard: "CRO Wizard",
    conversionRateOptimization: "Page analysis and optimization recommendations to increase your conversion rates",
    urlToAnalyze: "URL to analyze",
    analyzing: "Analyzing...",
    heuristicAnalysis: "Heuristic Analysis",
    croRecommendations: "CRO Recommendations",
    behavioralAnalysis: "Behavioral Analysis",
    pageLoading: "Page Loading",
    userExperience: "User Experience",
    reliability: "Reliability",
    pageLoadingSpeed: "Page loading speed",
    mobileCompatibility: "Mobile compatibility",
    ctaVisibility: "CTA visibility",
    formUsability: "Form usability",
    navigationClarity: "Navigation clarity",
    sslCertificate: "SSL certificate",
    socialProof: "Social proof",
    contactInfo: "Contact information",
    optimizeMainCta: "Optimize Main CTA Position",
    improveMobileExperience: "Improve Mobile Experience",
    addSocialProof: "Add Social Proof",
    increasePageSpeed: "Increase Page Speed",
    heatmapInsights: "Heatmap Insights",
    userFlowIssues: "User Flow Issues",
    
    // Market Analysis page
    enterIndustry: "Enter industry",
    industry: "Industry",
    websiteUrl: "Website URL (Optional)",
    mainCompetitors: "Main Competitors (Optional)",
    startMarketAnalysis: "Start Market Analysis",
    creatingAnalysis: "Creating Analysis...",
    enterValidBudget: "Please enter a valid budget",
    marketSituation: "Market Situation Summary",
    currentTrends: "Current Trends",
    risks: "Risks",
    targetAudienceAnalysis: "Target Audience Analysis",
    startYourMarketAnalysis: "Start Your Market Analysis",
    enterYourSector: "Enter your sector and get AI-powered market analysis",
    
    // Competitor Analysis page
    marketRadar: "Market Radar",
    analyzeCompetitorsAndTrends: "Analyze your competitors and market trends to take your strategy to the next level",
    discoverCompetitorsWithAI: "Discover Competitors with AI",
    describeYourSectorOrProduct: "Describe your sector or product, let AI find potential competitors",
    discoverCompetitors: "Discover Competitors",
    addCompetitorManually: "Add Competitor Manually",
    enterCompetitorName: "Enter competitor company name...",
    trackedCompetitors: "Tracked Competitors",
    noCompetitorsAdded: "No competitors added yet...",
    competitorFlow: "Competitor Flow",
    socialMedia: "Social Media",
    seoWeb: "SEO & Web",
    opportunityEngine: "Opportunity Engine",
    dailyVisits: "Daily Visits",
    trend: "Trend",
    marketShare: "Market Share",
    followers: "followers",
    engagement: "Engagement",
    organicKeywords: "Organic Keywords",
    backlinks: "Backlinks",
    pageSpeed: "Page Speed",
    opportunityAreas: "Opportunity Areas",
    mobileOptimization: "Mobile Optimization",
    videoContent: "Video Content",
    localSeo: "Local SEO",
    startCompetitorContentAnalysis: "Start Competitor Content Analysis",
    discoverKeywordGaps: "Discover Keyword Gaps",
    makePriceComparison: "Make Price Comparison",
    
    // Opportunities page
    opportunitiesAndActions: "Opportunities and Actions",
    aiPoweredRecommendations: "AI-powered recommendations and task management",
    totalOpportunities: "Total Opportunities",
    pendingActions: "Pending Actions",
    averageRoi: "Average ROI",
    assignedTasks: "Assigned Tasks",
    growthOpportunities: "Growth Opportunities",
    actionRecommendations: "Action Recommendations",
    recommendedOpportunities: "Recommended Opportunities",
    potentialImpact: "Potential Impact",
    expectedRoi: "Expected ROI",
    effortLevel: "Effort Level",
    targetDate: "Target Date",
    category: "Category",
    estimatedImpact: "Estimated Impact",
    status: "Status",
    assignedPerson: "Assigned Person",
    unassigned: "Unassigned",
    start: "Start",
  // assignTask: "Assign Task", // duplicate removed
    
    // Strategy page
    strategyPlanner: "Strategy Planner",
    planMarketingGoals: "Plan your marketing goals and reach your target with AI-powered recommendations",
    accountSelection: "Account Selection:",
    shortTerm: "Short Term",
    mediumTerm: "Medium Term",
    longTerm: "Long Term",
    thisQuarter: "This Quarter",
    nextQuarter: "Next Quarter",
    yearEnd: "Year End",
    followerGrowth: "Follower Growth",
    followerCount: "Follower Count",
    engagementRate: "Engagement Rate",
    brandAwareness: "Brand Awareness",
    brandSearches: "Brand Searches",
    websiteTraffic: "Website Traffic",
    socialMediaTraffic: "Social Media Traffic",
    communityBuilding: "Community Building",
    discordMembers: "Discord Members",
    addNewGoal: "Add New Goal",
    smartActionPanel: "Smart Action Panel",
    contentSuggestion: "Content Suggestion",
    engagementAutomation: "Engagement Automation",
    automaticResponse: "Automatic Response",
    storyStrategy: "Story Strategy",
    generateIdeas: "Generate Ideas",
    applyAutomatically: "Apply Automatically",
    showReport: "Show Report",
    
    // Creative page
    creativeManagement: "Creative Management",
    analyzeVisualPerformance: "Analyze the visual performance of your ads",
    allPlatforms: "All Platforms",
    allTypes: "All Types",
    video: "Video",
    image: "Image",
    carousel: "Carousel",
    newCreative: "New Creative",
    bestCtr: "Best CTR",
    highestEngagement: "Highest Engagement",
    lowestCpc: "Lowest CPC",
    bestRoas: "Best ROAS",
    creativePerformance: "Creative Performance",
    springCollectionVideo: "Spring Collection Video",
  discountCampaignBanner: "Discount Campaign Banner",
  productShowcaseCarousel: "Product Showcase Carousel",
  // impressions: "Impressions", // duplicate removed
  spend: "Spend",
  paused: "Paused",
    
    // Reports page
    createAndDownloadReports: "Create and download your performance reports",
    allReports: "All Reports",
    newReport: "New Report",
    quickReportTemplates: "Quick Report Templates",
    weeklyOverview: "Weekly Overview",
    monthlyDashboard: "Monthly Dashboard",
    roiReport: "ROI Report",
    weeklyPerformanceMetrics: "Weekly performance and key metrics",
    monthlyComprehensiveReport: "Monthly comprehensive performance report",
    targetAudienceBehaviorAnalysis: "Target audience behavior and demographic analysis",
    investmentReturnAnalysis: "Investment return and profitability analysis",
    create: "Create",
    generatedReports: "Generated Reports",
    monthlyPerformanceReport: "Monthly Performance Report",
    channelProfitabilityAnalysis: "Channel Profitability Analysis",
    customerSegmentationReport: "Customer Segmentation Report",
    creativePerformanceReport: "Creative Performance Report",
    performanceSummaryAllChannels: "Performance summary for all channels",
    channelProfitabilityRoiAnalysis: "Channel-based profitability and ROI analysis",
    customerSegmentsBehaviorAnalysis: "Customer segments and behavior analysis",
    adCreativePerformanceAnalysis: "Ad creative performance analysis",
    generationDate: "Generation Date",
    format: "Format",
    size: "Size",
    ready: "Ready",
    generating: "Generating",
    failed: "Failed",
    download: "Download",

    // Team and Task Management
    teamManagement: "Team Management",
    taskManagement: "Task Management",
  teamMembers: "Team Members",
  addTeamMember: "Add Team Member",
  // assignTask: "Assign Task", // duplicate removed
  taskStatus: "Task Status",
  priority: "Priority",
    dueDate: "Due Date",
    assignee: "Assignee",
    taskDescription: "Task Description",
    createTask: "Create Task",
    editTask: "Edit Task",
  deleteTask: "Delete Task",
  completeTask: "Complete Task",
  // inProgress: "In Progress", // duplicate removed
  // pending: "Pending", // duplicate removed
  // completed: "Completed", // duplicate removed
  high: "High",
  medium: "Medium",
    low: "Low",
    
    // Customer Management
    customerManagement: "Customer Management",
    customerDatabase: "Customer Database",
    customerSegments: "Customer Segments",
    customerLifetimeValue: "Customer Lifetime Value",
    customerAcquisitionCost: "Customer Acquisition Cost",
    customerRetention: "Customer Retention",
    customerChurnRate: "Customer Churn Rate",
    topCustomers: "Top Customers",
    newCustomers: "New Customers",
    returningCustomers: "Returning Customers",
    customerGrowth: "Customer Growth",
    
    // Product Management
    productManagement: "Product Management",
    productCatalog: "Product Catalog",
    productPerformance: "Product Performance",
    topSellingProducts: "Top Selling Products",
    productRevenue: "Product Revenue",
    productMargins: "Product Margins",
    inventoryStatus: "Inventory Status",
    stockLevels: "Stock Levels",
    productCategories: "Product Categories",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    productDetails: "Product Details",
    
    // Campaign Management
    campaignManagement: "Campaign Management",
    activeCampaigns: "Active Campaigns",
    campaignPerformance: "Campaign Performance",
    createCampaign: "Create Campaign",
    editCampaign: "Edit Campaign",
    pauseCampaign: "Pause Campaign",
    resumeCampaign: "Resume Campaign",
    campaignBudget: "Campaign Budget",
    campaignReach: "Campaign Reach",
    campaignObjective: "Campaign Objective",
    campaignDuration: "Campaign Duration",
    
    // Settings and Configuration
    accountSettings: "Account Settings",
    profileSettings: "Profile Settings",
    notificationSettings: "Notification Settings",
    privacySettings: "Privacy Settings",
    securitySettings: "Security Settings",
    integrationSettings: "Integration Settings",
    billingSettings: "Billing Settings",
    planAndBilling: "Plan & Billing",
    changePassword: "Change Password",
    twoFactorAuth: "Two-Factor Authentication",
    apiKeys: "API Keys",
    webhooks: "Webhooks",
    
    // Collaboration and Communication
    collaborationTools: "Collaboration Tools",
    teamChat: "Team Chat",
    videoCall: "Video Call",
    screenShare: "Screen Share",
    fileSharing: "File Sharing",
    projectDiscussion: "Project Discussion",
    meetingNotes: "Meeting Notes",
    sharedWorkspace: "Shared Workspace",
    
    // Analytics and Reporting
  advancedAnalytics: "Advanced Analytics",
  customReports: "Custom Reports",
  // dataVisualization: "Data Visualization", // duplicate removed
  kpiTracking: "KPI Tracking",
  performanceDashboard: "Performance Dashboard",
    realTimeData: "Real-time Data",
    historicalData: "Historical Data",
    predictiveAnalytics: "Predictive Analytics",
    
    // Automation and AI
    marketingAutomation: "Marketing Automation",
    aiInsights: "AI Insights",
    smartRecommendations: "Smart Recommendations",
    automatedReports: "Automated Reports",
    intelligentAlerting: "Intelligent Alerting",
    predictiveModeling: "Predictive Modeling",
    machineLearning: "Machine Learning",
    aiOptimization: "AI Optimization",
    
    // Common Actions and States
    viewAll: "View All",
    showMore: "Show More",
    showLess: "Show Less",
    loadMore: "Load More",
    noDataAvailable: "No data available",
    comingSoon: "Coming Soon",
    underMaintenance: "Under Maintenance",
    tryAgain: "Try Again",
    contactSupport: "Contact Support",
    learnMore: "Learn More",
    getHelp: "Get Help",
    documentation: "Documentation",
    tutorials: "Tutorials",
    bestPractices: "Best Practices"
  }
};

export const useLanguage = () => {
  // This will be implemented by the LanguageContext
  throw new Error("useLanguage must be used within a LanguageProvider");
};
