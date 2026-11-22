import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  // Store Settings
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeDescription: string;
  currency: string;

  // Payment Settings
  taxRate?: number;
  gstPercentage?: number;
  codEnabled: boolean;
  codFee?: number;
  upiEnabled: boolean;
  cardEnabled: boolean;
  walletEnabled: boolean;
  netBankingEnabled: boolean;
  paymentMethods: {
    cod: boolean;
    upi: boolean;
    card: boolean;
    wallet: boolean;
    netBanking: boolean;
  };

  // Shipping Settings
  freeShippingThreshold?: number;
  standardShippingCost?: number;
  expressShippingCost?: number;
  shipping?: {
    standard?: number;
    express?: number;
  };
  internationalShippingEnabled: boolean;

  // Social Media
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
    whatsapp: string;
  };

  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    googleAnalyticsId: string;
    ogImage: string;
  };

  // Contact
  contact: {
    email: string;
    phone: string;
    address: string;
    whatsapp: string;
  };

  giftWrapCharge?: number;
  advancePaymentPercent?: number;
  advancePaymentPercentage?: number;
  shopName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapLink?: string;
  timings: string;
  topBarText: string;
  gstin: string;
  upiId: string;
  invoicePrefix: string;
  nextBillNumber: number;
  defaultGstRate?: number;
  invoiceTerms: string;
  invoiceFooterNote: string;
  logo: string;
  ownerSignature: string;
  ownerName: string;
  invoiceTitle: string;
  returnPolicy: string;
  defaultInvoiceNotes: string;
  showLogo: boolean;
  showSignature: boolean;
  showGstin: boolean;
  stats: {
    yearsExperience: number;
    happyCustomers: number;
    projectsSupplied: number;
  };
  heroHeadline: string;
  heroSubtext: string;
  featuredProductId?: mongoose.Types.ObjectId;
  aboutText: string;
  aboutImage: string;
  social: Map<string, string>;
  qrMode: 'upi' | 'verification';
  analyticsNotice: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    // Store
    storeName: { type: String, default: 'Shree Durga Tiles' },
    storeEmail: { type: String, default: '' },
    storePhone: { type: String, default: '' },
    storeAddress: { type: String, default: 'Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.' },
    storeDescription: { type: String, default: '' },
    currency: { type: String, default: 'INR' },

    // Payment
    taxRate: { type: Number },
    gstPercentage: { type: Number },
    codEnabled: { type: Boolean, default: false },
    codFee: { type: Number },
    upiEnabled: { type: Boolean, default: false },
    cardEnabled: { type: Boolean, default: false },
    walletEnabled: { type: Boolean, default: false },
    netBankingEnabled: { type: Boolean, default: false },
    paymentMethods: {
      cod: { type: Boolean, default: false },
      upi: { type: Boolean, default: false },
      card: { type: Boolean, default: false },
      wallet: { type: Boolean, default: false },
      netBanking: { type: Boolean, default: false },
    },

    // Shipping
    freeShippingThreshold: { type: Number },
    standardShippingCost: { type: Number },
    expressShippingCost: { type: Number },
    shipping: {
      standard: { type: Number },
      express: { type: Number },
    },
    internationalShippingEnabled: { type: Boolean, default: false },

    // Social
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },

    // SEO
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      metaKeywords: { type: String, default: '' },
      googleAnalyticsId: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },

    // Contact
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },

    giftWrapCharge: { type: Number },
    advancePaymentPercent: { type: Number },
    advancePaymentPercentage: { type: Number },
    shopName: { type: String, default: 'Shree Durga Tiles', trim: true },
    tagline: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    whatsapp: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    address: { type: String, default: 'Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.', trim: true },
    mapLink: { type: String, default: '', trim: true },
    timings: { type: String, default: '', trim: true },
    topBarText: { type: String, default: '॥ जय माता दी ॥', trim: true },
    gstin: { type: String, default: '', trim: true, uppercase: true },
    upiId: { type: String, default: '', trim: true },
    invoicePrefix: { type: String, default: 'SDT-', trim: true },
    nextBillNumber: { type: Number, default: 1, min: 1 },
    defaultGstRate: { type: Number, min: 0, max: 100 },
    invoiceTerms: { type: String, default: '' },
    invoiceFooterNote: { type: String, default: '' },
    logo: { type: String, default: '' },
    ownerSignature: { type: String, default: '' },
    ownerName: { type: String, default: '', trim: true },
    invoiceTitle: { type: String, enum: ['TAX INVOICE', 'INVOICE'], default: 'TAX INVOICE' },
    returnPolicy: { type: String, default: '' },
    defaultInvoiceNotes: { type: String, default: '' },
    showLogo: { type: Boolean, default: true },
    showSignature: { type: Boolean, default: true },
    showGstin: { type: Boolean, default: true },
    stats: {
      yearsExperience: { type: Number, default: 0, min: 0 },
      happyCustomers: { type: Number, default: 0, min: 0 },
      projectsSupplied: { type: Number, default: 0, min: 0 },
    },
    heroHeadline: { type: String, default: '' },
    heroSubtext: { type: String, default: '' },
    featuredProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
    aboutText: { type: String, default: '' },
    aboutImage: { type: String, default: '' },
    social: {
      type: Map,
      of: String,
      default: {},
    },
    qrMode: { type: String, enum: ['upi', 'verification'], default: 'upi' },
    analyticsNotice: { type: String, default: '' },
  },
  { timestamps: true }
);


SettingSchema.index({ updatedAt: -1 });

export const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting', SettingSchema);
