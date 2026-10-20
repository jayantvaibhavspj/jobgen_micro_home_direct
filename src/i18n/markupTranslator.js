import { dictionary } from "./translations.js";

/**
 * High-performance HTML Markup Translator
 * Translates site-shell and page markups directly before React parsing,
 * ensuring 100% native React rendering without DOM mutation conflicts.
 */

export const markupReplacements = [
  // --- Navigation & Header ---
  ['<a href="/index.html" data-page="home">Home</a>', '<a href="/index.html" data-page="home">首页</a>'],
  ['<a href="/shop" data-page="shop">Shop</a>', '<a href="/shop" data-page="shop">商城</a>'],
  ['<a href="/about.html" data-page="about">About</a>', '<a href="/about.html" data-page="about">关于我们</a>'],
  ['<a href="/finance" data-page="finance">Finance</a>', '<a href="/finance" data-page="finance">金融分期</a>'],
  ['<a href="/blog" data-page="blog">Blog</a>', '<a href="/blog" data-page="blog">博客特刊</a>'],
  ['<a href="/contact.html" data-page="contact">Contact</a>', '<a href="/contact.html" data-page="contact">联系我们</a>'],
  ['Get a Quote <span class="button-icon">↗</span>', '获取报价 <span class="button-icon">↗</span>'],
  ['Get a Quote <span>↗</span>', '获取报价 <span>↗</span>'],
  ['aria-label="Search models"', 'aria-label="搜索产品型号"'],
  ['aria-label="Browse products"', 'aria-label="浏览在售产品"'],

  // --- Footer ---
  ['<h2>The future of<br><em>compact living.</em></h2>', '<h2>紧凑型微居生活的<br><em>未来。</em></h2>'],
  ['<button class="button quote-open" type="button">Contact Us <span class="button-icon">↗</span></button>', '<button class="button quote-open" type="button">联系我们 <span class="button-icon">↗</span></button>'],
  ['<span class="eyebrow">SHOP BY CATEGORY</span>', '<span class="eyebrow">按类别选购</span>'],
  ['<a href="/shop?category=pods">Backyard &amp; Office Pods</a>', '<a href="/shop?category=pods">后院与办公太空舱</a>'],
  ['<a href="/shop?category=high-ceiling">High Ceiling Micro Homes</a>', '<a href="/shop?category=high-ceiling">高挑顶微型房屋</a>'],
  ['<a href="/shop?category=container-homes">Container Homes</a>', '<a href="/shop?category=container-homes">双翼拓展集装箱房</a>'],
  ['<a href="/shop?category=toilets">Bathroom &amp; Toilet Pods</a>', '<a href="/shop?category=toilets">移动卫浴与洗手间</a>'],
  ['<a href="/shop?category=shipping-containers">Shipping Containers</a>', '<a href="/shop?category=shipping-containers">集装箱储物房</a>'],
  ['<a href="/shop?category=trailers-accessories">Trailers &amp; Accessories</a>', '<a href="/shop?category=trailers-accessories">拖车底盘与配件</a>'],
  ['<span class="eyebrow">COMPANY</span>', '<span class="eyebrow">公司信息</span>'],
  ['<a href="#why">About</a>', '<a href="#why">关于我们</a>'],
  ['<a href="#faq">FAQ</a>', '<a href="#faq">常见问题</a>'],
  ['<a href="#finance">Finance</a>', '<a href="#finance">金融分期</a>'],
  ['<a href="/blog">Blog</a>', '<a href="/blog">博客特刊</a>'],
  ['<a href="#contact" data-interest="Become a reseller">Become a Reseller</a>', '<a href="#contact" data-interest="Become a reseller">成为经销商</a>'],
  ['<a href="#contact">Contact</a>', '<a href="#contact">联系我们</a>'],
  ['<span class="eyebrow">LOCATIONS</span>', '<span class="eyebrow">展示中心</span>'],
  ['<a href="#locations">Sydney</a>', '<a href="#locations">悉尼</a>'],
  ['<a href="#locations">Gold Coast</a>', '<a href="#locations">黄金海岸</a>'],
  ['<a href="#locations">Melbourne</a>', '<a href="#locations">墨尔本</a>'],
  ['Email our team ↗', '发送邮件给团队 ↗'],
  ['Powered by jobgen.ai', '由 jobgen.ai 提供技术支持'],

  // --- Quote Modal ---
  ['<p class="eyebrow">MICRO HOMES DIRECT · ENQUIRY</p>', '<p class="eyebrow">MICRO HOMES DIRECT · 在线咨询</p>'],
  ['<h2 id="quote-title">Let\'s find your<br><em>right space.</em></h2>', '<h2 id="quote-title">让我们为您找到<br><em>最适合的空间。</em></h2>'],
  ['Tell us a little about your plans. Our team will follow up during business hours.', '请简单介绍您的规划，我们团队将在工作时间内与您联系。'],
  ['<label>Name<input', '<label>姓名<input'],
  ['<label>Phone<input', '<label>联系电话<input'],
  ['<label>Email<input', '<label>电子邮箱<input'],
  ['<label>State<select name="state"', '<label>所在州/领地<select name="state"'],
  ['<option value="">Select state</option>', '<option value="">请选择州/领地</option>'],
  ['<label class="form-wide">Model of interest<select', '<label class="form-wide">感兴趣的产品型号<select'],
  ['<option value="">Select a model or category</option>', '<option value="">请选择型号或产品分类</option>'],
  ['<option>Backyard / Office Pod</option>', '<option>后院 / 办公太空舱</option>'],
  ['<option>Micro Home</option>', '<option>微型房屋</option>'],
  ['<option>High Ceiling Micro Home</option>', '<option>高挑顶微型房屋</option>'],
  ['<option>Expandable Container Home</option>', '<option>双翼拓展集装箱房</option>'],
  ['<option>Bathroom / Toilet Pod</option>', '<option>移动卫浴与洗手间</option>'],
  ['<option>Storage / Farm Building</option>', '<option>储物与农用仓房</option>'],
  ['<option>Trailer / Decking / Accessories</option>', '<option>拖车 / 露台 / 配件</option>'],
  ['<option>Finance enquiry</option>', '<option>金融分期咨询</option>'],
  ['<option>Showroom appointment</option>', '<option>展厅参观预约</option>'],
  ['<option>Become a reseller</option>', '<option>加盟成为经销商</option>'],
  ['<option>Not sure yet</option>', '<option>尚不确定</option>'],
  ['<label class="form-wide">Message<textarea', '<label class="form-wide">留言内容<textarea'],
  ['placeholder="Tell us about your plans, site or questions."', 'placeholder="请告诉我们您的构想、场地条件或具体疑问。"'],
  ['Send Enquiry <span class="button-icon">↗</span>', '提交咨询 <span class="button-icon">↗</span>'],
  ['This demo form prepares an email enquiry on your device.', '该表单将在您的设备上准备邮件咨询。'],

  // --- Search Dialog ---
  ['<p class="eyebrow">FIND YOUR SPACE</p>', '<p class="eyebrow">寻找您的理想空间</p>'],
  ['<h2 id="search-title">Search <em>models.</em></h2>', '<h2 id="search-title">搜索<em>产品型号。</em></h2>'],
  ['<label class="search-label" for="site-search">Product or category</label>', '<label class="search-label" for="site-search">产品或分类</label>'],
  ['<option value="">Choose a category or product</option>', '<option value="">请选择产品分类或具体型号</option>'],
  ['Search <span class="button-icon">↗</span>', '搜索 <span class="button-icon">↗</span>'],
  ['Choose a category or product to open it directly.', '选择分类或产品即可直接打开。'],

  // --- Home Page ---
  ['<h1 id="hero-title">More room for<br><em>what’s next.</em></h1>', '<h1 id="hero-title">为未来的生活，<br><em>创造更多空间。</em></h1>'],
  ['Thoughtfully made backyard pods and compact homes for work, family, guests and everything in between.', '精心打造的后院太空舱与微型移动房屋，适用于办公、家庭、待客及多元生活场景。'],
  ['Explore our range <span class="button-icon">↗</span>', '探索所有系列 <span class="button-icon">↗</span>'],
  ['Visit a showroom <span>↘</span>', '参观展厅 <span>↘</span>'],
  ['Designed around<br><em>the way you live.</em>', '以您的生活方式<br><em>为核心设计。</em>'],
  ['<span class="eyebrow">OPTIONS TO MAKE IT YOURS</span>', '<span class="eyebrow">随心定制专属空间</span>'],
  ['Thoughtfully designed compact spaces for life, work and everything in between.', '精心设计的紧凑型微居空间，专为生活、工作与未来构想打造。'],
  ['Learn more <span>↘</span>', '了解更多 <span>↘</span>'],
  ['<span>✳</span> SCROLL TO EXPLORE', '<span>✳</span> 向下滚动探索'],
  ['<p class="eyebrow">SMALL FOOTPRINT</p><p>Big <em>living.</em></p>', '<p class="eyebrow">占地小巧</p><p>尽享<em>宽敞生活。</em></p>'],
  ['<h2>A space for every<br><em>way you live.</em></h2>', '<h2>满足您多样<br><em>生活方式的理想空间。</em></h2>'],
  ['Explore flexible spaces made for working, hosting, investing and growing.', '探索专为办公、待客、投资与发展而设计的灵活空间。'],
  ['<h3>Backyard &amp; Office Pods</h3><span>17 products</span>', '<h3>后院与办公太空舱</h3><span>17 款在售产品</span>'],
  ['<h3>Modern High Ceiling<br>Micro Homes</h3><span>9 products</span>', '<h3>现代高挑顶<br>微型房屋</h3><span>9 款在售产品</span>'],
  ['<h3>Expandable<br>Container Homes</h3><span>14 products</span>', '<h3>双翼拓展<br>集装箱房</h3><span>14 款在售产品</span>'],
  ['<h3>Bathroom &amp;<br>Toilet Pods</h3><span>6 products</span>', '<h3>移动卫浴与<br>洗手间舱</h3><span>6 款在售产品</span>'],
  ['<h3>Storage &amp; Farm</h3><span>13 products</span>', '<h3>储物与农用仓房</h3><span>13 款在售产品</span>'],
  ['<h3>Trailers, Decking<br>&amp; Accessories</h3><span>5 products</span>', '<h3>拖车底盘、露台<br>与配件</h3><span>5 款在售产品</span>'],

  // --- Why Cards ---
  ['<h2>Built smarter.<br><em>Built to last.</em></h2>', '<h2>更智能的建造，<br><em>更持久的品质。</em></h2>'],
  ['Flexible spaces shaped around practical details and everyday use.', '注重实用细节与日常使用的灵活空间。'],
  ['<span class="feature-number">01 / FRAME</span><h3>Lightweight steel keel</h3><p>Designed to reduce energy use by up to 65% on listed models.*</p>', '<span class="feature-number">01 / 龙骨框架</span><h3>轻钢龙骨结构</h3><p>部分在售型号设计节能高达 65%*。</p>'],
  ['<span class="feature-number">02 / INSULATION</span><h3>Comfort-led insulation</h3><p>50mm or 70mm flame-retardant foam wall-panel options.</p>', '<span class="feature-number">02 / 保温隔热</span><h3>卓越舒适保温层</h3><p>可选 50mm 或 70mm 阻燃泡沫墙板。</p>'],
  ['<span class="feature-number">03 / CONSTRUCTION</span><h3>Seismic resilience</h3><p>Durable construction with enhanced earthquake-resistance design.</p>', '<span class="feature-number">03 / 建筑结构</span><h3>优异抗震性能</h3><p>坚固耐用结构，强化抗震抗风设计。</p>'],
  ['<span class="feature-number">04 / MOBILITY</span><h3>Optional wheeled chassis</h3><p>Selected models can be fitted with an optional chassis for relocation.</p>', '<span class="feature-number">04 / 灵活移动</span><h3>可选带轮移动底盘</h3><p>指定型号可加装移动轮式底盘，方便随时迁移。</p>'],
  ['<span class="feature-number">05 / CONFIGURATION</span><h3>Open or fully fitted</h3><p>Flexible layouts with selected kitchenette and bathroom configurations.</p>', '<span class="feature-number">05 / 空间配置</span><h3>毛坯或全精装交付</h3><p>灵活空间布局，可选配整体厨房与整体卫浴。</p>'],
  ['<span class="feature-number">06 / PERSONAL</span><h3>Modular layouts</h3><p>Adaptable spaces can suit offices, leisure, movable living or storage.</p>', '<span class="feature-number">06 / 多元功能</span><h3>模块化多功能空间</h3><p>适应办公室、休闲室、移动居所或仓储等多元用途。</p>'],
  ['<span class="feature-number">07 / INSTALLATION</span><h3>Efficient installation</h3><p>Designed for a more efficient installation with minimal site setup.</p>', '<span class="feature-number">07 / 快速安装</span><h3>高效快捷安装</h3><p>现场施工量极小，落位即可快速投入使用。</p>'],
  ['<span class="feature-number">08 / MATERIALS</span><h3>Enhanced durability</h3><p>Selected materials are designed for durability and long-term use.</p>', '<span class="feature-number">08 / 耐用选材</span><h3>超强耐久材料</h3><p>严选高耐候材料，长久如新，经久耐用。</p>'],
  ['LIVE SMALL. <em>THINK BIG.</em>', '微居空间，<em>广阔天地。</em>'],
  ['<p class="eyebrow">MORE THAN ONE WAY TO LIVE</p><h2>Make space for<br><em>what matters.</em></h2>', '<p class="eyebrow">不止一种生活方式</p><h2>为真正重要的<br><em>事情腾出空间。</em></h2>'],
  ['<h3>Granny flat.</h3><p>Room for family and a little more independence.</p>', '<h3>独立家庭套间</h3><p>为家人提供独立自主又近在咫尺的生活空间。</p>'],
  ['<h3>Home office.</h3><p>A dedicated place to focus, just steps from home.</p>', '<h3>居家专属办公室</h3><p>足不出户即可拥有的静谧高效办公空间。</p>'],
  ['<h3>Airbnb.</h3><p>Explore an additional space for guest accommodation.</p>', '<h3>民宿度假短租</h3><p>打造独具吸引力的客房，拓展租金收益。</p>'],
  ['<h3>Studio.</h3><p>Make room for creative work and new ideas.</p>', '<h3>创意工作室</h3><p>激发灵感，专为艺术创作与新创意打造。</p>'],
  ['<h3>Farm stay.</h3><p>Add flexible space to your rural property.</p>', '<h3>农场庄园居所</h3><p>为您的乡村土地增添高品质的灵活居住空间。</p>'],

  // --- Locations & Contact ---
  ['<p class="eyebrow">COME SEE THE POSSIBILITIES</p><h2>Closer to<br><em>your next space.</em></h2>', '<p class="eyebrow">亲临现场，探索无限可能</p><h2>离您的下一个<br><em>空间更近一步。</em></h2>'],
  ['Serving customers across Australia from our Sydney and Gold Coast locations.', '通过悉尼与黄金海岸基地，服务全澳大利亚客户。'],
  ['<span class="location-tag">HEAD OFFICE · SHOWROOM · WAREHOUSE</span><h3>Sydney</h3><p>84 Dunheved Circuit,<br>St Marys NSW 2760<br>3,600m² showroom · 5,000m² warehouse</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=84+Dunheved+Circuit+St+Marys+NSW+2760" target="_blank" rel="noreferrer">Get directions ↗</a>', '<span class="location-tag">总部 · 展厅 · 仓储中心</span><h3>悉尼</h3><p>84 Dunheved Circuit,<br>St Marys NSW 2760<br>3,600m² 展厅 · 5,000m² 仓储</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=84+Dunheved+Circuit+St+Marys+NSW+2760" target="_blank" rel="noreferrer">获取路线 ↗</a>'],
  ['<span class="location-tag">WAREHOUSE LOCATION</span><h3>Gold Coast</h3><p>43 Egerton St,<br>Southport QLD 4215</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=43+Egerton+St+Southport+QLD+4215" target="_blank" rel="noreferrer">Get directions ↗</a>', '<span class="location-tag">仓储展示中心</span><h3>黄金海岸</h3><p>43 Egerton St,<br>Southport QLD 4215</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=43+Egerton+St+Southport+QLD+4215" target="_blank" rel="noreferrer">获取路线 ↗</a>'],
  ['<span class="location-tag">SERVICING MELBOURNE</span><h3>Melbourne</h3><p>Talk with our team about options and availability in your area.</p><a class="text-link" href="#contact">Ask our team ↗</a>', '<span class="location-tag">墨尔本服务中心</span><h3>墨尔本</h3><p>联系我们的团队，了解您所在区域的产品与配送信息。</p><a class="text-link" href="#contact">咨询团队 ↗</a>'],
  ['<span class="eyebrow">SHOWROOM HOURS</span>', '<span class="eyebrow">展厅开放时间</span>'],
  ['Monday–Friday <strong>9:00am–5:00pm</strong>', '周一至周五 <strong>上午 9:00 – 下午 5:00</strong>'],
  ['Saturday <strong>10:00am–4:00pm</strong>', '周六 <strong>上午 10:00 – 下午 4:00</strong>'],
  ['All showroom visits by appointment only.', '展厅参观仅限提前预约。'],
  ['Book an appointment <span class="button-icon">↗</span>', '预约参观展厅 <span class="button-icon">↗</span>'],
  ['SYDNEY · ST MARYS', '悉尼 · 圣玛丽斯'],

  // --- FAQ ---
  ['<p class="eyebrow">GOOD QUESTIONS, CLEAR ANSWERS</p><h2>Before you<br><em>make room.</em></h2>', '<p class="eyebrow">常见疑问，权威解答</p><h2>开启选购前的<br><em>常见解答。</em></h2>'],
  ['Do I need council approval for a tiny home or pod?', '建造微型房屋或太空舱需要市政审批（Council Approval）吗？'],
  ['Requirements depend on your local council, site, intended use and the selected model. Please check with your local authority and qualified professionals before purchase. Our team can help discuss the product information relevant to your plans.', '要求取决于您当地的市政厅（Council）、场地情况、具体用途以及所选型号。购买前请咨询当地主管机构或专业规划人士。我们的团队很乐意协助提供符合您规划的技术参数与资料。'],
  ['How long does delivery take?', '配送交付需要多长时间？'],
  ['Delivery timing varies by model, stock status, configuration and destination. Contact our team for current availability and an estimate for your location.', '交付周期取决于具体型号、现货库存、定制配置及送达目的地。欢迎联系团队了解当前现货情况及您所在地址的预估时效。'],
  ['Can I customise the layout or finishes?', '我可以定制内部布局或表面材质风格吗？'],
  ['Options depend on the model. Ask us about available layouts, finishes and configurations for the space you are considering.', '可定制范围视具体型号而定。欢迎向我们咨询您心仪型号的可用布局、内饰及配置方案。'],
  ['Are off-grid options available?', '提供离网（Off-grid）太阳能与储能方案吗？'],
  ['Features and utility connections vary by product. Tell us about your site and intended use so we can discuss what is available for your chosen model.', '各项功能与公用管线接入因产品而异。请告知您的场地条件与用途，我们将为您量身推荐适用的离网配置方案。'],
  ['What warranty comes with a product?', '产品享有怎样的质保服务？'],
  ['Warranty information varies by product. Please request the current warranty terms for your model before placing an order.', '质保条款因产品型号而异。下单前请向销售团队索取所选型号的具体质保细则。'],
  ['Can I get finance for a micro home?', '购买微型房屋可以申请分期贷款吗？'],
  ['Finance options may be available, subject to provider terms, eligibility, assessment and approval. Visit our <a href="/finance">finance page</a> for indicative information.', '可提供金融分期方案，具体取决于金融机构条款、资质评估与审批。欢迎访问我们的 <a href="/finance">金融分期页面</a> 了解参考方案。'],

  // --- Contact Page ---
  ['<p class="eyebrow">LET\'S TALK ABOUT YOUR SPACE</p>', '<p class="eyebrow">聊聊您的空间构想</p>'],
  ['<h2>Small footprint.<br><em>Big living.</em></h2>', '<h2>占地小巧，<br><em>尽享宽阔生活。</em></h2>'],
  ['Tell us what you have in mind. Our team can help you explore models, availability and next steps.', '告诉我们您的构想，团队将协助您挑选型号、确认库存并规划后续流程。'],
  ['Call 1300 229 166 <span class="button-icon">↗</span>', '致电 1300 229 166 <span class="button-icon">↗</span>'],
  ['<span>SYDNEY · GOLD COAST · MELBOURNE</span><span>Showroom visits by appointment</span>', '<span>悉尼 · 黄金海岸 · 墨尔本</span><span>展厅参观仅限提前预约</span>'],
  ['<p class="eyebrow">START A CONVERSATION</p>', '<p class="eyebrow">开启咨询对话</p>'],
  ['Choose “Get a Quote” and tell us what you need.<br>We’ll get back to you during business hours.', '点击“获取报价”并告诉我们您的需求。<br>我们将在工作时间内与您联系。'],

  // --- Finance Page ---
  ['<p class="eyebrow">FINANCE · PLAN YOUR PURCHASE</p>', '<p class="eyebrow">金融分期 · 规划您的购房预算</p>'],
  ['<h1>A more flexible way<br>to plan your <em>purchase.</em></h1>', '<h1>更灵活的<br>购房分期<em>规划方式。</em></h1>'],
  ['Explore an indicative finance scenario and get a clearer idea of potential repayments before taking the next step with your Micro Homes Direct purchase.', '探索参考分期方案，在迈出购买下一步之前，清晰了解每月预计还款额度。'],
  ['Talk to our team <span class="button-icon">↗</span>', '咨询专业顾问 <span class="button-icon">↗</span>'],
  ['<p class="eyebrow">FINANCE CALCULATOR</p>', '<p class="eyebrow">金融还款计算器</p>'],
  ['<h2 id="finance-calculator-title">Estimate your <em>repayments.</em></h2>', '<h2 id="finance-calculator-title">估算您的<em>还款金额。</em></h2>'],
  ['Adjust the calculator below to explore an indicative repayment scenario based on your preferred finance amount.', '通过下方计算器调整贷款金额，探索适合您的还款试算方案。'],
  ['<strong>PLEASE NOTE</strong> Calculator results are indicative only and are provided as a general guide. They do not represent a formal quote, a contract, or a pre-qualification for credit. Applications remain subject to standard lending criteria, credit assessment, financial verification guidelines and formal lender approval.', '<strong>温馨提示</strong> 计算器结果仅供参考，不构成正式报价、合同或贷款预批。申请须符合金融机构的标准贷款条件、信用评估及正式审批。'],

  // --- About Page & Partners ---
  ['<p class="eyebrow">MORE WAYS TO MOVE FORWARD</p><h2>Build a future<br><em>that fits.</em></h2>', '<p class="eyebrow">更多合作与实现方式</p><h2>打造合拍的<br><em>未来空间。</em></h2>'],
  ['<p class="eyebrow">FINANCE OPTIONS</p><h3>Finance your<br><em>tiny home.</em></h3><p>Explore indicative finance information and understand the next steps for your purchase.</p><a class="button" href="/finance">Learn about Finance <span class="button-icon">↗</span></a><small>Subject to eligibility, assessment and approval. Terms may vary by provider.</small>', '<p class="eyebrow">分期付款方案</p><h3>为您的微型房屋<br><em>办理分期。</em></h3><p>了解参考金融方案，明确下一步购房手续。</p><a class="button" href="/finance">了解金融详情 <span class="button-icon">↗</span></a><small>须符合金融机构资质、评估及审批要求。条款可能因机构而异。</small>'],
  ['<p class="eyebrow">GROW WITH US</p><h3>Become a<br><em>reseller.</em></h3><p>Interested in representing Micro Homes Direct? Start a conversation with our team.</p><button class="button quote-open" type="button" data-interest="Become a reseller">Partner with us <span class="button-icon">↗</span></button>', '<p class="eyebrow">携手发展</p><h3>成为品牌<br><em>经销商/加盟商。</em></h3><p>有意代理 Micro Homes Direct 品牌产品？欢迎与我们开启合作对话。</p><button class="button quote-open" type="button" data-interest="Become a reseller">与我们携手合作 <span class="button-icon">↗</span></button>'],

  // --- Shop Page Hero ---
  ['<h1>Make room for<br><em>what matters.</em></h1>', '<h1>为真正重要的<br><em>事情腾出空间。</em></h1>'],
  ['Browse our complete range by category. Compare product photos and current listed prices, all in one place.', '按分类浏览完整产品系列。产品实拍、在售价格一览无余。'],
  ['Explore all categories <span aria-hidden="true">↓</span>', '探索所有分类 <span aria-hidden="true">↓</span>'],

  // --- Blog / Journal ---
  ['<span class="journal-label">FEATURED GUIDE</span>', '<span class="journal-label">精选指南</span>'],
  ['<h2 id="journal-feature-title">Planning the full cost of a tiny home</h2>', '<h2 id="journal-feature-title">微型房屋全成本规划指南</h2>'],
  ['Look beyond the purchase price. Transport, site preparation and local requirements can all shape your project budget.', '除了房屋本身价格，运输、场地平整通水电及市政审批都将影响您的整体预算。'],
  ['Read the guide <span class="button-icon">↗</span>', '阅读指南 <span class="button-icon">↗</span>'],
  ['<p class="eyebrow">LATEST STORIES</p>', '<p class="eyebrow">最新文章</p>'],
  ['<h2 id="journal-stories-title">Explore the journal.</h2>', '<h2 id="journal-stories-title">探索博客特刊。</h2>'],
  ['Clear answers and fresh ideas for choosing a space that works for you.', '为您挑选理想空间提供清晰解答与实用灵感。'],
  ['<span class="journal-label">DESIGN &amp; BUILD</span>', '<span class="journal-label">设计与建造</span>'],
  ['<h3>Modular and prefab homes: what sets them apart?</h3>', '<h3>模块化与预制房屋：它们有何区别？</h3>'],
  ['Get familiar with off-site building terms and questions to ask when comparing home options.', '熟悉工厂化异地建造专业术语，掌握挑选房屋的核心提问技巧。'],
  ['Read the article <span>↗</span>', '阅读全文 <span>↗</span>'],
  ['<span class="journal-label">SPACE &amp; PLANNING</span>', '<span class="journal-label">空间与规划</span>'],
  ['<h3>Planning an expandable home for your site</h3>', '<h3>为您的场地规划双翼拓展房</h3>'],
  ['Consider layout, delivery access and the practical details involved in adding flexible living space.', '全面考量户型格局、运输道路通达性及落地安装的实操细节。'],
  ['Have a project in mind?', '心里有构想中的项目吗？'],
  ['Talk with our team <span class="button-icon">↗</span>', '与团队顾问交流 <span class="button-icon">↗</span>'],
  ['← Back to the journal', '← 返回博客特刊'],
  ['<p class="journal-label">PRACTICAL GUIDE · AUSTRALIA</p>', '<p class="journal-label">实用指南 · 澳大利亚</p>'],
  ['<h1 id="cost-guide-title">What does a tiny home really <em>cost?</em></h1>', '<h1 id="cost-guide-title">建造一座微型房屋真正需要<em>多少预算？</em></h1>'],
  ['A clear way to think about the full project budget—from choosing the home to getting it ready to use.', '从挑选房屋到交付使用，全面拆解整体项目预算。'],
  ['A planning guide from Micro Homes Direct', 'Micro Homes Direct 出品的规划指南'],
  ['Explore the cost breakdown <span>↓</span>', '浏览费用明细 <span>↓</span>'],
  ['<span>PLAN WITH THE FULL PICTURE</span><strong>Make room for what matters.</strong>', '<span>全景视角，周全规划</span><strong>为真正重要的事情腾出空间。</strong>'],
  ['<span class="cost-guide-kicker">01 · START WITH THE WHOLE PROJECT</span>', '<span class="cost-guide-kicker">01 · 从整体项目着手</span>'],
  ['<h2 id="cost-guide-total">Start with the total project, not just the home</h2>', '<h2 id="cost-guide-total">关注整体项目总预算，而非仅房屋单价</h2>'],
  ['<span class="cost-guide-snapshot-title">YOUR PROJECT, AT A GLANCE</span>', '<span class="cost-guide-snapshot-title">项目要点一览</span>'],
  ['<div><span>01</span><p>Choose your home</p></div>', '<div><span>01</span><p>挑选心仪房屋</p></div>'],
  ['<div><span>02</span><p>Prepare the site</p></div>', '<div><span>02</span><p>场地平整准备</p></div>'],
  ['<div><span>03</span><p>Plan delivery &amp; placement</p></div>', '<div><span>03</span><p>规划运输与落位</p></div>'],
  ['<div><span>04</span><p>Connect services</p></div>', '<div><span>04</span><p>通水通电通网络</p></div>'],
  ['<div><span>05</span><p>Confirm local requirements</p></div>', '<div><span>05</span><p>确认当地市政规范</p></div>'],
  ['<h2 id="cost-guide-factors">The main costs to allow for</h2>', '<h2 id="cost-guide-factors">需要预留预算的核心费用构成</h2>'],
  ['<h2 id="cost-guide-quote">How to get a useful, comparable quote</h2>', '<h2 id="cost-guide-quote">如何获取精准、可横向比对的有效报价</h2>'],
  ['<p class="journal-label">DESIGN &amp; BUILD · HOME GUIDE</p>', '<p class="journal-label">设计与建造 · 选房指南</p>'],
  ['<h1 id="modular-article-title">Modular and prefab homes: <em>what sets them apart?</em></h1>', '<h1 id="modular-article-title">模块化与预制房屋：<em>它们有何区别？</em></h1>'],
  ['Understand the language of off-site building, then compare the details that matter for your site and plans.', '了解工厂异地预制建造术语，比对切合您场地与规划的关键细节。'],
  ['<span class="journal-article-kicker">01 · KNOW THE TERMS</span>', '<span class="journal-article-kicker">01 · 搞懂专业术语</span>'],
  ['<h2 id="modular-meaning">Prefab is the broad idea; modular describes one approach</h2>', '<h2 id="modular-meaning">“预制”是广义概念，“模块化”是其中一种实现方式</h2>'],
  ['<span class="journal-article-kicker">02 · COMPARE WITH CONFIDENCE</span>', '<span class="journal-article-kicker">02 · 掌握比对底气</span>'],
  ['<h2 id="modular-compare">Questions that make options easier to compare</h2>', '<h2 id="modular-compare">让选房比对更加轻松清晰的核心提问</h2>'],
  ['<h2 id="modular-next">Start with the space you need.</h2>', '<h2 id="modular-next">从您真正需要的空间起步。</h2>'],
  ['Browse pods, homes and other options, then compare the actual dimensions, inclusions and site requirements for your project.', '浏览太空舱、微型房屋等多样选项，综合比对尺寸、配置与场地要求。'],
  ['Explore the product range <span class="button-icon">↗</span>', '探索完整产品系列 <span class="button-icon">↗</span>'],
  ['<p class="journal-label">SPACE &amp; PLANNING · SITE GUIDE</p>', '<p class="journal-label">空间与规划 · 场地指南</p>'],
  ['<h1 id="expandable-article-title">Planning an expandable home <em>for your site.</em></h1>', '<h1 id="expandable-article-title">为您的场地规划双翼拓展房屋<em>。</em></h1>'],
  ['A flexible layout works best when the building, access route and site are considered together.', '房屋本体、通达道路与场地条件统筹考虑，灵活布局方能发挥最大价值。'],
  ['<span class="journal-article-kicker">01 · PLAN THE WHOLE SITE</span>', '<span class="journal-article-kicker">01 · 统筹规划整个场地</span>'],
  ['<h2 id="expandable-plan">Begin with how the space will be used</h2>', '<h2 id="expandable-plan">从空间实际使用需求切入</h2>'],
  ['<span class="journal-article-kicker">02 · CHECK ACCESS &amp; SERVICES</span>', '<span class="journal-article-kicker">02 · 检查通行道路与市政管网</span>'],
  ['<h2 id="expandable-access">The practical details to confirm early</h2>', '<h2 id="expandable-access">需要尽早核实的实操关键细节</h2>'],
  ['<span class="journal-article-kicker">03 · GET A USEFUL QUOTE</span>', '<span class="journal-article-kicker">03 · 获取高价值有效报价</span>'],
  ['<h2 id="expandable-quote">Give suppliers the same information</h2>', '<h2 id="expandable-quote">向各供应商提供一致的信息</h2>'],
  ['<h2 id="expandable-next">Explore the options for your plans.</h2>', '<h2 id="expandable-next">探索切合您规划的丰富选项。</h2>'],
  ['Browse the range and tell our team about your intended use, location and any site questions you are working through.', '浏览系列产品，告诉我们您的规划用途、场地位置及正在考虑的任何疑问。']
];

