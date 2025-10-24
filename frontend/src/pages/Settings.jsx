import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, User, Bell, Lock } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, [user]);

  const handleEnable2FA = async () => {
    try {
      const response = await api.post('/auth/enable-2fa');
      setQrCode(response.data.qrCode);
      setShowQR(true);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      alert('Failed to enable 2FA');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post('/auth/verify-2fa', {
        token: verificationCode,
        userId: user.id,
      });
      setTwoFactorEnabled(true);
      setShowQR(false);
      setVerificationCode('');
      alert('2FA enabled successfully!');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('Invalid verification code');
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable 2FA?')) {
      try {
        await api.post('/auth/disable-2fa');
        setTwoFactorEnabled(false);
        alert('2FA disabled successfully!');
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        alert('Failed to disable 2FA');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <User className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={user?.name || ''}
              className="mt-1 input-field"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="mt-1 input-field"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              value={user?.phoneNumber || ''}
              placeholder="Not set"
              className="mt-1 input-field"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
        </div>

        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  twoFactorEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {twoFactorEnabled ? (
                <button onClick={handleDisable2FA} className="btn-secondary">
                  Disable
                </button>
              ) : (
                <button onClick={handleEnable2FA} className="btn-primary">
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* QR Code Display */}
          {showQR && qrCode && (
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Scan QR Code with Authenticator App
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Use Google Authenticator, Authy, or any TOTP authenticator app to scan
                this QR code
              </p>
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  className="input-field"
                  maxLength="6"
                />
                <button
                  onClick={handleVerify2FA}
                  className="w-full btn-primary"
                  disabled={verificationCode.length !== 6}
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          )}

          {/* Change Password */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Change your account password
              </p>
            </div>
            <button className="btn-secondary">
              <Lock className="h-4 w-4 mr-2 inline" />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Bell className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Budget Alerts</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive alerts when you reach your budget threshold
              </p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Transaction Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get notified for each transaction
              </p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Weekly Summary</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive weekly financial summary reports
              </p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
