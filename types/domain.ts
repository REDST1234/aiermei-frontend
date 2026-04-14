export type ContentCategory = 'pregnancy' | 'postpartum' | 'parenting' | 'nanny';

export interface UserPath {
  path: string;
  timestamp: number;
  duration?: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  avatar?: string;
  phone?: string;
  memberLevel?: string;
  isLoggedIn: boolean;
  pregnancyInfo?: {
    type: 'pregnancy' | 'postpartum';
    date: string;
  };
  tags?: string[];
  lastActive: string | number;
  paths?: UserPath[];
}

export interface Banner {
  id: string;
  title: string;
  buttonText?: string;
  image: string;
  detailTitle?: string;
  detailContent?: string;
}

export interface BannerDetail {
  id: string;
  title: string;
  content: string;
  image?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  cover: string;
  mediaUrl?: string;
  type: 'image' | 'video';
  category: ContentCategory;
  author: string;
  likes: number;
  content?: string;
  publishedAt?: string;
}

export interface ContentCategoryItem {
  id: string;
  label: string;
}

export interface FortuneCard {
  date: string;
  suitable: string;
  avoid: string;
  greeting: string;
}

export interface PresetQuestion {
  id?: string;
  question: string;
  answer: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  desc?: string;
  coverImage?: string;
}

export interface CenterSection {
  id: string;
  title: string;
  desc?: string;
  coverImage?: string;
}

export interface CenterSectionDetail {
  id: string;
  title: string;
  detailImage: string;
}

export interface CenterHome {
  heroImage: string;
  brandTitle: string;
  brandSubtitle: string;
  facilities: {
    id: string;
    title: string;
    desc: string;
    image: string;
  }[];
}

export interface Suite {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  size?: string;
  features: string[];
  coverImage?: string;
  images?: string[];
  description?: string;
  facilities?: string[];
}

export interface Coupon {
  id: string | number;
  name: string;
  value: number;
  valueLabel: string;
  expiry: string;
  status: string;
}

export interface PostpartumService {
  id: string | number;
  name: string;
  time: string;
  status: string;
  expert: string;
}

export interface FaqCategory {
  id: string;
  name: string;
}

export interface FaqItem {
  id: string;
  categoryId: string;
  title: string;
  content: string;
}

export interface HotlineInfo {
  label: string;
  number: string;
}

export interface ServiceHotlines {
  hotlines: HotlineInfo[];
  serviceQrCodeUrl: string;
  serviceQrTips: string;
}

export interface QrCodeResponse {
  qrCodeUrl: string;
  consultantName?: string;
  tips?: string;
}

export interface AnalysisResult {
  tags: string[];
  script: string;
}

export interface Magazine {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  desc?: string;
}

export interface MagazineDetail {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  author?: string;
  content: string;
  publishedAt?: string;
}

export interface DashboardOverview {
  activeCustomers: number;
  avgStayMinutes: number;
  leadConversionRate: number;
  hotContentTitle: string;
}

export interface UserJourney {
  uid: string;
  paths: {
    path: string;
    timestamp: string;
  }[];
  tags?: string[];
  lastActive: string;
}