import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGithub, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
      
      if (data?.session) {
        toast.success('Registration successful. Redirecting to onboarding...');
        navigate('/onboarding/connect');
      } else {
        toast.success('Registration initiated. Please check your email for verification.');
        // Potentially show a confirmation screen or redirect
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.');
      console.error('Password register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B] p-4 font-mono">
      <Card className="w-full max-w-md bg-[#0F0F12] border-[#27272A] text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tighter text-cyan-500 uppercase">
            [AART] SYSTEM REGISTRATION
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Sign up to start scanning and securing your API-first applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="bg-transparent border-[#27272A] hover:bg-[#1A1A1E]"
              onClick={() => signInWithGithub()}
            >
              <Github className="mr-2 h-4 w-4" />
              GITHUB
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent border-[#27272A] hover:bg-[#1A1A1E]"
              onClick={() => signInWithGoogle()}
            >
              <LogIn className="mr-2 h-4 w-4" />
              GOOGLE
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#27272A]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0F0F12] px-2 text-zinc-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">EMAIL</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="dev@test.com" 
                className="bg-[#1A1A1E] border-[#27272A]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">PASSWORD</Label>
              <Input 
                id="password" 
                type="password" 
                className="bg-[#1A1A1E] border-[#27272A]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              disabled={isLoading}
            >
              {isLoading ? 'INITIATING...' : 'REQUEST ACCESS'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-zinc-500 text-center">
            ALREADY AN OPERATIVE?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-cyan-500 font-bold"
              onClick={() => navigate('/login')}
            >
              LOCATE ACCESS →
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
