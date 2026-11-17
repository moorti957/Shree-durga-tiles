import assert from 'assert';
import { amountInIndianWords, calculateBill } from '../src/services/billCalculator';

const tests: { name: string; run: () => void }[] = [
  {
    name: 'calculates GST, discount, delivery, advance, and COD in the sample case',
    run: () => {
      const result = calculateBill({
        items: [{ qty: 1, rate: 65_000 }],
        gstRate: 18,
        customerState: 'Rajasthan',
        deliveryCharge: 5_000,
        discount: 7_000,
        advanceAmount: 30_000,
        isCod: true,
      });
      assert.strictEqual(result.subtotalPaise, 6_500_000);
      assert.strictEqual(result.taxableAmountPaise, 6_300_000);
      assert.strictEqual(result.cgstPaise, 567_000);
      assert.strictEqual(result.sgstPaise, 567_000);
      assert.strictEqual(result.igstPaise, 0);
      assert.strictEqual(result.grandTotalPaise, 7_434_000);
      assert.strictEqual(result.balanceDuePaise, 4_434_000);
      assert.strictEqual(result.codAmountPaise, 4_434_000);
      assert.strictEqual(result.amountInWords, 'Seventy Four Thousand Three Hundred Forty Rupees Only');
    },
  },
  {
    name: 'uses IGST for interstate sales and permits GST-free bills',
    run: () => {
      const interstate = calculateBill({
        items: [{ qty: 1, rate: 1_000 }],
        customerState: 'Delhi',
      });
      assert.strictEqual(interstate.igstPaise, 18_000);
      assert.strictEqual(interstate.cgstPaise, 0);
      assert.strictEqual(interstate.sgstPaise, 0);

      const noGst = calculateBill({ items: [{ qty: 1, rate: 1_000 }], isGstBill: false });
      assert.strictEqual(noGst.grandTotalPaise, 100_000);
    },
  },
  {
    name: 'rounds the final total to whole rupees and records the rounding difference',
    run: () => {
      const result = calculateBill({ items: [{ qty: 1, rate: 100.03 }], gstRate: 18 });
      assert.strictEqual(result.grandTotalPaise, 11_800);
      assert.strictEqual(result.roundOffPaise, -4);
    },
  },
  {
    name: 'returns zero COD when COD is disabled',
    run: () => {
      const result = calculateBill({
        items: [{ qty: 1, rate: 1_000 }],
        advanceAmount: 200,
        isCod: false,
      });
      assert.strictEqual(result.balanceDuePaise, 98_000);
      assert.strictEqual(result.codAmountPaise, 0);
    },
  },
  {
    name: 'converts rupees and paise to Indian words',
    run: () => {
      assert.strictEqual(
        amountInIndianWords(12_345),
        'One Hundred Twenty Three Rupees and Forty Five Paise Only'
      );
      assert.strictEqual(
        amountInIndianWords(7_434_000),
        'Seventy Four Thousand Three Hundred Forty Rupees Only'
      );
    },
  },
  {
    name: 'rejects an advance greater than the rounded bill total',
    run: () => {
      assert.throws(
        () => calculateBill({ items: [{ qty: 1, rate: 100 }], advanceAmount: 119 }),
        /Advance cannot exceed the bill total/
      );
    },
  },
];

for (const test of tests) {
  test.run();
  console.log(`PASS ${test.name}`);
}

console.log(`Passed ${tests.length} bill calculator tests.`);
