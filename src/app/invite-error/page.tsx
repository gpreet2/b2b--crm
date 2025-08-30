'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

function InviteErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    error: '',
    message: '',
    description: ''
  });

  useEffect(() => {
    setErrorDetails({
      error: searchParams.get('error') || 'unknown_error',
      message: searchParams.get('message') || '',
      description: searchParams.get('description') || ''
    });
  }, [searchParams]);

  const getErrorTitle = (error: string) => {
    switch (error) {
      case 'missing_code':
        return 'Authentication Failed';
      case 'missing_token':
        return 'Invalid Invitation Link';
      case 'signup_failed':
        return 'Account Creation Failed';
      case 'callback_failed':
        return 'System Error';
      default:
        return 'Invitation Error';
    }
  };

  const getErrorMessage = (error: string, message: string, description: string) => {
    if (message) return message;
    if (description) return description;
    
    switch (error) {
      case 'missing_code':
        return 'The authentication process was not completed properly. Please try again.';
      case 'missing_token':
        return 'The invitation link appears to be incomplete or invalid. Please check your email for the correct link.';
      case 'signup_failed':
        return 'We were unable to create your account. This might be because the invitation has already been used or has expired.';
      case 'callback_failed':
        return 'A technical error occurred while processing your invitation. Please try again later.';
      default:
        return 'An unexpected error occurred while processing your invitation.';
    }
  };

  const getSuggestion = (error: string) => {
    switch (error) {
      case 'missing_code':
        return 'Try clicking the invitation link from your email again.';
      case 'missing_token':
        return 'Please use the invitation link directly from your email.';
      case 'signup_failed':
        return 'Contact your administrator to request a new invitation.';
      case 'callback_failed':
        return 'Wait a moment and try again, or contact support if the problem persists.';
      default:
        return 'Contact your administrator or try again with a new invitation.';
    }
  };

  const handleTryAgain = () => {
    // Clear any stored invitation token
    localStorage.removeItem('invitation_token');
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-xl font-bold text-gray-900 text-center mb-4">
          {getErrorTitle(errorDetails.error)}
        </h1>

        {/* Error Message */}
        <div className="mb-6">
          <p className="text-gray-600 text-center mb-4">
            {getErrorMessage(errorDetails.error, errorDetails.message, errorDetails.description)}
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Suggestion:</strong> {getSuggestion(errorDetails.error)}
            </p>
          </div>
        </div>

        {/* Error Code (for debugging) */}
        {errorDetails.error && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 text-center">
              Error Code: {errorDetails.error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Support Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact your administrator or{' '}
            <a href="mailto:support@tryzore.com" className="text-blue-600 hover:text-blue-700 underline">
              support@tryzore.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InviteErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <InviteErrorContent />
    </Suspense>
  );
}