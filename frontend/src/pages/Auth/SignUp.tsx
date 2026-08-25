import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { registerThunk, selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice';
import type { AppDispatch } from '../../app/store';
import type { RegisterPayload } from '../../types/user';
import AuthLayout from '../../layout/AuthLayout';
import PageMeta from '../../components/common/PageMeta';
import { PUBLIC } from '../../constants/routes';

const SignUp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const roleRoutes: Record<string, string> = {
        admin:      '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student:    '/student/dashboard',
      };
      navigate(roleRoutes[currentUser.role] || '/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload & { confirmPassword: string }>({ defaultValues: { role: 'student' } });

  const password = watch('password');

  const onSubmit = async (data: RegisterPayload & { confirmPassword: string }) => {
    const { confirmPassword, ...payload } = data;
    if (confirmPassword !== password) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await dispatch(registerThunk(payload)).unwrap();
      toast.success(`Account created! Welcome, ${res.user.firstName}!`);
      const roleRoutes: Record<string, string> = {
        admin:      '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student:    '/student/dashboard',
      };
      navigate(roleRoutes[res.user.role] || '/', { replace: true });
    } catch (err: any) {
      toast.error(err || 'Registration failed');
    }
  };

  return (
    <>
      <PageMeta
        title="Create Account | SkillForge LMS"
        description="Create your SkillForge LMS account to join production-grade software development cohorts and earn credentials."
      />

      <AuthLayout
        type="signup"
        title="Create your account."
        subtitle="Start learning with production-grade courses and verified credentials."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1">
                First Name
              </label>
              <div className="relative flex items-center">
                <input
                  id="signup-firstname"
                  type="text"
                  {...register('firstName', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
                  className="w-full px-3 py-2 pl-9 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
                  placeholder="Alex"
                />
                <User className="absolute left-3 text-gray-400 w-3.5 h-3.5" />
              </div>
              {errors.firstName && <p className="mt-1 text-[11px] text-rose-400 font-mono">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <input
                id="signup-lastname"
                type="text"
                {...register('lastName', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
                placeholder="Mercer"
              />
              {errors.lastName && <p className="mt-1 text-[11px] text-rose-400 font-mono">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <input
                id="signup-email"
                type="email"
                {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                className="w-full px-3 py-2 pl-9 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
                placeholder="alex@company.com"
              />
              <Mail className="absolute left-3 text-gray-400 w-3.5 h-3.5" />
            </div>
            {errors.email && <p className="mt-1 text-[11px] text-rose-400 font-mono">{errors.email.message}</p>}
          </div>

          {/* Account Role Notice */}
          <div>
            <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1">
              Account Type
            </label>
            <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono">
              <ShieldCheck className="text-emerald-400 w-3.5 h-3.5 mr-2" />
              <span>Student / Developer Account</span>
            </div>
            <p className="mt-1 text-[10px] text-gray-400 font-mono">
              Looking to teach? You can apply as an Instructor after creating your account.
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                {...register('password', {
                  required: 'Required',
                  minLength: { value: 8, message: 'Min 8 characters' },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase & number' },
                })}
                className="w-full px-3 py-2 pl-9 pr-9 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
                placeholder="Min 8 chars (A-z, 0-9)"
              />
              <Lock className="absolute left-3 text-gray-400 w-3.5 h-3.5" />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                className="absolute right-3 text-gray-400 hover:text-white transition-colors"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[11px] text-rose-400 font-mono">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <input
                id="signup-confirm-password"
                type={showPw ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Required',
                  validate: (v) => v === password || 'Passwords do not match',
                })}
                className="w-full px-3 py-2 pl-9 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
                placeholder="Repeat password"
              />
              <Lock className="absolute left-3 text-gray-400 w-3.5 h-3.5" />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-[11px] text-rose-400 font-mono">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            id="signup-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 mt-2 bg-white hover:bg-gray-100 text-gray-950 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="animate-spin w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Create Account <ArrowRight className="w-3.5 h-3.5 text-gray-950" />
              </span>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to={PUBLIC.LOGIN} className="text-emerald-400 hover:text-emerald-300 font-mono font-bold transition-colors">
            Sign In →
          </Link>
        </p>
      </AuthLayout>
    </>
  );
};

export default SignUp;
