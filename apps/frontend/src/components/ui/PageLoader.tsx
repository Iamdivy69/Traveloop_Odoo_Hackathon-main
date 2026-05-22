export default function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-955 transition-colors duration-300">
      <div className="relative flex flex-col items-center">
        {/* Animated outer ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-950/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
        
        {/* Sleek brand label */}
        <div className="mt-6 flex flex-col items-center space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
              Traveloop
            </span>
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
            Loading your adventure...
          </p>
        </div>
      </div>
    </div>
  );
}
