import { Navbar, Footer } from '@/components/layout';
import { Card } from '@/components/ui';
import { Users, Target, Heart, Award, TrendingUp, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-green-600">AgriConnect</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing agriculture in Nigeria by connecting farmers directly with buyers, 
              ensuring fair prices and sustainable farming practices.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" 
                  alt="Farmers in field"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                To empower Nigerian farmers with technology that connects them directly to markets, 
                eliminates middlemen, and ensures they receive fair compensation for their hard work.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe in building a sustainable agricultural ecosystem where farmers prosper, 
                buyers get quality produce, and communities thrive.
              </p>
            </div>
          </div>

          {/* Our Story */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12 mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                AgriConnect was founded in 2024 with a simple vision: to transform Nigerian agriculture 
                through technology. We saw how hardworking farmers struggled to get fair prices while 
                urban buyers paid premium costs due to multiple intermediaries.
              </p>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Our platform leverages AI-powered pricing, secure payment systems, and real-time logistics 
                to create a transparent marketplace where everyone benefits. From rice farmers in the North 
                to vegetable growers in the South, we're building bridges between farm and table.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we serve over 10,000 farmers and have facilitated more than 100,000 orders, 
                contributing to food security and economic empowerment across Nigeria.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: 'Farmer-First',
                  description: 'We put farmers at the center of everything we do, ensuring their prosperity and well-being.',
                  color: 'text-red-600',
                  bgColor: 'bg-red-50',
                },
                {
                  icon: Target,
                  title: 'Transparency',
                  description: 'Clear pricing, honest transactions, and open communication across our entire platform.',
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50',
                },
                {
                  icon: TrendingUp,
                  title: 'Innovation',
                  description: 'Leveraging technology to solve age-old agricultural challenges with modern solutions.',
                  color: 'text-green-600',
                  bgColor: 'bg-green-50',
                },
                {
                  icon: Users,
                  title: 'Community',
                  description: 'Building strong relationships between farmers, buyers, and all stakeholders.',
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50',
                },
                {
                  icon: Award,
                  title: 'Quality',
                  description: 'Committed to delivering the highest quality products and service excellence.',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-50',
                },
                {
                  icon: Globe,
                  title: 'Sustainability',
                  description: 'Promoting eco-friendly practices and long-term agricultural sustainability.',
                  color: 'text-teal-600',
                  bgColor: 'bg-teal-50',
                },
              ].map((value, i) => (
                <Card key={i} className="p-8 hover:shadow-xl transition-shadow">
                  <div className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Impact</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: '10,000+', label: 'Farmers Connected' },
                { number: '100K+', label: 'Orders Delivered' },
                { number: '36', label: 'States Covered' },
                { number: '₦500M+', label: 'Value Transacted' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-3">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-green-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-xl mb-8 opacity-90">
              Be part of the agricultural revolution transforming Nigeria
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/register"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Create Account
              </a>
              <a 
                href="/products"
                className="bg-green-700 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-800 transition-colors border-2 border-white"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
