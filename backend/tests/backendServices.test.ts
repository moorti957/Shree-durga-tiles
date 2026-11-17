import assert from 'assert';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { AppError } from '../src/middlewares/errorHandler';
import { renderBillPdf } from '../src/services/billPdf';
import { processUploadImage } from '../src/services/imageProcessor';
import { sendAdminPushNotification } from '../src/services/pushNotifications';

const money = (value: number) => ({ toString: () => value.toFixed(2) });

const run = async () => {
  const source = await sharp({
    create: { width: 2400, height: 1200, channels: 3, background: '#ccaa88' },
  })
    .png()
    .toBuffer();
  const processed = await processUploadImage(source);
  assert.strictEqual(processed.format, 'webp');
  assert.deepStrictEqual([processed.width, processed.height], [2000, 1000]);
  await assert.rejects(
    () => processUploadImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')),
    (error: unknown) => error instanceof AppError && error.statusCode === 400
  );
  console.log('PASS image upload validates raster input and resizes before upload');

  const pdf = await renderBillPdf(
    {
      billNo: 'SDT-2026-00001',
      billDate: '2026-01-01',
      customerName: 'Test Customer',
      isGstBill: true,
      gstRate: money(18),
      deliveryType: 'home_delivery',
      deliveryCharge: money(5000),
      discount: money(7000),
      advanceAmount: money(30000),
      advanceMode: 'cash',
      isCod: true,
      subtotal: money(65000),
      taxableAmount: money(63000),
      cgst: money(5670),
      sgst: money(5670),
      igst: money(0),
      roundOff: money(0),
      grandTotal: money(74340),
      balanceDue: money(44340),
      amountInWords: 'Seventy Four Thousand Three Hundred Forty Rupees Only',
      verificationUrl: 'https://example.test/api/public/bills/verify/sample-token',
    },
    [
      {
        name: 'Marble tile',
        qty: money(1),
        unit: 'box',
        rate: money(65000),
        amount: money(65000),
      },
    ],
    { shopName: 'Shree Durga Tiles', phone: '9000000000' }
  );
  assert.ok(pdf.subarray(0, 5).toString('ascii').startsWith('%PDF-'));
  assert.ok(pdf.length > 1000);
  console.log('PASS server bill PDF contains a verification QR and invoice content');

  const env = {
    projectId: process.env.FCM_PROJECT_ID,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    privateKey: process.env.FCM_PRIVATE_KEY,
  };
  delete process.env.FCM_PROJECT_ID;
  delete process.env.FCM_CLIENT_EMAIL;
  delete process.env.FCM_PRIVATE_KEY;
  try {
    const result = await sendAdminPushNotification(new mongoose.Types.ObjectId(), {
      title: 'Test',
      body: 'No-op',
    });
    assert.deepStrictEqual(result, { skipped: true, reason: 'FCM_NOT_CONFIGURED' });
  } finally {
    if (env.projectId !== undefined) process.env.FCM_PROJECT_ID = env.projectId;
    if (env.clientEmail !== undefined) process.env.FCM_CLIENT_EMAIL = env.clientEmail;
    if (env.privateKey !== undefined) process.env.FCM_PRIVATE_KEY = env.privateKey;
  }
  console.log('PASS FCM delivery safely skips when credentials are not configured');
};

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
