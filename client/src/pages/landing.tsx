import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-card shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-receipt text-primary-foreground text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">BillCollect Pro</h1>
          <p className="text-muted-foreground">Professional Bill Collection Management</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleSignIn}
            className="w-full bg-white border border-border hover:bg-gray-50 text-foreground font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors duration-200 shadow-sm"
            variant="outline"
            data-testid="button-sign-in-google"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <i className="fas fa-wifi-slash mr-1"></i>
              Works offline after initial setup
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
