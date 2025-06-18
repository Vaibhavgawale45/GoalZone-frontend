// client/src/components/coach/AddPlayerModal.js (Conceptual)
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api.js';
import { XMarkIcon } from '../../utils/iconUtils.js'; // Assuming from utils

const AddPlayerModal = ({ isOpen, onClose, clubId, onPlayerAdded }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmitHandler = async (data) => {
    setErrorMessage('');
    try {
      const payload = { ...data, clubId, createdByCoach: true }; // Add clubId and mark as coach-created
      const response = await api.post('/users/coach-add-player', payload); // Your backend endpoint
      onPlayerAdded(response.data);
      reset();
      // onClose(); // Optionally close on success, or let user add more
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to add player.");
    }
  };

  if (!isOpen) return null;
  
  // Input Styles (consistent with ManagePlayersPage)
  const inputBaseStyle = "w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 text-base";
  const inputNormalStyle = `${inputBaseStyle} border-slate-300 placeholder-slate-400`;
  const inputErrorStyle = `${inputBaseStyle} border-red-500 ring-1 ring-red-500`;
  const btnPrimary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnSecondary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Add New Player to Club</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-5">
            {errorMessage && <p className="p-3 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg">{errorMessage}</p>}
            
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input type="text" id="playerName" {...register("name", { required: "Player name is required" })}
                className={errors.name ? inputErrorStyle : inputNormalStyle} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="playerEmail" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" id="playerEmail" {...register("email", { required: "Email is required", pattern: {value: /^\S+@\S+$/i, message:"Invalid email format"} })}
                className={errors.email ? inputErrorStyle : inputNormalStyle} placeholder="player@example.com" />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="playerPassword" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" id="playerPassword" {...register("password", { required: "Password is required", minLength: {value: 6, message:"Password must be at least 6 characters"} })}
                className={errors.password ? inputErrorStyle : inputNormalStyle} placeholder="Min. 6 characters" />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>
            {/* Optional fields: phone, position, skill, etc. */}
             <div>
              <label htmlFor="playerPhone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone (Optional)</label>
              <input type="tel" id="playerPhone" {...register("phone")} className={inputNormalStyle} />
            </div>
            <div>
              <label htmlFor="playerPosition" className="block text-sm font-medium text-slate-700 mb-1.5">Position (Optional)</label>
              <input type="text" id="playerPosition" {...register("position")} className={inputNormalStyle} />
            </div>

          </div>
          <div className="p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`${btnSecondary} w-full sm:w-auto`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full sm:w-auto`}>
              {isSubmitting ? "Adding..." : "Add Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddPlayerModal;