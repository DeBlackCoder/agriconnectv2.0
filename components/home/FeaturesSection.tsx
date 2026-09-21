import Link from 'next/link';
import { Button } from '@/components/ui';

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80" 
              alt="Fresh vegetables and produce"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Firm Foundations for <span className="text-orange-500">Sustainable Growth</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We offer our farmers, our customers and every member of our supply chains, 
              a robust, and forward-looking approach to food distribution.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our practices are firmly rooted in experience and understanding. We leverage 
              AI-powered pricing, secure payments through Paystack, and real-time logistics tracking.
            </p>
            <Link href="/how-it-works">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg">
                Discover More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
