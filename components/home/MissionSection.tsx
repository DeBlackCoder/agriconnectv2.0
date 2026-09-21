import Link from 'next/link';
import { Button } from '@/components/ui';

export default function MissionSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cultivating <span className="text-pink-500">Transformation</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We're a trusted partner across multiple supply chains. We unlock value for customers, 
              enable farming communities to prosper sustainably and strive for a food-secure future.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Learn more about how we connect farmers directly with buyers, ensuring fair prices and 
              sustainable agricultural practices.
            </p>
            <Link href="/about">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg">
                Discover More
              </Button>
            </Link>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" 
              alt="Farmers working in agricultural field"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="w-0 h-0 border-l-[20px] border-l-green-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                </div>
                <p className="text-white font-medium">Watch Our Story</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
