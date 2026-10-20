// Multi-language translation dictionary and utilities for Micro Homes Direct

export const categoryTranslations = {
  pods: {
    label: "后院与办公舱",
    intro: "紧凑独立的专属空间，专为居家办公、创意工作室及客人住宿精心打造。"
  },
  "high-ceiling": {
    label: "现代挑高微型房屋",
    intro: "开放式模块化房屋，拥有宽敞层高设计与智能化空间布局。"
  },
  "container-homes": {
    label: "可折叠拓展集装箱房",
    intro: "快速部署的多房间拓展式居所，专为高效运送与快速入住而设计。"
  },
  toilets: {
    label: "卫浴与独立洗手间舱",
    intro: "独立式卫浴与淋浴设施舱，运抵后可直接连接各类水电市政管道。"
  },
  "shipping-containers": {
    label: "仓储与农场用房",
    intro: "高强度耐用钢结构集装箱与户外附属建筑，专为坚固仓储与农业实用需求打造。"
  },
  "trailers-accessories": {
    label: "拖车、露台与配件",
    intro: "配套可移动底盘、户外休闲露台与精选五金构件，助您轻松完善微型居所。"
  }
};

export const productNameZhMap = {
  "3M Micro Pod": "3M 微型后院独立舱",
  "4M 13FT Backyard Office": "4M 13英尺 后院办公舱",
  "4M Micro Pod New Appearance": "4M 微型舱（全新外观）",
  "6M Micro Pod": "6M 微型独立舱",
  "6M 20FT Backyard Office": "6M 20英尺 后院办公舱",
  "10FT Micro Pod": "10英尺 微型独立舱",
  "13FT Micro Pod": "13英尺 微型独立舱",
  "20FT Micro Pod": "20英尺 微型独立舱",
  "20FT Expandable Container Home": "20英尺 可折叠拓展集装箱房",
  "30FT Expandable Container Home": "30英尺 可折叠拓展集装箱房",
  "40FT Expandable Container Home": "40英尺 可折叠拓展集装箱房",
  "High Ceiling Micro Home": "现代挑高微型房屋",
  "Luxury Modular Home": "轻奢模块化微型居所",
  "Backyard Studio Pod": "后院多功能工作室舱",
  "Garden Office Pod": "花园景观独立办公舱",
  "Bathroom Pod": "一体化卫浴独立舱",
  "Toilet Shower Pod": "便携式卫生间淋浴一体舱",
  "Double Toilet Pod": "双门独立移动卫生间",
  "Shipping Container Storage": "高强度仓储海运集装箱",
  "Farm Shed Storage Unit": "多功能农用及工业仓储房",
  "Movable Trailer Chassis": "微型房屋专用公路移动底盘",
  "Modular Decking Veranda": "模块化户外休闲露台步梯"
};

export function translateProductName(name, lang = "en") {
  if (lang !== "zh" || !name) return name;
  if (productNameZhMap[name]) return productNameZhMap[name];

  // Regex-based systematic translation for sizes and categories
  let translated = name;
  translated = translated.replace(/\bMicro Pod\b/gi, "微型独立舱");
  translated = translated.replace(/\bBackyard Office\b/gi, "后院办公舱");
  translated = translated.replace(/\bExpandable Container Home\b/gi, "可拓展集装箱房屋");
  translated = translated.replace(/\bHigh Ceiling Micro Home\b/gi, "挑高微型房屋");
  translated = translated.replace(/\bBathroom Pod\b/gi, "独立卫浴舱");
  translated = translated.replace(/\bToilet Pod\b/gi, "移动洗手间舱");
  translated = translated.replace(/\bTrailer\b/gi, "拖车底盘");
  translated = translated.replace(/\bDecking\b/gi, "户外露台");
  translated = translated.replace(/\bStorage\b/gi, "仓储房");
  translated = translated.replace(/\bNew Appearance\b/gi, "全新外观款");
  translated = translated.replace(/(\d+)\s*FT\b/gi, "$1英尺");
  translated = translated.replace(/(\d+)\s*M\b/gi, "$1米");
  return translated;
}

