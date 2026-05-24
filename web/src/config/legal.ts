export const legalInfo = {
  serviceName: process.env.NEXT_PUBLIC_SERVICE_NAME ?? 'PFC Tracker',
  operatorName: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_NAME ?? '運営者名を設定してください',
  operatorAddress: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS ?? '請求があった場合、遅滞なく開示します',
  contactEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@example.com',
  priceDescription: process.env.NEXT_PUBLIC_LEGAL_PRICE_DESCRIPTION ?? 'Proプラン 月額500円（税込）',
  updatedAt: '2026年5月24日',
} as const;
