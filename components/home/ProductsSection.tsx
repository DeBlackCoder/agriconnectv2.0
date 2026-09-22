import Link from 'next/link';
import Image from 'next/image';

const products = [
  { 
    name: 'Vegetables', 
    image: 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-yellow-50', 
    textColor: 'text-yellow-600' 
  },
  { 
    name: 'Fruits', 
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-purple-50', 
    textColor: 'text-purple-600' 
  },
  { 
    name: 'Grains', 
    image: 'https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-green-50', 
    textColor: 'text-green-600' 
  },
  { 
    name: 'Tubers', 
    image: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-pink-50', 
    textColor: 'text-pink-600' 
  },
  { 
    name: 'Legumes', 
    image: 'https://images.pexels.com/photos/4022094/pexels-photo-4022094.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-blue-50', 
    textColor: 'text-blue-600' 
  },
  { 
    name: 'Spices', 
    image: 'https://images.pexels.com/photos/357743/pexels-photo-357743.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-orange-50', 
    textColor: 'text-orange-600' 
  },
  { 
    name: 'Organic Products', 
    image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-green-50', 
    textColor: 'text-green-600' 
  },
  { 
    name: 'Livestock Feed', 
    image: 'https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=400',
    bgColor: 'bg-amber-50', 
    textColor: 'text-amber-600' 
  },
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
              <div className="relative rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group h-32 sm:h-48">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Text overlay with white background */}
                <div className="absolute inset-0 flex items-end p-3 sm:p-4">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded group-hover:underline">
                    {product.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