export const uiTranslations = {
  en: {
    // Nav
    home: "Home",
    shop: "Shop",
    about: "About",
    finance: "Finance",
    blog: "Blog",
    contact: "Contact",
    getAQuote: "Get a Quote",
    callUs: "1300 229 166",
    searchModels: "Search models",
    browseProducts: "Browse products",
    menu: "MENU",
    main: "MAIN",
    other: "OTHER",

    // Common
    products: "products",
    product: "product",
    allProducts: "All products",
    viewAllProducts: "View all products",
    addToCart: "Add to cart",
    viewDetails: "View details",
    enquireProduct: "Enquire about this product",
    callNumber: "Call 1300 229 166",
    listedPrice: "Listed price",
    priceNote: "Prices and availability are shown as listed on Micro Homes Direct and may change. Confirm details with the team before ordering.",
    findYourFit: "FIND YOUR FIT",
    shopByCategory: "SHOP BY CATEGORY",
    fullCollection: "THE FULL COLLECTION",
    productInformation: "PRODUCT INFORMATION",
    madeForWayYouLive: "Made for the way you live.",
    exploreCollection: "EXPLORE THE COLLECTION",
    moreInThisRange: "More in this range",
    viewCategory: "View category",

    // Cart
    yourCart: "Shopping cart",
    cartEmpty: "Your cart is empty",
    cartEmptyPrompt: "Explore our range of pods and homes to add products.",
    subtotal: "Listed subtotal",
    cartDisclaimer: "Delivery and final pricing are confirmed with our team before ordering.",
    contactAboutCart: "Contact us about your cart",
    continueShopping: "Continue shopping",
    remove: "Remove",
    quantity: "Quantity",

    // Chat
    assistantTitle: "MHD Assistant",
    assistantStatus: "Online · Drag to move",
    assistantGreeting: "Hello! 👋 I’m MHD Assistant. Ask me about our products, listed prices, finance or anything else on this website.",
    askPlaceholder: "Ask about products, prices...",
    chatDisclaimer: "Website info only. Confirm prices and availability with our team.",
    poweredBy: "Powered by jobgen.ai",
    chipProducts: "Products",
    chipPrices: "Prices",
    chipQuote: "Get a quote",

    // Dialogs
    quoteTitle: "Let's find your right space.",
    quoteSubtitle: "Tell us a little about your plans. Our team will follow up during business hours.",
    nameLabel: "Name",
    phoneLabel: "Phone",
    emailLabel: "Email",
    stateLabel: "State",
    selectState: "Select state",
    modelLabel: "Model of interest",
    selectModel: "Select a model or category",
    messageLabel: "Message",
    messagePlaceholder: "Tell us about your plans, site or questions.",
    sendEnquiry: "Send Enquiry",
    quoteNote: "This demo form prepares an email enquiry on your device.",
    searchTitle: "Search models.",
    searchEyebrow: "FIND YOUR SPACE",
    searchLabel: "Product or category",
    searchDefaultOption: "Choose a category or product",
    searchButton: "Search",
    searchNote: "Choose a category or product to open it directly.",

    // Footer
    footerHeadline: "The future of compact living.",
    contactUs: "Contact Us",
    company: "COMPANY",
    locations: "LOCATIONS",
    faq: "FAQ",
    becomeReseller: "Become a Reseller",
    emailTeam: "Email our team ↗",
    sydney: "Sydney",
    goldCoast: "Gold Coast",
    melbourne: "Melbourne"
  },
  zh: {
    // Nav
    home: "首页",
    shop: "商城",
    about: "关于我们",
    finance: "分期金融",
    blog: "博客与指南",
    contact: "联系我们",
    getAQuote: "获取报价",
    callUs: "1300 229 166",
    searchModels: "搜索产品型号",
    browseProducts: "浏览全部产品",
    menu: "导航菜单",
    main: "主要页面",
    other: "更多功能",

    // Common
    products: "款产品",
    product: "款产品",
    allProducts: "全部产品",
    viewAllProducts: "查看全部产品",
    addToCart: "加入购物车",
    viewDetails: "查看详情",
    enquireProduct: "咨询此款产品",
    callNumber: "致电 1300 229 166",
    listedPrice: "标示售价",
    priceNote: "网站所示价格与库存情况为当前标示信息，订购前请与团队确认具体配置及最终价格。",
    findYourFit: "寻找专属空间",
    shopByCategory: "按产品类别选购",
    fullCollection: "全系产品精选",
    productInformation: "产品详细信息",
    madeForWayYouLive: "专为您理想的生活方式而造。",
    exploreCollection: "探索精选系列",
    moreInThisRange: "同类产品推荐",
    viewCategory: "查看整类产品",

    // Cart
    yourCart: "您的购物车",
    cartEmpty: "您的购物车是空的",
    cartEmptyPrompt: "浏览我们的独立舱与微型居所系列，挑选心仪的产品加入购物车。",
    subtotal: "标示商品小计",
    cartDisclaimer: "配送安装费用与最终成交价格将在正式下单前由专业团队与您核实。",
    contactAboutCart: "就购物车内容联系咨询",
    continueShopping: "继续浏览商城",
    remove: "移除",
    quantity: "数量",

    // Chat
    assistantTitle: "MHD 智能顾问",
    assistantStatus: "在线 · 支持拖动",
    assistantGreeting: "您好！👋 我是 MHD 智能顾问。关于我们的微型房屋、后院独立舱、标示价格、分期金融或展厅预约，随时欢迎向我咨询！",
    askPlaceholder: "咨询产品、价格、展厅、交付...",
    chatDisclaimer: "信息仅供参考。具体价格、规格及现货库存请以团队正式确认为准。",
    poweredBy: "技术支持：jobgen.ai",
    chipProducts: "产品系列",
    chipPrices: "价格清单",
    chipQuote: "获取报价",

    // Dialogs
    quoteTitle: "让我们帮您找到理想的空间。",
    quoteSubtitle: "请简要填写您的计划与需求，我们的专业团队将在工作时间尽快跟进回复。",
    nameLabel: "您的姓名",
    phoneLabel: "联系电话",
    emailLabel: "电子邮箱",
    stateLabel: "所在州/领地",
    selectState: "请选择州/领地",
    modelLabel: "意向型号或类别",
    selectModel: "请选择意向型号或类别",
    messageLabel: "留言内容",
    messagePlaceholder: "请告诉我们您的计划、场地条件、交付地址或具体疑问。",
    sendEnquiry: "提交咨询申请",
    quoteNote: "此表单将在您的设备上生成电子邮件咨询，直接发送给销售团队。",
    searchTitle: "搜索产品型号。",
    searchEyebrow: "寻找您的理想空间",
    searchLabel: "产品或分类",
    searchDefaultOption: "请选择分类或具体产品",
    searchButton: "立即查看",
    searchNote: "选择分类或产品可直接跳转到相应详情页面。",

    // Footer
    footerHeadline: "紧凑型生活方式的未来。",
    contactUs: "联系我们",
    company: "公司介绍",
    locations: "展厅与仓储中心",
    faq: "常见问题",
    becomeReseller: "成为经销商",
    emailTeam: "发送邮件咨询 ↗",
    sydney: "悉尼总部展厅",
    goldCoast: "黄金海岸仓储",
    melbourne: "墨尔本服务中心"
  }
};

