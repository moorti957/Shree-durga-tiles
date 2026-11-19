import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

type PdfBill = {
  billNo?: string;
  billDate: Date | string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGstin?: string;
  customerState?: string;
  isGstBill: boolean;
  gstRate: { toString(): string };
  deliveryType: string;
  deliveryAddress?: string;
  deliveryCharge: { toString(): string };
  discount: { toString(): string };
  advanceAmount: { toString(): string };
  advanceMode: string;
  isCod: boolean;
  subtotal: { toString(): string };
  taxableAmount: { toString(): string };
  cgst: { toString(): string };
  sgst: { toString(): string };
  igst: { toString(): string };
  roundOff: { toString(): string };
  grandTotal: { toString(): string };
  balanceDue: { toString(): string };
  amountInWords: string;
  verificationUrl?: string;
};

type PdfBillItem = {
  name: string;
  size?: string;
  hsn?: string;
  qty: { toString(): string };
  unit: string;
  rate: { toString(): string };
  amount: { toString(): string };
};

type PdfSettings = {
  shopName?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  invoiceTerms?: string;
  invoiceFooterNote?: string;
  logo?: string;
  ownerSignature?: string;
  ownerName?: string;
  invoiceTitle?: string;
  returnPolicy?: string;
  defaultInvoiceNotes?: string;
  showLogo?: boolean;
  showSignature?: boolean;
  showGstin?: boolean;
};

