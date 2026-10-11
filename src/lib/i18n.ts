export const LANGS = ["en", "fr", "ar"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);
export const dirOf = (l: Lang) => (l === "ar" ? "rtl" : "ltr");

type Dict = Record<string, string>;

const en: Dict = {
  appName: "HN RentCar",
  dashboard: "Dashboard", cars: "Cars", customers: "Customers", bookings: "Bookings", contracts: "Rental contracts",
  payments: "Payments", expenses: "Expenses", maintenance: "Maintenance", documents: "Documents & images",
  alerts: "Alerts", reports: "Reports", settings: "Settings", audit: "Audit logs",
  search: "Search…", all: "All", new: "New", save: "Save", cancel: "Cancel", role: "Role", language: "Language",
  status: "Status", actions: "Actions", view: "View", noAccess: "You don't have permission to view this page.",
  readOnly: "Read only", openApp: "Open the platform", browseFleet: "Browse fleet", home: "Home",
  heroTitle: "Rent the right car. Run the whole agency.", heroSub: "Fleet, bookings, contracts, payments and reports — one platform for every role in your rental agency.",
  ourFleet: "Our fleet", perDay: "/ day", bookNow: "Book now", welcome: "Welcome back",
  revenue: "Revenue (month)", activeRentals: "Active rentals", fleetUtil: "Fleet utilization", outstanding: "Outstanding balance",
  myBookings: "My bookings", myBalance: "My balance", systemHealth: "System health", users: "Users", errors: "Errors (24h)",
  todayPickups: "Today's pickups", todayReturns: "Today's returns", expensesMonth: "Expenses (month)", netProfit: "Net profit",
  recent: "Recent activity", permissions: "Role permissions", read: "Read", write: "Write",
  available: "Available", rented: "Rented", pending: "Pending", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled",
  paid: "Paid", partial: "Partial", unpaid: "Unpaid", active: "Active", closed: "Closed", open: "Open", done: "Done", scheduled: "Scheduled",
  high: "High", medium: "Medium", low: "Low", verified: "Verified", expired: "Expired",
  ref: "Ref", model: "Model", plate: "Plate", category: "Category", price: "Price/day", name: "Name", phone: "Phone", city: "City",
  license: "License", customer: "Customer", car: "Car", from: "From", to: "To", total: "Total", amount: "Amount", method: "Method",
  date: "Date", label: "Label", type: "Type", cost: "Cost", file: "File", owner: "Owner", message: "Message", priority: "Priority",
  period: "Period", user: "User", action: "Action", target: "Target", rentals: "Rentals", deposit: "Deposit",
  r_developer: "Developer", r_owner: "Owner", r_manager: "Manager", r_operator: "Operator", r_accountant: "Accountant", r_customer: "Customer", r_visitor: "Visitor",
};

const fr: Dict = {
  appName: "HN RentCar",
  dashboard: "Tableau de bord", cars: "Véhicules", customers: "Clients", bookings: "Réservations", contracts: "Contrats de location",
  payments: "Paiements", expenses: "Dépenses", maintenance: "Entretien", documents: "Documents & images",
  alerts: "Alertes", reports: "Rapports", settings: "Paramètres", audit: "Journal d'audit",
  search: "Rechercher…", all: "Tous", new: "Nouveau", save: "Enregistrer", cancel: "Annuler", role: "Rôle", language: "Langue",
  status: "Statut", actions: "Actions", view: "Voir", noAccess: "Vous n'avez pas la permission d'accéder à cette page.",
  readOnly: "Lecture seule", openApp: "Ouvrir la plateforme", browseFleet: "Voir la flotte", home: "Accueil",
  heroTitle: "Louez la bonne voiture. Gérez toute l'agence.", heroSub: "Flotte, réservations, contrats, paiements et rapports — une plateforme pour chaque rôle de votre agence.",
  ourFleet: "Notre flotte", perDay: "/ jour", bookNow: "Réserver", welcome: "Bon retour",
  revenue: "Chiffre d'affaires (mois)", activeRentals: "Locations actives", fleetUtil: "Taux d'utilisation", outstanding: "Solde impayé",
  myBookings: "Mes réservations", myBalance: "Mon solde", systemHealth: "État du système", users: "Utilisateurs", errors: "Erreurs (24h)",
  todayPickups: "Départs du jour", todayReturns: "Retours du jour", expensesMonth: "Dépenses (mois)", netProfit: "Bénéfice net",
  recent: "Activité récente", permissions: "Permissions des rôles", read: "Lecture", write: "Écriture",
  available: "Disponible", rented: "Louée", pending: "En attente", confirmed: "Confirmée", completed: "Terminée", cancelled: "Annulée",
  paid: "Payé", partial: "Partiel", unpaid: "Impayé", active: "Actif", closed: "Clôturé", open: "Ouvert", done: "Fait", scheduled: "Planifié",
  high: "Haute", medium: "Moyenne", low: "Basse", verified: "Vérifié", expired: "Expiré",
  ref: "Réf", model: "Modèle", plate: "Immatriculation", category: "Catégorie", price: "Prix/jour", name: "Nom", phone: "Téléphone", city: "Ville",
  license: "Permis", customer: "Client", car: "Véhicule", from: "Du", to: "Au", total: "Total", amount: "Montant", method: "Mode",
  date: "Date", label: "Libellé", type: "Type", cost: "Coût", file: "Fichier", owner: "Propriétaire", message: "Message", priority: "Priorité",
  period: "Période", user: "Utilisateur", action: "Action", target: "Cible", rentals: "Locations", deposit: "Caution",
  r_developer: "Développeur", r_owner: "Propriétaire", r_manager: "Gérant", r_operator: "Opérateur", r_accountant: "Comptable", r_customer: "Client", r_visitor: "Visiteur",
};

