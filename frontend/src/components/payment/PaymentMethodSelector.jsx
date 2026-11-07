import { CreditCard, QrCode, Banknote } from 'lucide-react';

export default function PaymentMethodSelector({
  paymentMethod = 'BANK_TRANSFER',
  setPaymentMethod,
}) {
  return (
    <div className="bg-surface rounded-lg border border-line p-5 shadow-2xs space-y-4">
      <h2 className="text-[14.5px] font-bold text-ink flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-accent" />
        <span>Phương Thức Thanh Toán</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* VNPay QR */}
        <div
          onClick={() => setPaymentMethod && setPaymentMethod('BANK_TRANSFER')}
          className={`p-3.5 rounded-md border flex items-center gap-3 cursor-pointer transition ${
            paymentMethod === 'BANK_TRANSFER'
              ? 'border-accent bg-accent-soft'
              : 'border-line bg-surface hover:bg-surface-2'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
              paymentMethod === 'BANK_TRANSFER'
                ? 'border-accent bg-accent'
                : 'border-line bg-surface'
            }`}
          >
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="w-1.5 h-1.5 rounded-full bg-surface" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-accent" />
              <p className="text-[13px] font-bold text-ink">Chuyển Khoản VNPay QR</p>
            </div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Quét mã QR qua ứng dụng ngân hàng
            </p>
          </div>
        </div>

        {/* COD */}
        <div
          onClick={() => setPaymentMethod && setPaymentMethod('COD')}
          className={`p-3.5 rounded-md border flex items-center gap-3 cursor-pointer transition ${
            paymentMethod === 'COD'
              ? 'border-accent bg-accent-soft'
              : 'border-line bg-surface hover:bg-surface-2'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
              paymentMethod === 'COD'
                ? 'border-accent bg-accent'
                : 'border-line bg-surface'
            }`}
          >
            {paymentMethod === 'COD' && (
              <div className="w-1.5 h-1.5 rounded-full bg-surface" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[13px] font-bold text-ink">Thanh Toán Khi Nhận (COD)</p>
            </div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Kiểm tra hàng rồi thanh toán tiền mặt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
