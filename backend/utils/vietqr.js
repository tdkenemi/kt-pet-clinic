/**
 * Helper to generate VietQR URL using img.vietqr.io
 * Reference: https://vietqr.io/
 */
const generateVietQR = ({ bankId, accountNo, accountName, amount, description }) => {
  // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  const template = 'compact2'; // or 'qr_only', 'print'
  
  const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;
  const params = new URLSearchParams({
    amount: amount,
    addInfo: description,
    accountName: accountName
  });

  return `${baseUrl}?${params.toString()}`;
};

module.exports = { generateVietQR };
