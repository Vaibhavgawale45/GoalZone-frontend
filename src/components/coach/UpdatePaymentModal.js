// client/src/components/coach/UpdatePaymentModal.js (Conceptual)
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api.js';
import { XMarkIcon } from '../../utils/iconUtils.js'; // Assuming from utils

const UpdatePaymentModal = ({ isOpen, onClose, player, onPaymentUpdated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      paymentStatus: player?.paymentStatus || 'Due',
      lastPaymentDate: player?.lastPaymentDate ? new Date(player.lastPaymentDate).toISOString().split('T')[0] : '',
      nextDueDate: player?.nextDueDate ? new Date(player.nextDueDate).toISOString().split('T')[0] : '',
    }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmitHandler = async (data) => {
    setErrorMessage('');
    try {
        // Ensure dates are sent correctly, or let backend handle string-to-Date conversion
      const payload = {
        paymentStatus: data.paymentStatus,
        lastPaymentDate: data.lastPaymentDate || null, // Send null if empty
        nextDueDate: data.nextDueDate || null,     // Send null if empty
      };
      const response = await api.put(`/users/${player._id}/payment-status`, payload); // Your backend endpoint
      onPaymentUpdated(response.data); // response.data should be the updated player object
      reset();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to update payment status.");
    }
  };

  if (!isOpen || !player) return null;

  // Input Styles
  const inputBaseStyle = "w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 text-base";
  const inputNormalStyle = `${inputBaseStyle} border-slate-300 placeholder-slate-400`;
  const inputErrorStyle = `${inputBaseStyle} border-red-500 ring-1 ring-red-500`;
  const btnPrimary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnSecondary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Update Payment for {player.name}</h2>
           <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-5">
            {errorMessage && <p className="p-3 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg">{errorMessage}</p>}
            
            <div>
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-slate-700 mb-1.5">Payment Status</label>
              <select id="paymentStatus" {...register("paymentStatus", { required: "Status is required" })}
                className={errors.paymentStatus ? inputErrorStyle : inputNormalStyle}
              >
                <option value="Due">Due</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Waived">Waived</option>
              </select>
              {errors.paymentStatus && <p className="text-xs text-red-600 mt-1">{errors.paymentStatus.message}</p>}
            </div>
            <div>
              <label htmlFor="lastPaymentDate" className="block text-sm font-medium text-slate-700 mb-1.5">Last Payment Date</label>
              <input type="date" id="lastPaymentDate" {...register("lastPaymentDate")}
                className={inputNormalStyle} />
            </div>
            <div>
              <label htmlFor="nextDueDate" className="block text-sm font-medium text-slate-700 mb-1.5">Next Due Date</label>
              <input type="date" id="nextDueDate" {...register("nextDueDate")}
                className={inputNormalStyle} />
            </div>
          </div>
          <div className="p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
             <button type="button" onClick={onClose} disabled={isSubmitting} className={`${btnSecondary} w-full sm:w-auto`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full sm:w-auto`}>
              {isSubmitting ? "Saving..." : "Update Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UpdatePaymentModal;