import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { loginThunk, selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice';
import type { AppDispatch } from '../../app/store';
import type { LoginPayload } from '../../types/user';
import AuthLayout from '../../layout/AuthLayout';
import PageMeta from '../../components/common/PageMeta';
import { PUBLIC } from '../../constants/routes';

const SignIn: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const from = (location.state as any)?.from?.pathname || '/student/dashboard';
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const roleRoutes: Record<string, string> = {
        admin:      '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student:    '/student/dashboard',
      };
      navigate(roleRoutes[currentUser.role] || from, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>();

  const onSubmit = async (data: LoginPayload) => {
    try {
      const res = await dispatch(loginThunk(data)).unwrap();
      toast.success(`Welcome back, ${res.user.firstName}!`);
      const roleRoutes: Record<string, string> = {
        admin:      '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student:    '/student/dashboard',
      };
      navigate(roleRoutes[res.user.role] || from, { replace: true });
    } catch (err: any) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <>
      <PageMeta
        title="Sign In | SkillForge LMS"
        description="Sign in to access your SkillForge LMS courses, quizzes, assignments, and digital credentials."
      />

      <AuthLayout
        type="signin"
        title="Welcome back."
        subtitle="Sign in to access your courses, sandboxes, and certificates."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                })}
                className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
                placeholder="you@company.com"
              />
              <Mail className="absolute left-3.5 text-gray-400 w-4 h-4" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-400 font-mono">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                id="signin-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-3.5 py-2.5 pl-10 pr-10 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
                placeholder="••••••••"
              />
              <Lock className="absolute left-3.5 text-gray-400 w-4 h-4" />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-400 font-mono">{errors.password.message}</p>}
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link to={PUBLIC.CONTACT} className="text-gray-400 hover:text-white transition-colors text-xs font-mono">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            id="signin-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 mt-2 bg-white hover:bg-gray-100 text-gray-950 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="animate-spin w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight className="w-4 h-4 text-gray-950" />
              </span>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to={PUBLIC.REGISTER} className="text-emerald-400 hover:text-emerald-300 font-mono font-bold transition-colors">
            Create one →
          </Link>
        </p>
      </AuthLayout>
    </>
  );
};

export default SignIn;
