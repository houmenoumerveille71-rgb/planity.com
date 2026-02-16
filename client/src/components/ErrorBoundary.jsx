import { useState, useEffect } from 'react';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      setError(error);
      setErrorInfo(errorInfo);
      setHasError(true);
    };

    // For unhandled errors
    window.addEventListener('error', (event) => {
      handleError(event.error, null);
    });

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Une erreur est survenue
            </h1>
            <p className="text-gray-600 mb-6">
              Nous nous excusons pour la gêne occasionnée.
            </p>
            
            {/* Afficher l'erreur pour le débogage */}
            <div className="text-left bg-gray-100 rounded-lg p-4 mb-6 overflow-auto max-h-64">
              <p className="font-mono text-sm text-red-600 mb-2">
                {error?.toString()}
              </p>
              {errorInfo && (
                <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
            
            <button
              onClick={handleReload}
              className="bg-purple-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ErrorBoundary;
