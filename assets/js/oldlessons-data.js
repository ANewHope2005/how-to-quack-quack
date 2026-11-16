const LESSONS_DATA = [
    {
        id: 1,
        filename: "lesson-01-introduction-to-molecular-docking.md",
        title: "درس ۱: مقدمه‌ای بر داکینگ مولکولی",
        subtitle: "Introduction to Molecular Docking",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۳۰ تا ۴۰ دقیقه",
        objectives: [
            "تعریف داکینگ مولکولی به‌عنوان روش مدلسازی محاسباتی و دامنه کاربرد",
            "مشخص کردن ورودی‌های اصلی شبیه‌سازی داکینگ (هدف، ترکیب شیمیایی، محدوده جایگاه)",
            "تمایز میان پوز اتصال (Binding Pose) و میل اتصالی (Binding Affinity)",
            "نقش رویه نمونه‌برداری و تابع امتیازدهی در موتور داکینگ",
            "مقایسه مزایا و محدودیت‌های روش‌های in silico با wet-lab"
        ],
        quiz: [
            {
                q: "دو خروجی اصلی یک آزمایش داکینگ مولکولی کدامند؟",
                options: ["ساختار پروتئین و توالی اسید آمینه", "پوز اتصال و انرژی یا میل اتصالی", "سرعت اجرا و حجم فایل PDB", "تعداد پیوندهای هیدروژنی و وزن مولکولی"],
                correct: 1,
                explanation: "داکینگ دو ویژگی بنیادی پیش‌بینی می‌کند: پوز اتصال (هندسه سه‌بعدی لیگاند در هدف) و انرژی اتصال/میل اتصالی."
            },
            {
                q: "طبق قرارداد ترمودینامیکی انرژی آزاد گیبس، مقادیر منفی‌تر انرژی اتصال نشان‌دهنده چیست؟",
                options: ["برهم‌کنش نامطلوب و دافعه", "اتصال پایدارتر و مطلوب‌تر", "سرعت پایین نمونه‌برداری", "تجزیه شدن لیگاند در آب"],
                correct: 1,
                explanation: "مقادیر منفی‌تر انرژی آزاد به معنای آزاد شدن انرژی بیشتر هنگام تشکیل کمپلکس و اتصال پایدارتر است."
            }
        ],
        glossary: [
            { term: "Molecular Docking", fa: "داکینگ مولکولی", desc: "روش مدلسازی محاسباتی برای پیش‌بینی چگونگی قرارگیری و پایداری اتصال لیگاند به هدف زیستی." },
            { term: "Ligand", fa: "لیگاند", desc: "مولکول کوچک (مانند دارو) که به پروتئین متصل می‌شود." },
            { term: "Binding Pose", fa: "پوز اتصال", desc: "هندسه و آرایش سه‌بعدی اتم‌های لیگاند در حالت متصل به هدف." }
        ],
        content: `# درس ۱: مقدمه‌ای بر داکینگ مولکولی (Introduction to Molecular Docking)

## الف. نمای کلی درس (Lesson Overview)
پیش از آنکه یک داروی جدید در آزمایشگاه ساخته شود... [محتوای کامل درس ۱]`
    },
    {
        id: 2,
        filename: "lesson-02-applications-in-drug-discovery.md",
        title: "درس ۲: کاربردهای داکینگ در کشف دارو",
        subtitle: "Applications in Drug Discovery",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۳۵ تا ۴۵ دقیقه",
        objectives: [
            "مقایسه نقش داکینگ در غربالگری مجازی (Hit Identification) و بهینه‌سازی سرنخ (Lead Optimization)",
            "مقایسه غربالگری مجازی مبتنی بر داکینگ با HTS و روش‌های مبتنی بر لیگاند",
            "پنج راهکار اصلی استفاده از پوزها در بهینه‌سازی لیگاند",
            "نقش داکینگ در مکانیسم عمل و کاربردهای تخصصی مانند داکینگ معکوس"
        ],
        quiz: [
            {
                q: "مزیت اصلی غربالگری مجازی مبتنی بر داکینگ چیست؟",
                options: ["نیاز حتمی به سنتز فیزیکی تمام ترکیبات پیش از آزمون", "کشف داربست‌های شیمیایی کاملاً نوین و مقیاس عظیم کتابخانه‌ها", "جایگزینی صددرصدی آزمایشگاه تر", "دقت مطلق در پیش‌بینی ADMET بدن"],
                correct: 1,
                explanation: "غربالگری مجازی امکان بررسی میلیون‌ها تا میلیاردها ترکیب دیجیتال و کشف داربست‌های شیمیایی کاملاً جدید را فراهم می‌کند."
            }
        ],
        glossary: [
            { term: "Virtual Screening", fa: "غربالگری مجازی", desc: "آزمایش رایانه‌ای کتابخانه ترکیبات در برابر هدف زیستی." },
            { term: "Hit Identification", fa: "شناسایی ترکیب اولیه", desc: "یافتن مولکول‌های اولیه متصل‌شونده به هدف." }
        ],
        content: `# درس ۲: کاربردهای داکینگ در کشف دارو...`
    },
    // درس‌های ۳ تا ۱۲ نیز با همین ساختار دقیق در کد تجمیع می‌شوند...
    {
        id: 3,
        filename: "lesson-03-protein-ligand-receptor-and-binding-site.md",
        title: "درس ۳: پروتئین، لیگاند، گیرنده و جایگاه اتصال",
        subtitle: "Protein, Ligand, Receptor and Binding Site",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۳۰ تا ۴۰ دقیقه",
        objectives: ["تعریف پروتئین، هدف و گیرنده", "شناخت جایگاه اتصال و جعبه سه‌بعدی", "تفاوت آب‌های عملکردی و آب‌های تبلور"],
        quiz: [], glossary: [], content: `# درس ۳: پروتئین، لیگاند، گیرنده و جایگاه اتصال...`
    },
    {
        id: 4,
        filename: "lesson-04-protein-structure-and-binding-pockets.md",
        title: "درس ۴: ساختار پروتئین و حفره‌های اتصال",
        subtitle: "Protein Structure and Binding Pockets",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۰ تا ۵۰ دقیقه",
        objectives: ["مقایسه منابع ساختار سه‌بعدی", "تمایز هولو و آپو و فروریختن حفره", "معیارهای کیفی رزولوشن و ساختار"],
        quiz: [], glossary: [], content: `# درس ۴: ساختار پروتئین و حفره‌های اتصال...`
    },
    {
        id: 5,
        filename: "lesson-05-non-covalent-molecular-interactions.md",
        title: "درس ۵: برهم‌کنش‌های مولکولی غیرکووالانسی",
        subtitle: "Non-covalent Molecular Interactions",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۳۵ تا ۴۵ دقیقه",
        objectives: ["نیروهای الکترواستاتیک، پل نمکی، پیوند هیدروژنی، وان‌دروالس", "نقش وضعیت پروتونه و آب‌های حلال"],
        quiz: [], glossary: [], content: `# درس ۵: برهم‌کنش‌های مولکولی غیرکووالانسی...`
    },
    {
        id: 6,
        filename: "lesson-06-binding-pose-and-binding-affinity.md",
        title: "درس ۶: پوز اتصال و میل اتصالی",
        subtitle: "Binding Pose and Binding Affinity",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۰ تا ۵۰ دقیقه",
        objectives: ["تفاوت پوز و میل اتصالی", "انرژی آزاد گیبس و شاخص RMSD", "بنچمارک CASF-2016"],
        quiz: [], glossary: [], content: `# درس ۶: پوز اتصال و میل اتصالی...`
    },
    {
        id: 7,
        filename: "lesson-07-sampling-procedures.md",
        title: "درس ۷: رویه‌های نمونه‌برداری",
        subtitle: "Sampling Procedures",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۰ تا ۵۰ دقیقه",
        objectives: ["درجات آزادی در جستجو", "روش‌های سیستماتیک و تصادفی (مونت‌کارلو، ژنتیک)", "مدل‌های مولد هوش مصنوعی"],
        quiz: [], glossary: [], content: `# درس ۷: رویه‌های نمونه‌برداری...`
    },
    {
        id: 8,
        filename: "lesson-08-scoring-functions.md",
        title: "درس ۸: توابع امتیازدهی",
        subtitle: "Scoring Functions",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۰ تا ۵۰ دقیقه",
        objectives: ["توابع تجربی، میدان نیرو و دانش", "محدودیت‌های مدل‌های خطی", "شبکه‌های عمیق (CNN و GNN)"],
        quiz: [], glossary: [], content: `# درس ۸: توابع امتیازدهی...`
    },
    {
        id: 9,
        filename: "lesson-09-main-docking-types-and-approaches.md",
        title: "درس ۹: انواع و رویکردهای اصلی داکینگ",
        subtitle: "Main Docking Types and Approaches",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۰ تا ۵۰ دقیقه",
        objectives: ["داکینگ جسم صلب، لیگاند انعطاف‌پذیر و گیرنده انعطاف‌پذیر", "مدل‌های قفل و کلید و برازش القاشده", "داکینگ کور و کووالانسی"],
        quiz: [], glossary: [], content: `# درس ۹: انواع و رویکردهای اصلی داکینگ...`
    },
    {
        id: 10,
        filename: "lesson-10-molecular-docking-workflow.md",
        title: "درس ۱۰: گردش‌کار استاندارد داکینگ مولکولی",
        subtitle: "Molecular Docking Workflow",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۵ تا ۵۵ دقیقه",
        objectives: ["مراحل چهارگانه گردش‌کار", "آماده‌سازی هدف و لیگاند", "فرمت‌های فایل (PDB, PDBQT, MOL2, SDF)", "خوشه‌بندی و بازبینی بصری"],
        quiz: [], glossary: [], content: `# درس ۱۰: گردش‌کار استاندارد داکینگ مولکولی...`
    },
    {
        id: 11,
        filename: "lesson-11-differences-between-docking-md-and-virtual-screeni.md",
        title: "درس ۱۱: تفاوت داکینگ، دینامیک مولکولی و غربالگری مجازی",
        subtitle: "Differences Between Docking, MD, and Virtual Screening",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۰ تا ۵۰ دقیقه",
        objectives: ["تفکیک داکینگ، MD و VS", "کاربردهای مکمل MD (انرژی آزاد کیمیاگرانه، آلوستری)", "یادگیری فعال در غربالگری کتابخانه‌ها"],
        quiz: [], glossary: [], content: `# درس ۱۱: تفاوت داکینگ، دینامیک مولکولی و غربالگری مجازی...`
    },
    {
        id: 12,
        filename: "lesson-12-limitations-and-common-misinterpretations.md",
        title: "درس ۱۲: محدودیت‌ها و خطاهای تفسیری رایج",
        subtitle: "Limitations and Common Misinterpretations",
        module: "ماژول ۰: مبانی داکینگ مولکولی",
        readTime: "۴۰ تا ۵۰ دقیقه",
        objectives: ["محدودیت‌های ساختاری و فیزیکی داکینگ", "خطاهای تفسیری رایج درباره امتیازها و رد اتصال", "جعبه‌ابزار جبرانی پژوهشگر"],
        quiz: [], glossary: [], content: `# درس ۱۲: محدودیت‌ها و خطاهای تفسیری رایج...`
    }
];