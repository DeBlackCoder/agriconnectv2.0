import { Navbar, Footer } from '@/components/layout';
import { Card } from '@/components/ui';
import { UserPlus, Search, ShoppingCart, Truck, CheckCircle, Sprout, Package, CreditCard, Star, TrendingUp, ShieldCheck } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How <span className="text-green-600">AgriConnect</span> Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple, transparent, and efficient. Connect directly with farmers or buyers in just a few steps.
            </p>
          </div>

          {/* For Buyers Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">For Buyers</h2>
              <p className="text-lg text-gray-600">Get fresh produce directly from farmers</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {[
                {
                  icon: UserPlus,
                  step: '1',
                  title: 'Create Account',
                  description: 'Sign up as a buyer with your basic information',
                  color: 'bg-blue-50',
                  iconColor: 'text-blue-600',
                },
                {
                  icon: Search,
                  step: '2',
                  title: 'Browse Products',
                  description: 'Search and filter products by category, location, and price',
                  color: 'bg-green-50',
                  iconColor: 'text-green-600',
                },
                {
                  icon: ShoppingCart,
                  step: '3',
                  title: 'Place Order',
                  description: 'Add items to cart and checkout with secure payment',
                  color: 'bg-purple-50',
                  iconColor: 'text-purple-600',
                },
                {
                  icon: Truck,
                  step: '4',
                  title: 'Receive Delivery',
                  description: 'Track your order and receive fresh produce at your doorstep',
                  color: 'bg-orange-50',
                  iconColor: 'text-orange-600',
                },
              ].map((item, i) => (
                <Card key={i} className={`${item.color} p-6 border-2 border-gray-200 hover:shadow-xl transition-all relative`}>
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{item.step}</span>
                  </div>
                  <div className="flex flex-col items-center text-center mt-4">
                    <item.icon className={`w-12 h-12 ${item.iconColor} mb-4`} />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80" 
                alt="Shopping for fresh produce"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* For Farmers Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">For Farmers</h2>
              <p className="text-lg text-gray-600">Sell your produce directly to buyers nationwide</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {[
                {
                  icon: Sprout,
                  step: '1',
                  title: 'Register Farm',
                  description: 'Create your farmer profile with farm details and location',
                  color: 'bg-green-50',
                  iconColor: 'text-green-600',
                },
                {
                  icon: Package,
                  step: '2',
                  title: 'List Products',
                  description: 'Upload products with photos, descriptions, and pricing',
                  color: 'bg-blue-50',
                  iconColor: 'text-blue-600',
                },
                {
                  icon: CheckCircle,
                  step: '3',
                  title: 'Receive Orders',
                  description: 'Get notified when buyers place orders for your products',
                  color: 'bg-purple-50',
                  iconColor: 'text-purple-600',
                },
                {
                  icon: CreditCard,
                  step: '4',
                  title: 'Get Paid',
                  description: 'Receive payments directly to your account after delivery',
                  color: 'bg-yellow-50',
                  iconColor: 'text-yellow-600',
                },
              ].map((item, i) => (
                <Card key={i} className={`${item.color} p-6 border-2 border-gray-200 hover:shadow-xl transition-all relative`}>
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{item.step}</span>
                  </div>
                  <div className="flex flex-col items-center text-center mt-4">
                    <item.icon className={`w-12 h-12 ${item.iconColor} mb-4`} />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80" 
                alt="Farmers working"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Platform Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: 'AI-Powered Pricing',
                  description: 'Smart pricing suggestions based on market trends, location, and demand to help farmers set competitive prices.',
                },
                {
                  icon: CreditCard,
                  title: 'Secure Payments',
                  description: 'Integration with Paystack ensures safe transactions with multiple payment options including cards and bank transfers.',
                },
                {
                  icon: Truck,
                  title: 'Order Tracking',
                  description: 'Real-time order status updates from placement to delivery with complete transparency.',
                },
                {
                  icon: Star,
                  title: 'Rating System',
                  description: 'Build trust with verified reviews and ratings from actual buyers and sellers.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Quality Assurance',
                  description: 'Verified sellers, quality checks, and buyer protection to ensure satisfaction.',
                },
                {
                  icon: Package,
                  title: 'Inventory Management',
                  description: 'Easy-to-use tools for farmers to manage stock levels and product availability.',
                },
              ].map((feature, i) => (
                <Card key={i} className="p-8 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  q: 'How do I get started?',
                  a: 'Simply register as either a farmer or buyer, complete your profile, and start buying or selling immediately.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major payment cards, bank transfers, and mobile money through our secure Paystack integration.',
                },
                {
                  q: 'How does delivery work?',
                  a: 'Delivery is arranged between farmers and buyers. You can track your order status in real-time through your dashboard.',
                },
                {
                  q: 'Is there a commission fee?',
                  a: 'We charge a small platform fee to maintain and improve our services. Pricing is transparent with no hidden charges.',
                },
                {
                  q: 'How do I know if a farmer is verified?',
                  a: 'All farmers go through our verification process. Look for the verified badge and check ratings from other buyers.',
                },
              ].map((faq, i) => (
                <Card key={i} className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of farmers and buyers on AgriConnect today
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
