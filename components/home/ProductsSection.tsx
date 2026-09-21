import Link from 'next/link';
import { Leaf, Apple, Wheat, Package, Sprout, ShoppingBag } from 'lucide-react';

const products = [
  { name: 'Vegetables', icon: Leaf, color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  { name: 'Fruits', icon: Apple, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { name: 'Grains', icon: Wheat, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600' },
  { name: 'Tubers', icon: Package, color: 'pink', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
  { name: 'Legumes', icon: Package, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { name: 'Spices', icon: Sprout, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  { name: 'Organic Products', icon: Leaf, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600' },
  { name: 'Livestock Feed', icon: ShoppingBag, color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
];

export default function ProductsSection() {
  return (
    <section className="py-12 sm:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Our Products & Services
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Whether it's working with rice farmers in Nigeria, sourcing vegetables in the North, 
            or delivering fresh produce to urban markets, we help meet the increasing demand for quality food.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product, i) => (
            <Link key={i} href={`/products?category=${product.name}`}>
              <div className={`${product.bgColor} p-4 sm:p-6 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group`}>
                <product.icon className={`w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-4 ${product.textColor}`} />
                <h3 className={`text-sm sm:text-lg font-bold ${product.textColor} group-hover:underline`}>
                  {product.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
