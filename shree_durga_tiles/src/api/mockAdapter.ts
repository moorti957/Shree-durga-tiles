import type { AxiosAdapter, AxiosResponse } from 'axios';
import { calculateBill } from '@/features/bills/calc';

type MockBill = Record<string, unknown> & {
  _id: string;
  status: 'draft' | 'final' | 'cancelled';
  billDate: string;
  balanceDue: number;
  grandTotal: number;
  items: Record<string, unknown>[];
  payments: Record<string, unknown>[];
};

const now = new Date().toISOString();
const categories = [
  { _id: 'category-marble', name: 'Marble', slug: 'marble', sortOrder: 0, isVisible: true },
  { _id: 'category-granite', name: 'Granite', slug: 'granite', sortOrder: 1, isVisible: true },
  { _id: 'category-tiles', name: 'Tiles', slug: 'tiles', sortOrder: 2, isVisible: true },
];
let products = [
  {
    _id: 'product-makrana',
    name: 'Makrana White',
    slug: 'makrana-white',
    description: 'Premium polished Makrana white marble.',
    excerpt: 'Pure white · Premium',
    price: 95,
    priceUnit: 'sq_ft',
    size: '600 × 1200 mm',
    finish: 'Polished',
    quality: 'Premium',
    images: [],
    category: { _id: 'category-marble', name: 'Marble' },
    status: 'published',
    inStock: true,
    isActive: true,
  },
  {
    _id: 'product-black-galaxy',
    name: 'Black Galaxy',
    slug: 'black-galaxy',
    description: 'Dark Indian granite with gold flecks.',
    excerpt: 'Black · Premium',
    price: 125,
    priceUnit: 'sq_ft',
    size: '600 × 600 mm',
    finish: 'Polished',
    quality: 'Premium',
    images: [],
    category: { _id: 'category-granite', name: 'Granite' },
    status: 'published',
    inStock: true,
    isActive: true,
  },
];
let bills: MockBill[] = [];
let billSequence = 0;
const paymentKeys = new Map<string, string>();
let enquiries = [
  { _id: 'enquiry-1', name: 'Rakesh Sharma', phone: '9876543210', need: 'Kitchen Top', status: 'new', createdAt: now },
];

const response = (config: Parameters<AxiosAdapter>[0], data: unknown, status = 200): AxiosResponse => ({
  data: status >= 400
    ? { success: false, ...(typeof data === 'object' && data !== null ? data : { error: { code: 'MOCK_ERROR', message: 'Mock request failed.' } }) }
    : { success: true, data },
  status,
  statusText: status >= 400 ? 'Error' : status === 201 ? 'Created' : 'OK',
  headers: {},
  config,
});

const list = <T>(items: T[], params: URLSearchParams) => {
  const page = Number(params.get('page') || 1);
  const limit = Number(params.get('limit') || 20);
  return {
    data: items.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total: items.length, pages: Math.ceil(items.length / limit) },
  };
};

