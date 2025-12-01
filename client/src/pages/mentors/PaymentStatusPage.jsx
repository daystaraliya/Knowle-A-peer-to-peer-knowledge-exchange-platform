import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';

const PaymentStatusPage = ({ status }) => {
    const { refetchUser } = useContext(AuthContext);

    // Refetch user data on success to update their premium status in the context
    useEffect(() => {
        if (status === 'success') {
            refetchUser();
        }
    }, [status, refetchUser]);

    const isSuccess = status === 'success';

    return (
        <div className="flex flex-col items-center justify-center text-center py-20">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-12 w-12 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    {isSuccess ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                </svg>
            </div>
            <h1 className="text-4xl font-bold mt-6">
                {isSuccess ? 'Payment Successful!' : 'Payment Cancelled'}
            </h1>
            <p className="mt-4 text-lg text-textSecondary max-w-md">
                {isSuccess
                    ? "Thank you for your purchase. Your access has been updated. You can now enjoy your new benefits."
                    : "Your payment was not completed. You can try again or return to the homepage."}
            </p>
            <div className="mt-8">
                <Link to="/dashboard">
                    <Button>{isSuccess ? 'Go to Dashboard' : 'Return to Home'}</Button>
                </Link>
            </div>
        </div>
    );
};

export default PaymentStatusPage;