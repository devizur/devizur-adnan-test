/**
 * Request body shape for POST /api/SalesOrder (booking engine).
 * Field names align with the backend contract; send defaults (0 / "" / []) where unknown.
 */

export interface SalesOrderLineModifier {
  orderLineModifierId: number;
  orderLineId: number;
  unitSequence: number;
  productModifierId: number;
  modifierPrice: number;
  createdAt: string;
  updatedAt: string;
  modifierGroupId: number;
  modifierName: string;
  modifierGroupName: string;
}

export interface SalesOrderComboLineModifier {
  comboModifierId: number;
  orderComboLineId: number;
  unitSequence: number;
  productModifierId: number;
  modifierGroupId: number;
  modifierPrice: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  modifierName: string;
  modifierGroupName: string;
}

export interface SalesOrderComboLine {
  orderComboLineId: number;
  orderLineId: number;
  productId: number;
  quantity: number;
  modifierTotalPrice: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  modifiers: SalesOrderComboLineModifier[];
  productName: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
}

export interface SalesOrderLine {
  orderLineId: number;
  orderId: number;
  productId: number;
  orderLineSerial: number;
  quantity: number;
  unitPrice: number;
  appliedOfferId: number;
  taxPolicyId: number;
  discount: number;
  taxAmount: number;
  modifierTotalPrice: number;
  lineTotal: number;
  kitchenStatusKey: string;
  deliveryStatusKey: string;
  orderStatusKey: string;
  discountOrFreeInfo: string;
  isComboProduct: boolean;
  modifiers: SalesOrderLineModifier[];
  productName: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  comboLines: SalesOrderComboLine[];
}

export interface SalesOrderFreeItemModifier {
  orderFreeItemModifierId: number;
  orderFreeItemId: number;
  unitSequence: number;
  productModifierId: number;
  modifierGroupId: number;
  modifierPrice: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  modifierName: string;
  modifierGroupName: string;
}

export interface SalesOrderFreeItem {
  orderFreeItemId: number;
  orderId: number;
  orderLineId: number;
  orderLineSerial: number;
  appliedOfferId: number;
  offerTargetId: number;
  offerFreeProductOptionId: number;
  quantity: number;
  freeProductId: number;
  productName: string;
  freeProductSubCategoryId: number;
  productSubCategoryName: string;
  freeProductCategoryId: number;
  productCategoryName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  modifierTotalPrice: number;
  modifiers: SalesOrderFreeItemModifier[];
}

export interface SalesOrderPaymentCollection {
  paymentCollectionId: number;
  paymentModeKey: string;
  paymentModeSubType: string;
  ourTransactionReference: string;
  providerTransactionReference: string;
  amountPaid: number;
  paymentDate: string;
  collectionType: string;
  otherPaymentInfo: string;
}

export interface SalesOrderPayment {
  salesOrderPaymentId: number;
  paymentSettledBy: string;
  paymentCollectionId: number;
  paymentCollection: SalesOrderPaymentCollection;
  paymentVoucherId: number;
  salesOrderId: number;
  billSplitId: number;
  amountSettled: number;
  recordStatus: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  modifiedAt: string;
}

export interface BillSplitAllocation {
  allocationId: number;
  orderLineId: number;
  allocatedQty: number;
  allocatedAmount: number;
  createdBy: number;
}

export interface SalesOrderBillSplit {
  billSplitId: number;
  billSplitRef: string;
  orderId: number;
  splitStatus: string;
  splitIndex: number;
  customerId: number;
  displayName: string;
  splitAmount: number;
  paidAmount: number;
  paymentStatus: string;
  createdAt: string;
  allocations: BillSplitAllocation[];
}

export interface SalesOrderCustomer {
  customerId: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  isActive: boolean;
  createdAt: string;
}

/** Full POST /api/SalesOrder body */
export interface SalesOrderRequest {
  orderId: number;
  orderNumber: string;
  uniqueOrderRef: string;
  shopId: number;
  customerId: number;
  salesPersonId: number;
  posSessionId: number;
  orderType: string;
  orderLevelDiscount: number;
  appliedOfferId: number;
  orderNotes: string;
  posTerminalId: number;
  taxPolicyId: number;
  orderLevelTax: number;
  shopBrandMapId: number;
  shopUnitId_DEPRECATED: number;
  salesPersonName: string;
  lines: SalesOrderLine[];
  freeItems: SalesOrderFreeItem[];
  orderStatusKey: string;
  payments: SalesOrderPayment[];
  billSplits: SalesOrderBillSplit[];
  grossAmount: number;
  totalLineTax: number;
  netAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  tableIds: number[];
  tokenNumber: string;
  kitchenInstruction: string;
  deliveryInstruction: string;
  isSentToKitchen: boolean;
  createdBy: number;
  updatedBy: number;
  customerName: string;
  customerRef: string;
  customer: SalesOrderCustomer;
  shopName: string;
  kitchenStatusKey: string;
  deliveryStatusKey: string;
  bookingId: number;
}

export interface SalesOrderResponse {
  orderId?: number;
  orderNumber?: string;
  uniqueOrderRef?: string;
  tokenNumber?: string;
  grossAmount?: number;
  totalLineTax?: number;
  netAmount?: number;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}
