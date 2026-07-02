import React, { useEffect, useState } from 'react';
import useRazorpay from 'react-razorpay';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RazorpayCheckout = ({ orderDetails, appointmentId, onPaymentSuccess, onPaymentFailure }) => {
  const { t } = useTranslation();
  const [Razorpay] = useRazorpay();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      if (!orderDetails || !orderDetails.id) {
        throw new Error("Invalid order details");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key_id', 
        amount: orderDetails.amount, 
        currency: orderDetails.currency,
        name: "Therapeya",
        description: "Mental Health Session",
        order_id: orderDetails.id, 
        handler: async function (response) {
          try {
            // Verify payment
            await api.post('/payments/razorpay/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId: appointmentId
            });
            toast.success("Payment successful!");
            if (onPaymentSuccess) onPaymentSuccess(response);
          } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
            if (onPaymentFailure) onPaymentFailure(error);
          }
        },
        prefill: {
          name: "User Name", // Ideally passed as prop
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0f172a" // slate-900
        }
      };

      const rzp1 = new Razorpay(options);
      
      rzp1.on('payment.failed', function (response) {
        toast.error("Payment failed. Please try again.");
        if (onPaymentFailure) onPaymentFailure(response.error);
      });

      rzp1.open();
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize payment gateway.");
      if (onPaymentFailure) onPaymentFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 w-full">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment Summary</h3>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Session Fee</span>
          <span className="font-medium text-slate-900 dark:text-white">₹{orderDetails.amount / 100}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Platform Fee (included)</span>
          <span className="font-medium text-slate-900 dark:text-white">₹{(orderDetails.amount / 100) * 0.20}</span>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
          <span className="font-bold text-slate-900 dark:text-white">Total</span>
          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">₹{orderDetails.amount / 100}</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        {t('booking.payWithRazorpay') || "Pay with Razorpay"}
      </button>
      
      <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
        <AlertCircle className="w-3 h-3" /> Secure payment powered by Razorpay
      </p>
    </div>
  );
};

export default RazorpayCheckout;
