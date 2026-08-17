import type { Locale } from "./config";

/**
 * UI translations. English is the source of truth and the shape everything else
 * conforms to. This starts with the shared chrome (header nav + account menu)
 * and grows page by page. Missing keys fall back to English via `t()`.
 */
const en = {
  nav: {
    browse: "Browse Freelancers",
    how: "How It Works",
    about: "About Us",
    trust: "Safety & Trust",
    blog: "Blog",
  },
  account: {
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    editProfile: "Edit profile",
    messages: "Messages",
    logout: "Log out",
  },
};

export type Dictionary = typeof en;

const es: Dictionary = {
  nav: {
    browse: "Buscar freelancers",
    how: "Cómo funciona",
    about: "Sobre nosotros",
    trust: "Seguridad y confianza",
    blog: "Blog",
  },
  account: {
    login: "Iniciar sesión",
    register: "Registrarse",
    dashboard: "Panel",
    editProfile: "Editar perfil",
    messages: "Mensajes",
    logout: "Cerrar sesión",
  },
};

const fr: Dictionary = {
  nav: {
    browse: "Parcourir les freelances",
    how: "Comment ça marche",
    about: "À propos",
    trust: "Sécurité et confiance",
    blog: "Blog",
  },
  account: {
    login: "Connexion",
    register: "S'inscrire",
    dashboard: "Tableau de bord",
    editProfile: "Modifier le profil",
    messages: "Messages",
    logout: "Déconnexion",
  },
};

const de: Dictionary = {
  nav: {
    browse: "Freelancer finden",
    how: "So funktioniert's",
    about: "Über uns",
    trust: "Sicherheit & Vertrauen",
    blog: "Blog",
  },
  account: {
    login: "Anmelden",
    register: "Registrieren",
    dashboard: "Dashboard",
    editProfile: "Profil bearbeiten",
    messages: "Nachrichten",
    logout: "Abmelden",
  },
};

const pt: Dictionary = {
  nav: {
    browse: "Explorar freelancers",
    how: "Como funciona",
    about: "Sobre nós",
    trust: "Segurança e confiança",
    blog: "Blog",
  },
  account: {
    login: "Entrar",
    register: "Cadastrar-se",
    dashboard: "Painel",
    editProfile: "Editar perfil",
    messages: "Mensagens",
    logout: "Sair",
  },
};

const ar: Dictionary = {
  nav: {
    browse: "تصفّح المستقلين",
    how: "كيف يعمل",
    about: "من نحن",
    trust: "الأمان والثقة",
    blog: "المدوّنة",
  },
  account: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    dashboard: "لوحة التحكم",
    editProfile: "تعديل الملف الشخصي",
    messages: "الرسائل",
    logout: "تسجيل الخروج",
  },
};

const zh: Dictionary = {
  nav: {
    browse: "浏览自由职业者",
    how: "工作原理",
    about: "关于我们",
    trust: "安全与信任",
    blog: "博客",
  },
  account: {
    login: "登录",
    register: "注册",
    dashboard: "仪表板",
    editProfile: "编辑资料",
    messages: "消息",
    logout: "退出登录",
  },
};

const ja: Dictionary = {
  nav: {
    browse: "フリーランサーを探す",
    how: "使い方",
    about: "私たちについて",
    trust: "安全性と信頼",
    blog: "ブログ",
  },
  account: {
    login: "ログイン",
    register: "登録",
    dashboard: "ダッシュボード",
    editProfile: "プロフィールを編集",
    messages: "メッセージ",
    logout: "ログアウト",
  },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { en, es, fr, de, pt, ar, zh, ja };
