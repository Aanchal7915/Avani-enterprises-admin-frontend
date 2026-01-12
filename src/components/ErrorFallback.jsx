import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorFallback = ({ error, resetError, message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-red-100 shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {message || "Something went wrong"}
        </h2>
        
        <p className="text-sm text-gray-600 mb-6">
          {error?.message || "The backend API might not be configured yet. Please check your backend server."}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-700 mb-2">Quick Fix:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Make sure your backend server is running</li>
            <li>• Check if the API endpoints exist</li>
            <li>• Verify CORS is configured correctly</li>
          </ul>
        </div>

        {resetError && (
          <button
            onClick={resetError}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all shadow-md"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
