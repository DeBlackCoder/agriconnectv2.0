import Link from 'next/link';
import { Button } from '@/components/ui';

export default function CTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <div className="relative h-64 sm:h-80 lg:h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80" 
              alt="Farmers working together in community"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Creating Opportunities to <span className="text-blue-500">Make a Difference</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              We empower farmers to get fair prices and buyers to access quality produce. 
              Join our platform and be part of Nigeria's agricultural transformation.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Our values encourage innovation, take ownership of decisions, and explore new ways of connecting farmers with markets.
            </p>
            <Link href="/auth/register">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg">
                Join AgriConnect Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