const money = (value: { toString(): string }): string =>
  `Rs. ${Number(value.toString()).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const date = (value: Date | string): string => new Date(value).toLocaleDateString('en-IN');

export const renderBillPdf = async (
  bill: PdfBill,
  items: PdfBillItem[],
  settings: PdfSettings | null
): Promise<Buffer> => {
  const qr = bill.verificationUrl
    ? await QRCode.toBuffer(bill.verificationUrl, { type: 'png', width: 144, margin: 1 })
    : undefined;
  const loadImage = async (url?: string): Promise<Buffer | undefined> => {
    if (!url?.trim()) return undefined;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
      if (!response.ok) return undefined;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return undefined;
    }
  };
  const [logo, signature] = await Promise.all([loadImage(settings?.showLogo !== false ? settings?.logo : undefined), loadImage(settings?.showSignature !== false ? settings?.ownerSignature : undefined)]);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 44, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const left = 44;
    const right = 551;
    const width = right - left;
    const shopName = settings?.shopName?.trim() || 'Shree Durga Tiles';

    if (logo) {
      doc.image(logo, left, 38, { fit: [52, 52] });
      doc.font('Helvetica-Bold').fontSize(18).text(shopName, left + 62, 42, { width: 288 });
    } else {
      doc.font('Helvetica-Bold').fontSize(18).text(shopName, left, 42, { width: 350 });
    }
    if (settings?.tagline) doc.font('Helvetica').fontSize(8).fillColor('#86652F').text(settings.tagline, left + (logo ? 62 : 0), 64, { width: 288 });
    doc.font('Helvetica').fontSize(9).fillColor('#444');
    if (settings?.address) doc.text(settings.address, left, logo ? 78 : 67, { width: 340 });
    const contact = [settings?.phone, settings?.email, settings?.showGstin !== false && settings?.gstin ? `GSTIN: ${settings.gstin}` : '']
      .filter(Boolean)
      .join('  |  ');
    if (contact) doc.text(contact, left, doc.y + 2, { width: 340 });
    doc.fillColor('#111').font('Helvetica-Bold').fontSize(16).text(settings?.invoiceTitle || 'TAX INVOICE', left, 108);
    doc.font('Helvetica').fontSize(10).text(`Invoice: ${bill.billNo || 'Draft'}`, left, 132);
    doc.text(`Date: ${date(bill.billDate)}`, 330, 132, { width: 150, align: 'right' });

    doc.moveTo(left, 154).lineTo(right, 154).strokeColor('#aaa').stroke();
    doc.font('Helvetica-Bold').text('Bill to', left, 166);
    doc.font('Helvetica').text(bill.customerName, left, 182, { width: 300 });
    if (bill.customerPhone) doc.text(`Phone: ${bill.customerPhone}`, left, doc.y + 3);
    if (bill.customerAddress) doc.text(bill.customerAddress, left, doc.y + 3, { width: 300 });
    if (bill.customerGstin) doc.text(`GSTIN: ${bill.customerGstin}`, left, doc.y + 3);

    let y = Math.max(doc.y + 22, 234);
    const columns = { item: left, qty: 330, rate: 390, amount: 475 };
    const drawTableHeader = () => {
      doc.rect(left, y, width, 22).fill('#f0f2f5');
      doc.fillColor('#111').font('Helvetica-Bold').fontSize(9);
      doc.text('Item / HSN', columns.item + 5, y + 7, { width: 275 });
      doc.text('Qty', columns.qty, y + 7, { width: 50, align: 'right' });
      doc.text('Rate', columns.rate, y + 7, { width: 70, align: 'right' });
      doc.text('Amount', columns.amount, y + 7, { width: 70, align: 'right' });
      y += 28;
    };
    drawTableHeader();

    doc.font('Helvetica').fontSize(9);
    for (const item of items) {
      const label = [item.name, item.size, item.hsn ? `HSN ${item.hsn}` : '']
        .filter(Boolean)
        .join('  |  ');
      const rowHeight = Math.max(20, doc.heightOfString(label, { width: 270 }) + 8);
      if (y + rowHeight > 700) {
        doc.addPage();
        y = 44;
        drawTableHeader();
        doc.font('Helvetica').fontSize(9);
      }
      doc.fillColor('#111').text(label, columns.item + 5, y, { width: 270 });
      doc.text(`${item.qty.toString()} ${item.unit}`, columns.qty, y, { width: 50, align: 'right' });
      doc.text(money(item.rate), columns.rate, y, { width: 70, align: 'right' });
      doc.text(money(item.amount), columns.amount, y, { width: 70, align: 'right' });
      y += rowHeight;
      doc.moveTo(left, y).lineTo(right, y).strokeColor('#e5e7eb').stroke();
    }

    y += 14;
    if (y > 650) {
      doc.addPage();
      y = 48;
    }
    const totals = [
      ['Subtotal', money(bill.subtotal)],
      ['Discount', `- ${money(bill.discount)}`],
      ['Delivery charge', money(bill.deliveryCharge)],
      ['Taxable amount', money(bill.taxableAmount)],
      ...(bill.isGstBill
        ? bill.igst.toString() !== '0'
          ? [[`IGST (${bill.gstRate.toString()}%)`, money(bill.igst)]]
          : [
              [`CGST (${Number(bill.gstRate.toString()) / 2}%)`, money(bill.cgst)],
              [`SGST (${Number(bill.gstRate.toString()) / 2}%)`, money(bill.sgst)],
            ]
        : []),
      ['Round off', money(bill.roundOff)],
    ];
    for (const [label, value] of totals) {
      doc.font('Helvetica').fontSize(9).text(label, 330, y, { width: 120, align: 'right' });
      doc.text(value, 475, y, { width: 70, align: 'right' });
      y += 16;
    }
    doc.font('Helvetica-Bold').fontSize(12).text('Grand total', 330, y + 2, { width: 120, align: 'right' });
    doc.text(money(bill.grandTotal), 475, y + 2, { width: 70, align: 'right' });
    y += 24;
    doc.font('Helvetica').fontSize(9);
    doc.text(`Advance (${bill.advanceMode}): ${money(bill.advanceAmount)}`, 330, y, { width: 215, align: 'right' });
    y += 16;
    doc.font('Helvetica-Bold').text(`${bill.isCod ? 'COD amount' : 'Balance due'}: ${money(bill.balanceDue)}`, 330, y, {
      width: 215,
      align: 'right',
    });

    y += 26;
    doc.font('Helvetica').fontSize(9).text(`Amount in words: ${bill.amountInWords}`, left, y, { width: 490 });
    y += 28;
    if (qr) {
      if (y > 690) {
        doc.addPage();
        y = 48;
      }
      doc.image(qr, left, y, { width: 82, height: 82 });
      doc.fontSize(8).text('Scan to verify this invoice', left + 92, y + 10, { width: 210 });
      doc.text(bill.verificationUrl || '', left + 92, y + 26, { width: 300 });
      y += 94;
    }
    if (settings?.showSignature !== false) {
      const signatureY = Math.max(y, 690);
      if (signatureY > 760) doc.addPage();
      if (signature) doc.image(signature, 420, signatureY - 36, { fit: [118, 42] });
      doc.moveTo(420, signatureY).lineTo(right, signatureY).strokeColor('#b0a99c').stroke();
      doc.font('Helvetica-Bold').fontSize(8).text(settings?.ownerName || 'Authorized Signatory', 420, signatureY + 6, { width: 131, align: 'right' });
      doc.font('Helvetica').text('Authorized Signatory', 420, signatureY + 18, { width: 131, align: 'right' });
    }
    if (settings?.defaultInvoiceNotes) doc.fontSize(8).text(settings.defaultInvoiceNotes, left, y, { width });
    if (settings?.returnPolicy) doc.fontSize(8).text(`Return / refund: ${settings.returnPolicy}`, left, doc.y + 6, { width });
    if (settings?.invoiceTerms) doc.fontSize(8).text(settings.invoiceTerms, left, y, { width });
    if (settings?.invoiceFooterNote) {
      doc.fontSize(8).text(settings.invoiceFooterNote, left, doc.y + 8, { width, align: 'center' });
    }
    doc.end();
  });
};
