import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { forgotPassword as forgotPasswordApi } from '../../api/userApi';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await forgotPasswordApi(email);
      setMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-textPrimary">Reset your password</h2>
        <p className="text-center text-sm text-textSecondary">Enter the email address associated with your account, and we'll send you a link to reset your password.</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-textSecondary">Email address</label>
            <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-textSecondary">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-indigo-500">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
