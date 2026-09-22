import { Users, Package, Zap, Star } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Farmers',
    color: 'purple',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Package,
    value: '50,000+',
    label: 'Products Listed',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    icon: Zap,
    value: '100K+',
    label: 'Orders Delivered',
    color: 'pink',
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    icon: Star,
    value: '4.9',
    label: 'Customer Rating',
    color: 'blue',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    suffix: '★',
  },
];

export default function StatsSection() {
  return (
    <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300`}>
                <stat.icon className={`w-7 h-7 sm:w-10 sm:h-10 ${stat.iconColor}`} strokeWidth={2} />
              </div>
              <div className={`text-2xl sm:text-4xl md:text-5xl font-bold ${stat.iconColor} mb-1 sm:mb-2`}>
                {stat.value}{stat.suffix || ''}
              </div>
              <div className="text-xs sm:text-base text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
