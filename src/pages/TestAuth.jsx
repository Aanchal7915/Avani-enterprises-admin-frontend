import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const TestAuth = () => {
  const { token, user, loading } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const testLeadsEndpoint = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      console.log("Testing /leads endpoint...");
      console.log("Token:", token);
      console.log("Axios headers:", axios.defaults.headers.common);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/leads`);
      
      setTestResult({
        success: true,
        message: "✅ Success! Leads fetched successfully",
        data: response.data,
        count: response.data?.length || 0
      });
    } catch (error) {
      console.error("Test failed:", error);
      setTestResult({
        success: false,
        message: "❌ Failed to fetch leads",
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        headers: error.config?.headers
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Authentication Test Page</h1>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Loading:</span>
              <span className={loading ? "text-yellow-600" : "text-green-600"}>
                {loading ? "⏳ Yes" : "✅ No"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Token:</span>
              <span className={token ? "text-green-600" : "text-red-600"}>
                {token ? "✅ Exists" : "❌ Missing"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User:</span>
              <span className={user ? "text-green-600" : "text-red-600"}>
                {user ? `✅ ${user.name} (${user.email})` : "❌ Not logged in"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Axios Header:</span>
              <span className={axios.defaults.headers.common.Authorization ? "text-green-600" : "text-red-600"}>
                {axios.defaults.headers.common.Authorization ? "✅ Set" : "❌ Not set"}
              </span>
            </div>
          </div>

          {token && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs font-mono break-all">
                <strong>Token:</strong> {token.substring(0, 50)}...
              </p>
            </div>
          )}
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test /leads Endpoint</h2>
          <button
            onClick={testLeadsEndpoint}
            disabled={!token || testLoading}
            className={`px-6 py-3 rounded-lg font-medium ${
              !token
                ? "bg-gray-300 cursor-not-allowed"
                : testLoading
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {testLoading ? "Testing..." : "Test Leads API"}
          </button>

          {!token && (
            <p className="mt-2 text-red-600 text-sm">
              ⚠️ Please login first to test the API
            </p>
          )}
        </div>

        {/* Test Results */}
        {testResult && (
          <div className={`rounded-lg shadow p-6 ${
            testResult.success ? "bg-green-50" : "bg-red-50"
          }`}>
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              <p className={`text-lg font-medium ${
                testResult.success ? "text-green-700" : "text-red-700"
              }`}>
                {testResult.message}
              </p>

              {testResult.success ? (
                <>
                  <p className="text-gray-700">
                    <strong>Leads Count:</strong> {testResult.count}
                  </p>
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium text-gray-700">
                      View Response Data
                    </summary>
                    <pre className="mt-2 p-4 bg-white rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </details>
                </>
              ) : (
                <>
                  <p className="text-red-700">
                    <strong>Error:</strong> {testResult.error}
                  </p>
                  {testResult.status && (
                    <p className="text-red-700">
                      <strong>Status Code:</strong> {testResult.status}
                    </p>
                  )}
                  {testResult.headers && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium text-red-700">
                        View Request Headers
                      </summary>
                      <pre className="mt-2 p-4 bg-white rounded text-xs overflow-auto">
                        {JSON.stringify(testResult.headers, null, 2)}
                      </pre>
                    </details>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Make sure you're logged in (check Auth Status above)</li>
            <li>Click "Test Leads API" button</li>
            <li>Check the results below</li>
            <li>If it fails, open browser console (F12) for detailed logs</li>
            <li>If successful, your Dashboard should work too!</li>
          </ol>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <a
              href="/login"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Login
            </a>
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