export const mockAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const url = new URL(config.url ?? '/', 'https://mock.local');
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = (config.method ?? 'get').toLowerCase();
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data ?? {};
  const idempotencyHeader = config.headers?.get?.('Idempotency-Key');
  const idempotencyKey = typeof idempotencyHeader === 'string' ? idempotencyHeader : '';

  if (path.endsWith('/admin/auth/login') && method === 'post') {
    return response(config, {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      admin: { id: 'owner', name: 'Shop Owner', identifier: 'owner', role: 'owner' },
    });
  }
  if (path.endsWith('/admin/auth/refresh') && method === 'post') {
    return response(config, { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
  }
  if (path.endsWith('/admin/auth/me')) {
    return response(config, { admin: { id: 'owner', name: 'Shop Owner', identifier: 'owner', role: 'owner' } });
  }
  if (path.endsWith('/admin/dashboard')) {
    return response(config, {
      products: products.length,
      categories: categories.length,
      newEnquiries: enquiries.filter((item) => item.status === 'new').length,
      visitorsToday: 18,
      pageViewsToday: 42,
      bills: bills.length,
      recentEnquiries: enquiries.slice(0, 3),
      liveVisitors: 3,
      publishedProducts: products.filter((item) => item.status === 'published').length,
      draftProducts: products.filter((item) => item.status === 'draft').length,
      paymentDue: 0,
      recentVisitors: [],
      recentBills: bills.slice(0, 3),
    });
  }
  if (path.endsWith('/admin/notifications')) {
    return response(config, {
      enquiries: enquiries.filter((item) => item.status === 'new'),
      bills: bills.filter((item) => item.status === 'final' && item.balanceDue > 0),
    });
  }
  if (path.endsWith('/admin/visitors/live')) return response(config, { count: 0, visitors: [] });
  if (path.endsWith('/admin/settings')) {
    const mockSettings = {
      shopName: 'Shree Durga Tiles',
      tagline: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: 'Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.',
      gstin: '',
      upiId: '',
      invoicePrefix: 'SDT-',
      defaultGstRate: 18,
      invoiceTerms: '',
      invoiceFooterNote: 'Thank you for choosing Shree Durga Tiles.',
      logo: '',
      ownerSignature: '',
      ownerName: '',
      invoiceTitle: 'TAX INVOICE',
      returnPolicy: '',
      defaultInvoiceNotes: '',
      showLogo: true,
      showSignature: true,
      showGstin: true,
      qrMode: 'verification',
    };
    if (method === 'patch') return response(config, { ...mockSettings, ...body });
    return response(config, mockSettings);
  }
  if (path.endsWith('/admin/products') && method === 'get') {
    const q = url.searchParams.get('q')?.toLowerCase();
    const filtered = products.filter((item) => (!q || item.name.toLowerCase().includes(q)) &&
      (!url.searchParams.get('category') || String(item.category._id) === url.searchParams.get('category')) &&
      (!url.searchParams.get('status') || item.status === url.searchParams.get('status')));
    return response(config, list(filtered, url.searchParams));
  }
  if (path.endsWith('/admin/products') && method === 'post') {
    const product = { _id: `product-${Date.now()}`, ...body, images: body.images ?? [], category: categories.find((item) => item._id === body.categoryId) ?? body.categoryId };
    products = [product, ...products];
    return response(config, product, 201);
  }
  if (/\/admin\/products\/[^/]+$/.test(path)) {
    const id = path.split('/').pop();
    const index = products.findIndex((item) => item._id === id);
    if (method === 'get') return response(config, products[index]);
    if (method === 'patch' && index >= 0) {
      products[index] = { ...products[index], ...body };
      return response(config, products[index]);
    }
    if (method === 'delete' && index >= 0) {
      products = products.filter((item) => item._id !== id);
      return response(config, { id, deleted: true });
    }
  }
  const productOperation = path.match(/\/admin\/products\/([^/]+)\/(price|status)$/);
  if (productOperation && method === 'patch') {
    const index = products.findIndex((item) => item._id === productOperation[1]);
    if (index < 0) return response(config, { error: { code: 'NOT_FOUND', message: 'Product not found.' } }, 404);
    products[index] = { ...products[index], ...body };
    return response(config, products[index]);
  }
  if (path.endsWith('/admin/categories') && method === 'get') return response(config, list(categories, url.searchParams));
  if (path.endsWith('/admin/categories') && method === 'post') {
    const category = { _id: `category-${Date.now()}`, slug: String(body.name).toLowerCase().replace(/\s+/g, '-'), isVisible: true, ...body };
    categories.push(category);
    return response(config, category, 201);
  }
  if (/\/admin\/categories\/[^/]+$/.test(path)) {
    const id = path.split('/').pop();
    const index = categories.findIndex((item) => item._id === id);
    if (method === 'patch' && index >= 0) {
      categories[index] = { ...categories[index], ...body };
      return response(config, categories[index]);
    }
    if (method === 'delete' && index >= 0) return response(config, { id, deleted: true });
  }
  if (path.endsWith('/admin/categories/reorder') && method === 'post') {
    for (const item of body.categories ?? []) {
      const category = categories.find((entry) => entry._id === item.id);
      if (category) Object.assign(category, { sortOrder: item.sortOrder, displayOrder: item.displayOrder });
    }
    categories.sort((left, right) => left.sortOrder - right.sortOrder);
    return response(config, { updated: body.categories?.length ?? 0 });
  }
  if (path.endsWith('/admin/visitors')) return response(config, list([], url.searchParams));
  if (/\/admin\/visitors\/[^/]+$/.test(path) && method === 'get') {
    return response(config, { visitor: { visitorId: path.split('/').pop() }, pages: [], events: [], enquiry: null });
  }
  if (path.endsWith('/admin/enquiries') && method === 'get') return response(config, list(enquiries, url.searchParams));
  if (/\/admin\/enquiries\/[^/]+$/.test(path)) {
    const id = path.split('/').pop();
    const item = enquiries.find((entry) => entry._id === id);
    if (method === 'get') return response(config, item ?? { error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } }, item ? 200 : 404);
    if (method === 'patch') {
      enquiries = enquiries.map((entry) => entry._id === id ? { ...entry, ...body } : entry);
      return response(config, enquiries.find((entry) => entry._id === id));
    }
  }
  if (path.endsWith('/admin/bills') && method === 'get') {
    const status = url.searchParams.get('status');
    const q = url.searchParams.get('q')?.toLowerCase();
    return response(config, list(bills.filter((bill) =>
      (!status || bill.status === status) &&
      (!q || String(bill.billNo ?? bill.customerName ?? '').toLowerCase().includes(q))
    ), url.searchParams));
  }
  if (path.endsWith('/admin/bills') && method === 'post') {
    const existing = idempotencyKey ? bills.find((bill) => bill.idempotencyKey === idempotencyKey) : undefined;
    if (existing) return response(config, existing);
    const items = (body.items ?? []).map((item: Record<string, unknown>) => ({
      ...item,
      amount: Number(item.qty) * Number(item.rate),
    }));
    const totals = calculateBill({
      items: items.map((item: Record<string, unknown>) => ({ qty: Number(item.qty), rate: Number(item.rate) })),
      deliveryCharge: Number(body.deliveryCharge ?? 0),
      discount: Number(body.discount ?? 0),
      gstRate: Number(body.gstRate ?? 18),
      isGstBill: body.isGstBill !== false,
      advanceAmount: Number(body.advanceAmount ?? 0),
    });
    const bill: MockBill = {
      ...body,
      ...totals,
      _id: `bill-${Date.now()}-${++billSequence}`,
      billDate: now,
      status: 'draft',
      items,
      payments: [],
      ...(idempotencyKey ? { idempotencyKey } : {}),
    };
    bills = [bill, ...bills];
    return response(config, bill, 201);
  }
  const billOperation = path.match(/\/admin\/bills\/([^/]+)(?:\/(finalize|cancel|payments|share-link))?$/);
  if (billOperation) {
    const [, id, operation] = billOperation;
    const billIndex = bills.findIndex((item) => item._id === id);
    if (billIndex < 0) return response(config, { error: { code: 'NOT_FOUND', message: 'Bill not found.' } }, 404);
    const bill = bills[billIndex];
    if (!operation && method === 'get') return response(config, bill);
    if (!operation && method === 'put' && bill.status === 'draft') {
      const items = (body.items ?? bill.items).map((item: Record<string, unknown>) => ({
        ...item,
        amount: Number(item.qty) * Number(item.rate),
      }));
      const totals = calculateBill({
        items: items.map((item: Record<string, unknown>) => ({ qty: Number(item.qty), rate: Number(item.rate) })),
        deliveryCharge: Number(body.deliveryCharge ?? bill.deliveryCharge ?? 0),
        discount: Number(body.discount ?? bill.discount ?? 0),
        gstRate: Number(body.gstRate ?? bill.gstRate ?? 18),
        isGstBill: body.isGstBill ?? bill.isGstBill !== false,
        advanceAmount: Number(body.advanceAmount ?? bill.advanceAmount ?? 0),
      });
      bills[billIndex] = { ...bill, ...body, ...totals, items };
      return response(config, bills[billIndex]);
    }
    if (operation === 'finalize' && method === 'post' && bill.status === 'draft') {
      const token = `mock-token-${id}`;
      bills[billIndex] = {
        ...bill,
        status: 'final',
        billNo: `SDT-${String(++billSequence).padStart(5, '0')}`,
        verificationUrl: `https://mock.local/api/public/bills/verify/${token}`,
      };
      return response(config, bills[billIndex]);
    }
    if (operation === 'cancel' && method === 'post' && bill.status !== 'cancelled') {
      bills[billIndex] = { ...bill, status: 'cancelled' };
      return response(config, bills[billIndex]);
    }
    if (operation === 'payments' && method === 'post') {
      if (idempotencyKey && paymentKeys.has(idempotencyKey)) {
        const previous = bills.find((entry) => entry._id === paymentKeys.get(idempotencyKey));
        return response(config, previous ?? bill);
      }
      const amount = Number(body.amount);
      if (amount <= 0 || amount > bill.balanceDue || bill.status !== 'final') {
        return response(config, { error: { code: 'PAYMENT_EXCEEDS_BALANCE', message: 'Payment exceeds the balance due.' } }, 409);
      }
      const payment = { amount, mode: body.mode, paidAt: now };
      bills[billIndex] = {
        ...bill,
        balanceDue: bill.balanceDue - amount,
        payments: [...bill.payments, payment],
      };
      if (idempotencyKey) paymentKeys.set(idempotencyKey, id);
      return response(config, bills[billIndex], 201);
    }
    if (operation === 'share-link' && method === 'post' && bill.status === 'final') {
      const url = bill.verificationUrl ?? `https://mock.local/api/public/bills/verify/mock-token-${id}`;
      bills[billIndex] = { ...bill, verificationUrl: url };
      return response(config, { url, message: `Verify bill ${bill.billNo}: ${url}` });
    }
  }
  if (/\/public\/bills\/verify\/[^/]+$/.test(path) && method === 'get') {
    return response(config, { billNo: 'SDT-MOCK', shopName: 'Shree Durga Tiles', total: '0.00', status: 'final' });
  }
  if (path.endsWith('/admin/uploads') && method === 'post') {
    return response(config, { url: 'https://example.invalid/mock-product.jpg', publicId: 'mock-image' }, 201);
  }

  return response(config, {
    error: { code: 'MOCK_NOT_IMPLEMENTED', message: `${method.toUpperCase()} ${path} is not available in the mock API` },
  }, 501);
};
