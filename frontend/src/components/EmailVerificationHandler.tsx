import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EmailVerificationHandlerProps {
  token?: string;
  email?: string;
  onClose?: () => void;
}

export const EmailVerificationHandler: React.FC<EmailVerificationHandlerProps> = ({ 
  token, 
  email, 
  onClose 
}) => {
  const { verifyEmail, resendVerification, isLoading } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState<string>('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string>('');

  useEffect(() => {
    // Check URL parameters if no token provided
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const urlEmail = urlParams.get('email');
      
      if (urlToken) {
        handleVerification(urlToken);
      } else {
        setStatus('idle');
      }
    } else {
      handleVerification(token);
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    setStatus('loading');
    setMessage('Verifying your email...');

    try {
      const success = await verifyEmail(verificationToken);
      if (success) {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now access all features.');
      } else {
        setStatus('error');
        setMessage('Email verification failed. The token may be invalid or expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Email verification failed');
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = email || new URLSearchParams(window.location.search).get('email');
    
    if (!emailToUse) {
      setResendStatus('error');
      setResendMessage('Email address is required to resend verification');
      return;
    }

    setResendStatus('loading');
    setResendMessage('Sending verification email...');

    try {
      const success = await resendVerification(emailToUse);
      if (success) {
        setResendStatus('success');
        setResendMessage('Verification email sent successfully! Please check your inbox.');
      } else {
        setResendStatus('error');
        setResendMessage('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setResendStatus('error');
      setResendMessage(error instanceof Error ? error.message : 'Failed to send verification email');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Mail className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' ? 'Verifying Email' : 
             status === 'success' ? 'Email Verified!' : 
             status === 'error' ? 'Verification Failed' : 'Email Verification'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Please wait while we verify your email address' :
             status === 'success' ? 'Your email has been successfully verified' :
             status === 'error' ? 'There was an issue verifying your email' :
             'Complete your account setup by verifying your email'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert className={getStatusColor()}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Welcome to melaX! Your account is now fully activated.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.href = '/'} 
                  className="flex-1"
                >
                  Go to Home
                </Button>
                {onClose && (
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  The verification link may be invalid or expired.
                </AlertDescription>
              </Alert>

              {(email || new URLSearchParams(window.location.search).get('email')) && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? We can send you a new verification link.
                  </p>
                  
                  <Button 
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'loading'}
                    variant="outline"
                    className="w-full"
                  >
                    {resendStatus === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>

                  {resendMessage && (
                    <Alert className={resendStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertDescription className={resendStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                        {resendMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="flex-1"
                >
                  Go to Home
                </Button>
                {onClose && (
                  <Button 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}

          {status === 'idle' && !token && (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  No verification token found. Please check your email for the verification link.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
