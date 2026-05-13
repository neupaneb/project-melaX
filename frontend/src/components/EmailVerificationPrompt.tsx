import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EmailVerificationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onResendVerification?: () => void;
  message?: string;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({
  isOpen,
  onClose,
  onResendVerification,
  message = 'Please verify your email address to purchase tickets and access premium features.'
}) => {
  const { user, resendVerification } = useAuth();
  const [isResending, setIsResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setResendStatus('idle');

    try {
      const success = await resendVerification(user.email);
      if (success) {
        setResendStatus('success');
        if (onResendVerification) {
          onResendVerification();
        }
      } else {
        setResendStatus('error');
      }
    } catch (error) {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    if (resendStatus === 'success') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (resendStatus === 'error') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    return <Mail className="h-5 w-5 text-blue-500" />;
  };

  const getStatusMessage = () => {
    if (resendStatus === 'success') {
      return 'Verification email sent successfully! Please check your inbox.';
    }
    if (resendStatus === 'error') {
      return 'Failed to send verification email. Please try again.';
    }
    return '';
  };

  const getStatusColor = () => {
    if (resendStatus === 'success') {
      return 'border-green-200 bg-green-50';
    }
    if (resendStatus === 'error') {
      return 'border-red-200 bg-red-50';
    }
    return 'border-blue-200 bg-blue-50';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Email Verification Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className={getStatusColor()}>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>

          {user?.email && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                We sent a verification email to: <strong>{user.email}</strong>
              </p>

              <div className="space-y-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                {resendStatus !== 'idle' && (
                  <Alert className={getStatusColor()}>
                    <AlertDescription className={resendStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {getStatusMessage()}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => window.open('https://mail.google.com', '_blank')}
              className="flex-1"
            >
              Open Gmail
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Check your spam folder if you don't see the email.</p>
            <p>Verification links expire after 24 hours.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
