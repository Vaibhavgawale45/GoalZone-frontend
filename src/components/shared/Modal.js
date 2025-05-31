// client/src/components/shared/Modal.js
import React from 'react';

const Modal = ({ isOpen, onClose, title, children, widthClass = "max-w-lg" }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity z-50 flex justify-center items-center p-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className={`relative bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:w-full ${widthClass} overflow-hidden`}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                    <div className="sm:flex sm:items-start">
                        {/* Optional Icon could go here */}
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl leading-6 font-semibold text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={onClose}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                </button>
                            </div>
                            <div className="mt-2 modal-content-area"> {/* For specific modal content styling */}
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Optional: Actions section directly in modal if not part of children form
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button onClick={onClose} type="button" className="btn-secondary">Close</button>
                </div>
                */}
            </div>
        </div>
    );
};

export default Modal;