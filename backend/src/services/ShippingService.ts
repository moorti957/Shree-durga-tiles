export interface IDeliveryAddress {
  fullName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IShippingItem {
  productId?: string;
  weight?: number;
  quantity: number;
}

export interface IShippingCalculationResult {
  origin: string;
  destination: string;
  distanceKm: number;
  totalWeightKg: number;
  standardShippingCost: number;
  expressShippingCost: number;
  estimatedDeliveryStandard: string;
  estimatedDeliveryExpress: string;
  isCached: boolean;
}

const quoteRequiredMessage =
  'Delivery charges and applicable taxes must be confirmed in a quote before ordering.';

export class ShippingService {
  public static async calculateShipping(
    _address: IDeliveryAddress,
    _items: IShippingItem[],
    _subtotal = 0,
  ): Promise<IShippingCalculationResult> {
    throw new Error(quoteRequiredMessage);
  }

  public static async calculateTotalWeight(_items: IShippingItem[]): Promise<number> {
    throw new Error(quoteRequiredMessage);
  }

  public static calculateStandardShippingCost(_distanceKm: number, _totalWeightKg: number): number {
    throw new Error(quoteRequiredMessage);
  }

  public static calculateExpressShippingCost(_standardCost: number, _subtotal: number): number {
    throw new Error(quoteRequiredMessage);
  }
}

export default ShippingService;