const ar: Dict = {
  appName: "HN RentCar",
  dashboard: "لوحة التحكم", cars: "السيارات", customers: "العملاء", bookings: "الحجوزات", contracts: "عقود الإيجار",
  payments: "المدفوعات", expenses: "المصاريف", maintenance: "الصيانة", documents: "الوثائق والصور",
  alerts: "التنبيهات", reports: "التقارير", settings: "الإعدادات", audit: "سجل التدقيق",
  search: "بحث…", all: "الكل", new: "جديد", save: "حفظ", cancel: "إلغاء", role: "الدور", language: "اللغة",
  status: "الحالة", actions: "إجراءات", view: "عرض", noAccess: "ليس لديك صلاحية لعرض هذه الصفحة.",
  readOnly: "قراءة فقط", openApp: "افتح المنصة", browseFleet: "تصفح الأسطول", home: "الرئيسية",
  heroTitle: "استأجر السيارة المناسبة. وأدر وكالتك بالكامل.", heroSub: "الأسطول والحجوزات والعقود والمدفوعات والتقارير — منصة واحدة لكل دور في وكالتك.",
  ourFleet: "أسطولنا", perDay: "/ يوم", bookNow: "احجز الآن", welcome: "مرحباً بعودتك",
  revenue: "الإيرادات (الشهر)", activeRentals: "إيجارات نشطة", fleetUtil: "نسبة استغلال الأسطول", outstanding: "الرصيد المستحق",
  myBookings: "حجوزاتي", myBalance: "رصيدي", systemHealth: "حالة النظام", users: "المستخدمون", errors: "الأخطاء (24س)",
  todayPickups: "استلامات اليوم", todayReturns: "إرجاعات اليوم", expensesMonth: "المصاريف (الشهر)", netProfit: "صافي الربح",
  recent: "النشاط الأخير", permissions: "صلاحيات الأدوار", read: "قراءة", write: "كتابة",
  available: "متاحة", rented: "مؤجرة", pending: "قيد الانتظار", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغى",
  paid: "مدفوع", partial: "جزئي", unpaid: "غير مدفوع", active: "نشط", closed: "مغلق", open: "مفتوح", done: "منجز", scheduled: "مجدول",
  high: "عالية", medium: "متوسطة", low: "منخفضة", verified: "موثق", expired: "منتهي",
  ref: "المرجع", model: "الطراز", plate: "اللوحة", category: "الفئة", price: "السعر/يوم", name: "الاسم", phone: "الهاتف", city: "المدينة",
  license: "الرخصة", customer: "العميل", car: "السيارة", from: "من", to: "إلى", total: "المجموع", amount: "المبلغ", method: "الطريقة",
  date: "التاريخ", label: "البيان", type: "النوع", cost: "التكلفة", file: "الملف", owner: "المالك", message: "الرسالة", priority: "الأولوية",
  period: "الفترة", user: "المستخدم", action: "الإجراء", target: "الهدف", rentals: "الإيجارات", deposit: "الضمان",
  r_developer: "مطور", r_owner: "مالك", r_manager: "مدير", r_operator: "مشغل", r_accountant: "محاسب", r_customer: "عميل", r_visitor: "زائر",
};

const dicts: Record<Lang, Dict> = { en, fr, ar };
export const translator = (l: Lang) => (k: string) => dicts[l][k] ?? en[k] ?? k;
