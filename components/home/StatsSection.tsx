'use client';

import { Users, Package, Zap, Star, TrendingUp } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const stats = [
  {
    icon: Users,
    value: 10000,
    label: 'Active Farmers',
    suffix: '+',
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-emerald-600',
    lightBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    description: 'Trusted partners',
  },
  {
    icon: Package,
    value: 50000,
    label: 'Products Listed',
    suffix: '+',
    color: 'amber',
    bgGradient: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    description: 'Fresh inventory',
  },
  {
    icon: Zap,
    value: 100000,
    label: 'Orders Delivered',
    suffix: '+',
    color: 'rose',
    bgGradient: 'from-rose-500 to-rose-600',
    lightBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    description: 'Successfully completed',
  },
  {
    icon: Star,
    value: 4.9,
    label: 'Customer Rating',
    suffix: '★',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    description: 'Average satisfaction',
    decimals: 1,
  },
];

// Counter animation hook
function useCounter(end: number, duration: number = 2000, decimals: number = 0) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const animate = () => {
    if (hasAnimated) return;
    setHasAnimated(true);
    
    const startTime = Date.now();
    const step = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * end);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  return { count, animate, hasAnimated };
}

export default function StatsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Our Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Transforming Agriculture
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Empowering farmers and connecting communities across Nigeria
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg border border-slate-200">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white"></div>
              ))}
            </div>
            <div className="text-left ml-2">
              <div className="text-sm font-bold text-slate-900">Trusted by thousands</div>
              <div className="text-xs text-slate-600">Join our growing community</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { count, animate } = useCounter(stat.value, 2000, stat.decimals || 0);

  useEffect(() => {
    if (inView) {
      animate();
    }
  }, [inView, animate]);

  const formatNumber = (num: number) => {
    if (stat.decimals) {
      return num.toFixed(stat.decimals);
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <div
      ref={ref}
      className="group relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card */}
      <div className={`relative ${stat.lightBg} rounded-3xl p-6 sm:p-8 h-full border-2 border-transparent hover:border-${stat.color}-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="mb-4 sm:mb-6">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              <stat.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconColor}`} strokeWidth={2.5} />
            </div>
          </div>

          {/* Value */}
          <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${stat.iconColor} mb-2 transition-all duration-300`}>
            {inView ? formatNumber(count) : '0'}{stat.suffix}
          </div>

          {/* Label */}
          <div className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
            {stat.label}
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-slate-600">
            {stat.description}
          </div>

          {/* Progress indicator */}
          <div className="mt-4 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${stat.bgGradient} transition-all duration-1000 ease-out`}
              style={{ width: inView ? '100%' : '0%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
