export default function AuthFooter() {
  return (
    <footer className="w-full py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-tosca-600/70">
          © 2024 S-Property. All rights reserved.
        </p>
        <div className="flex justify-center space-x-6 mt-2">
          <a 
            href="/privacy" 
            className="text-xs text-tosca-500 hover:text-tosca-600 transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="text-xs text-tosca-500 hover:text-tosca-600 transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}