export function getZhAssistantReply(question) {
  const text = question.trim().toLowerCase();
  const has = (...terms) => terms.some((term) => text.includes(term));

  if (!text) {
    return { text: "请输入您想了解的问题，我会竭诚为您解答。" };
  }

  if (has("你好", "您好", "hi", "hello", "hey", "早上好", "下午好", "晚上好")) {
    return {
      text: "您好！👋 我是 Micro Homes Direct 智能顾问。您可以向我咨询后院独立舱、微型房屋、标价、展厅参观预约、分期金融或获取详细报价。"
    };
  }

  if (has("谢谢", "多谢", "感谢", "thx", "thanks", "thank")) {
    return { text: "不客气！😊 如果您对我们的微型房屋或后院舱还有任何疑问，欢迎随时提问。" };
  }

  if (has("再见", "拜拜", "bye", "goodbye")) {
    return { text: "感谢您的咨询，祝您生活愉快！如需后续协助，我随时都在这里。" };
  }

  if (has("你是谁", "名字", "介绍", "who are you")) {
    return {
      text: "我是 MHD 智能顾问，Micro Homes Direct 官方网站助手。我可以帮您快速浏览产品、查询标价、解答审批与运输常见问题，并协助您预约展厅或获取报价。"
    };
  }

  if (has("配送", "运输", "送货", "运费", "多久到", "多久发货", "交付", "delivery", "shipping")) {
    return {
      text: "运输时间与运费取决于产品型号、库存状态、配置选择以及您的交付地址。您可以告知我们您的邮编和意向型号，团队将为您提供精准的运输估算。",
      action: { label: "咨询运费与交付", href: "#contact" }
    };
  }

  if (has("价格", "多少钱", "费用", "售价", "报价", "price", "cost")) {
    return {
      text: "我们的产品线丰富：3M微型舱约 $12,800 起，4M办公舱约 $17,500 起，6M独立舱约 $23,500 起，20FT/30FT拓展集装箱房约 $29,000–$48,000不等。以上为标示参考价，具体可点击查看产品商城。",
      action: { label: "浏览全系价格", href: "/shop#models" }
    };
  }

  if (has("分期", "贷款", "金融", "finance", "loan", "repayment")) {
    return {
      text: "我们提供灵活的金融分期支持，根据金融机构的审核标准、申请人资质而定。您可以前往我们的分期金融页面了解还款估算，或联系团队获取详细方案。",
      action: { label: "了解分期金融", href: "/finance" }
    };
  }

  if (has("审批", "许可", "议会", "da", "council", "approval", "permit")) {
    return {
      text: "后院舱与微型住宅的审批要求取决于您所在的市议会（Council）、土地性质、用途及具体尺寸。在许多州，特定尺寸免审批或适用于独立附房（Granny Flat）简易通道。建议咨询当地议会并与我们的团队沟通了解产品技术图纸。"
    };
  }

  if (has("展厅", "地址", "参观", "看房", "showroom", "location", "address", "悉尼", "黄金海岸", "墨尔本")) {
    return {
      text: "我们在悉尼拥有 3,600m² 大型展厅及 5,000m² 仓储基地（84 Dunheved Circuit, St Marys NSW），并在黄金海岸设有仓储点，墨尔本设有服务支持。所有展厅参观需提前预约。",
      action: { label: "查看展厅地址与预约", href: "#locations" }
    };
  }

  if (has("定制", "尺寸", "卫生间", "厨房", "布局", "custom", "layout")) {
    return {
      text: "我们提供多种布局选项，包括空舱、带精装卫浴、集成整体小厨房、定制保温层（50mm/70mm阻燃保温板）及选配移动底盘等。欢迎告诉我们您的使用需求！"
    };
  }

  if (has("质保", "保修", "warranty")) {
    return {
      text: "我们的产品具备高耐用度钢结构与高规格建筑标准，各型号享有厂家结构保修。正式下单前销售团队会向您提供详尽的保修条款与产品说明书。"
    };
  }

  if (has("联系", "电话", "邮箱", "人工", "客服", "contact", "phone", "email")) {
    return {
      text: "您可以直接拨打澳洲免费咨询热线 1300 229 166，发送邮件至 info@microhomesdirect.com.au，或在网站上提交报价咨询，我们的团队会迅速与您联系。",
      action: { label: "提交报价咨询", quote: true }
    };
  }

  return {
    text: "如需了解该细节，您可以告诉我您关注的型号（如 3M舱、4M办公舱、6M生活舱或拓展集装箱房），或者直接致电 1300 229 166 联系我们的澳洲销售团队。",
    action: { label: "浏览全系产品", href: "/shop" }
  };
}
