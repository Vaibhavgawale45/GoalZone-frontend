import React, { useState } from 'react';
import api from '../services/api';
import { FiSend, FiLoader, FiCheckCircle, FiAlertTriangle, FiMail, FiPhone } from 'react-icons/fi';

const ContactUsPage = () => {
    // 1. 'consent' property removed from the initial state
    const initialFormState = {
        name: '',
        email: '',
        phone: '',
        reason: '',
        role: 'Coach',
        message: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState({ loading: false, success: null, error: null });

    // The 'type' and 'checked' logic is no longer strictly necessary but is harmless to leave
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 2. The consent validation block has been completely removed from here.

        setStatus({ loading: true, success: null, error: null });

        try {
            const response = await api.post('/feedback', formData);
            setStatus({ loading: false, success: response.data.message, error: null });
            setFormData(initialFormState);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
            setStatus({ loading: false, success: null, error: errorMessage });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl w-full mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Get in Touch</h1>
                    <p className="mt-4 text-lg text-gray-600">We're here to help and answer any question you might have.</p>
                </div>

                <div className="mt-10 mb-10 py-6 border-t border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12">
                        <a href="mailto:support@goalzone.com" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-300 group">
                            <FiMail className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="font-medium">support@goalzone.com</span>
                        </a>
                        <a href="tel:+1-234-567-8900" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-300 group">
                            <FiPhone className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="font-medium">+1 (234) 567-8900</span>
                        </a>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="relative">
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="peer h-12 w-full border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent p-3" placeholder="John Doe" />
                            <label htmlFor="name" className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">Full Name*</label>
                        </div>
                        
                        {/* Email Field */}
                        <div className="relative">
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="peer h-12 w-full border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent p-3" placeholder="you@example.com" />
                            <label htmlFor="email" className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">Email Address*</label>
                        </div>

                        {/* Phone Field (Optional) */}
                        <div className="relative">
                             <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="peer h-12 w-full border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent p-3" placeholder="+1 (555) 123-4567" />
                            <label htmlFor="phone" className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">Phone Number (Optional)</label>
                        </div>

                        {/* Reason for Contact Field */}
                        <div className="relative">
                             <select id="reason" name="reason" value={formData.reason} onChange={handleChange} required className="peer h-12 w-full border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent p-3 appearance-none">
                                <option value="" disabled>-- Select a reason --</option>
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="Data Correction">Data Correction</option>
                                <option value="Feature Suggestion">Feature Suggestion</option>
                            </select>
                            <label htmlFor="reason" className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">Reason for Contact*</label>
                        </div>

                        {/* Role Field */}
                        <div className="relative md:col-span-2">
                             <select id="role" name="role" value={formData.role} onChange={handleChange} required className="peer h-12 w-full border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent p-3 appearance-none">
                                <option value="Coach">Coach</option>
                                <option value="Player">Player</option>
                                <option value="Parent">Parent</option>
                                <option value="Team Manager">Team Manager</option>
                                <option value="Admin">Admin</option>
                                <option value="Other">Other</option>
                            </select>
                            <label htmlFor="role" className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">I am a*</label>
                        </div>
                    </div>

                    {/* Message Field */}
                    <div className="mt-6 relative">
                        <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} required className="peer w-full border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent p-3" placeholder="Your message..."></textarea>
                        <label htmlFor="message" className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">Your Message*</label>
                    </div>

                    {/* 3. The entire consent checkbox div has been deleted from here */}

                    {/* Submit Button */}
                    <div className="mt-8 text-center">
                        <button type="submit" disabled={status.loading} className="inline-flex items-center justify-center w-full md:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                           {status.loading ? <><FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />Sending...</> : <><FiSend className="-ml-1 mr-3 h-5 w-5" />Send Message</>}
                        </button>
                    </div>
                    
                    {/* Status Messages */}
                    <div className="mt-6 text-center">
                        {status.success && <div className="inline-flex items-center p-3 text-sm text-green-800 bg-green-100 rounded-lg" role="alert"><FiCheckCircle className="w-5 h-5 mr-2" /><span className="font-medium">{status.success}</span></div>}
                        {status.error && <div className="inline-flex items-center p-3 text-sm text-red-800 bg-red-100 rounded-lg" role="alert"><FiAlertTriangle className="w-5 h-5 mr-2" /><span className="font-medium">{status.error}</span></div>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactUsPage;