import { Users, Package, Zap, Star } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Farmers',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    icon: Package,
    value: '50,000+',
    label: 'Products Listed',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
  },
  {
    icon: Zap,
    value: '100K+',
    label: 'Orders Delivered',
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-600',
  },
  {
    icon: Star,
    value: '4.9★',
    label: 'Customer Rating',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
];

export default function StatsSection() {
  return (
    <section className="py-12 sm:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.textColor}`} />
              </div>
              <div className={`text-2xl sm:text-4xl md:text-5xl font-bold ${stat.textColor} mb-1 sm:mb-2`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-base text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
