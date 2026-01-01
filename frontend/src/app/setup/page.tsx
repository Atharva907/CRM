"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { BuildingOfficeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Setup() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyDomain: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });
  
  const { companyName, companyDomain, adminName, adminEmail, adminPassword, confirmPassword } = formData;
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (adminPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Validate form
    if (!companyName || !companyDomain || !adminName || !adminEmail || !adminPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.post('/company/setup', {
        companyName,
        companyDomain,
        adminName,
        adminEmail,
        adminPassword
      });
      
      setIsSetupComplete(true);
      toast.success('Company setup completed successfully');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error) {
      console.error('Setup error:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as any).response?.data?.msg || 'Setup failed' 
        : 'Setup failed';
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  if (isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-indigo-600" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Setup Complete</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Your CRM has been set up successfully</p>
          </div>
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <p className="mt-4 text-gray-700">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Set up your CRM</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create your company account and admin user</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Your Company"
                />
              </div>
              
              <div>
                <label htmlFor="companyDomain" className="block text-sm font-medium text-gray-700">Company Domain</label>
                <input
                  id="companyDomain"
                  name="companyDomain"
                  type="text"
                  required
                  value={companyDomain}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="company"
                />
                <p className="mt-1 text-xs text-gray-500">This will be used to identify your company in the system</p>
              </div>
              
              <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">Admin Name</label>
                <input
                  id="adminName"
                  name="adminName"
                  type="text"
                  required
                  value={adminName}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">Admin Email</label>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="admin@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  required
                  value={adminPassword}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••••"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••••"
                />
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up...
                </span>
              ) : (
                'Set Up CRM'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