/**
 * Fast string translation for full HTML markups
 */
export function translateMarkup(rawHtml, lang) {
  if (!rawHtml || lang !== "zh") return rawHtml;

  let result = rawHtml;

  // 1. Full multi-element snippet replacements
  for (const [english, chinese] of markupReplacements) {
    result = result.replaceAll(english, chinese);
  }

  // 2. Translate translatable attributes: aria-label, placeholder, title
  result = result.replace(/(aria-label|placeholder|title)="([^"]+)"/g, (match, attr, value) => {
    const trimmed = value.trim();
    if (dictionary[trimmed]) {
      return `${attr}="${dictionary[trimmed]}"`;
    }
    return match;
  });

  // 3. Translate remaining text nodes between tags
  result = result.replace(/>([^<]+)</g, (match, textContent) => {
    const trimmed = textContent.trim();
    if (!trimmed || /^[\d\s.,/\\#!$%^&*;:{}=\-_`~()+-]+$/.test(trimmed)) {
      return match;
    }

    if (dictionary[trimmed]) {
      return match.replace(trimmed, dictionary[trimmed]);
    }

    // Match with arrow symbol like " ↗" or " ↘"
    const arrowMatch = trimmed.match(/^(.*?)\s*([↗↘→↓←+×])$/);
    if (arrowMatch && dictionary[arrowMatch[1]]) {
      return match.replace(trimmed, `${dictionary[arrowMatch[1]]} ${arrowMatch[2]}`);
    }

    return match;
  });

  return result;
}
