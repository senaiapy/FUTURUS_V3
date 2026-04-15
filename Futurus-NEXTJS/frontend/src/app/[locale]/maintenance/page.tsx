import { Wrench, Clock, Mail } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full"></div>
              <div className="relative p-8 bg-slate-900 rounded-full border border-slate-800">
                <Wrench className="w-20 h-20 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Under Maintenance
            </h1>
            <p className="text-xl text-slate-300 max-w-md mx-auto">
              We're performing scheduled maintenance to improve your experience.
            </p>
          </div>

          {/* Message Card */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Estimated Downtime</h3>
                <p className="text-slate-400">
                  We expect to be back online within the next few hours. Thank you for your patience!
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-800"></div>

            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-slate-400">
                  For urgent matters, please contact our support team at{' '}
                  <a href="mailto:support@futurus.com.br" className="text-primary hover:underline">
                    support@futurus.com.br
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Status Updates */}
          <div className="text-sm text-slate-500">
            <p>
              Check our{' '}
              <a href="https://twitter.com/futurus" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Twitter
              </a>
              {' '}for real-time updates
            </p>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
