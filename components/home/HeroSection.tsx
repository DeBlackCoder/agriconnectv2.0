import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-blue-50 pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80" 
          alt="Fresh agricultural produce and farming"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            We offer our customers <br />
            <span className="text-orange-500">a deeper understanding</span> of market needs.
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl">
            We connect farmers directly with buyers through innovative technology. 
            Our platform provides transparent pricing, secure transactions, and sustainable farming practices across Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/products">
              <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center gap-2">
                Browse Products <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Link href="/farmers">
              <Button variant="outline" className="w-full sm:w-auto border-orange-500 text-orange-500 hover:bg-orange-50 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold">
                For Farmers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
