import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Serene Space</h1>
              <span className="text-sm text-gray-500 hidden sm:inline">Personal Organization Hub</span>
            </div>
            <Authenticated>
              <SignOutButton />
            </Authenticated>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Authenticated>
          <Dashboard />
        </Authenticated>
        
        <Unauthenticated>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Serene Space</h2>
                <p className="text-gray-600">Your AI-powered personal organization hub</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>
      
      <Toaster />
    </div>
  );
}
