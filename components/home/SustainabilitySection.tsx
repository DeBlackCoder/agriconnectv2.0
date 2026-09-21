import Link from 'next/link';
import { Button } from '@/components/ui';

export default function SustainabilitySection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Striving for a <span className="text-yellow-500">Food-Secure Future</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              As a purpose-driven business, we're contributing positively to improving the prosperity 
              and well-being of farming communities across Nigeria, protecting our natural resources, 
              and tackling food security challenges.
            </p>
            <Link href="/sustainability">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg">
                Discover More
              </Button>
            </Link>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80" 
              alt="Sustainable farming and food security"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
