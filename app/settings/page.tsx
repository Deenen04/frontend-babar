'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

type ModalType = 'none' | 'resetConfirm' | 'verification' | 'resetForm' | 'success';

export default function Settings() {
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [aiBotEnabled, setAiBotEnabled] = useState(true);
  const [verificationCode, setVerificationCode] = useState(['', '', '']);
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    accountName: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dummy settings data
  useEffect(() => {
    // Dummy user data
    const dummyUser = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com'
    };

    setFormData({
      accountName: `${dummyUser.first_name} ${dummyUser.last_name}`,
      email: dummyUser.email
    });

    // Dummy AI bot setting (enabled by default)
    setAiBotEnabled(true);
  }, []);

  // Save settings (dummy implementation)
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Settings are already saved locally in state
      console.log('Settings saved locally:', {
        accountName: formData.accountName,
        email: formData.email,
        aiBotEnabled
      });

    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = () => {
    setActiveModal('resetConfirm');
  };

  const handleSendVerificationCode = () => {
    setActiveModal('verification');
  };

  const handleVerifyCode = () => {
    setActiveModal('resetForm');
  };

  const handlePasswordReset = () => {
    setActiveModal('success');
  };

  const handleCloseModal = () => {
    setActiveModal('none');
    setVerificationCode(['', '', '']);
    setPasswords({ old: '', new: '', confirm: '' });
  };

  const handleVerificationInput = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
    }
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const ResetConfirmModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0000004D' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Reset Password?</h2>
          <p className="text-gray-600 text-center mb-6">
            A verification code will be sent to your registered email address: <span className="font-semibold">helloinfo34@gmail.com</span>
          </p>
          <button
            onClick={handleSendVerificationCode}
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-hover"
          >
            Send Verification Code
          </button>
        </div>
      </div>
    </div>
  );

  const VerificationModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0000004D' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Verification Code</h2>
          <p className="text-gray-600 text-center mb-8">
            An authentication code has been sent to your email.
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleVerificationInput(index, e.target.value)}
                className="w-16 h-16 text-center text-2xl font-bold text-black border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={1}
              />
            ))}
          </div>
          
          <button
            onClick={handleVerifyCode}
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-hover mb-4"
          >
            Verify Code
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Didn't receive a code? <button className="text-gray-900 font-semibold hover:underline">Resend</button>
          </p>
        </div>
      </div>
    </div>
  );

  const ResetFormModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0000004D' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
          <p className="text-gray-500 text-center mb-6">Create New Password.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwords.old}
                  onChange={(e) => setPasswords(prev => ({ ...prev, old: e.target.value }))}
                  className="w-full px-3 py-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPasswords.old ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full px-3 py-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPasswords.new ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full px-3 py-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPasswords.confirm ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePasswordReset}
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-hover mt-6"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );

  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0000004D' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed!!</h2>
          <p className="text-gray-500 mb-6">Your password has been changed successfully</p>
          
          <button
            onClick={handleCloseModal}
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <DashboardLayout title="Settings">
      <div className="space-y-8">
        {/* All Settings Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">All Settings</h1>
          <div className="flex gap-2">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleResetPassword}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Reset Password
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
              className="w-full max-w-md px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full max-w-md px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

        </div>

        {/* AI Bot Toggle */}
        <div className="flex items-center justify-between py-4">
          <h2 className="text-lg font-medium text-gray-900">AI Bot</h2>
          <button
            onClick={() => setAiBotEnabled(!aiBotEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              aiBotEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiBotEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Contact Us */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Us</h2>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Phone number</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email- xyz@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'resetConfirm' && <ResetConfirmModal />}
      {activeModal === 'verification' && <VerificationModal />}
      {activeModal === 'resetForm' && <ResetFormModal />}
      {activeModal === 'success' && <SuccessModal />}
    </DashboardLayout>
  );
}
