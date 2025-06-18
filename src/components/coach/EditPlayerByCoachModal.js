// client/src/components/coach/EditPlayerByCoachModal.js (NEW FILE)
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api.js';
// import { toast } from 'react-toastify';
// import { XMarkIcon } from '../../utils/iconUtils.js'; // Assuming from utils, or define locally

const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


const EditPlayerByCoachModal = ({ isOpen, onClose, player, onPlayerUpdated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm({
    defaultValues: {
      position: player?.position || '',
      score: player?.score !== null && player?.score !== undefined ? player.score : 50, // Default score if not set
    }
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (player && isOpen) {
      reset({
        position: player.position || '',
        score: player.score !== null && player.score !== undefined ? player.score : 50,
      });
    }
  }, [player, isOpen, reset]);

  const onSubmitHandler = async (data) => {
    setErrorMessage('');
    try {
      const payload = {
        position: data.position,
        score: Number(data.score), // Ensure score is a number
      };
      // Endpoint to update player's position and score by coach
      const response = await api.put(`/users/${player._id}/coach-update-details`, payload); 
      onPlayerUpdated(response.data);
      // toast.success(`${player.name}'s details updated.`);
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to update player details.");
      // toast.error(err.response?.data?.message || "Failed to update player details.");
    }
  };

  if (!isOpen || !player) return null;

  const inputBaseStyle = "w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 text-base";
  const inputNormalStyle = `${inputBaseStyle} border-slate-300 placeholder-slate-400`;
  const inputErrorStyle = `${inputBaseStyle} border-red-500 ring-1 ring-red-500`;
  const btnPrimary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnSecondary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Edit Player: {player.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <XMarkIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-5">
            {errorMessage && <p className="p-3 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg">{errorMessage}</p>}
            
            <div>
              <label htmlFor="editPlayerPosition" className="block text-sm font-medium text-slate-700 mb-1.5">Position</label>
              <input type="text" id="editPlayerPosition" {...register("position")}
                className={inputNormalStyle} placeholder="e.g., Forward, Midfielder" />
            </div>
            <div>
              <label htmlFor="editPlayerScore" className="block text-sm font-medium text-slate-700 mb-1.5">Score (0-100)</label>
              <input 
                type="number" 
                id="editPlayerScore" 
                {...register("score", { 
                    required: "Score is required", 
                    min: { value: 0, message: "Score cannot be less than 0" }, 
                    max: { value: 100, message: "Score cannot exceed 100" },
                    valueAsNumber: true
                })}
                className={errors.score ? inputErrorStyle : inputNormalStyle} placeholder="e.g., 75" />
              {errors.score && <p className="text-xs text-red-600 mt-1">{errors.score.message}</p>}
            </div>
          </div>
          <div className="p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`${btnSecondary} w-full sm:w-auto`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full sm:w-auto`}>
              {isSubmitting ? "Saving..." : "Save Player Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditPlayerByCoachModal;