import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

// Constants
const BACKGROUND_IMAGE = {
  src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80',
  alt: 'Fresh agricultural produce and farming',
};

const CONTENT = {
  headline: 'We offer our customers ',
  highlight: 'a deeper understanding',
  headlineEnd: ' of market needs.',
  description:
    'We connect farmers directly with buyers through innovative technology. Our platform provides transparent pricing, secure transactions, and sustainable farming practices across Nigeria.',
};

const BUTTONS = [
  {
    href: '/products',
    variant: 'primary' as const,
    label: 'Browse Products',
    icon: true,
    className: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  {
    href: '/farmers',
    variant: 'outline' as const,
    label: 'For Farmers',
    icon: false,
    className: 'border-orange-500 text-orange-500 hover:bg-orange-50',
  },
];

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-blue-50 pt-36 sm:pt-32 md:pt-40 lg:pt-48 pb-10 sm:pb-12 lg:pb-20 px-4 overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 opacity-40 mt-24 sm:mt-0">
        <img
          src={BACKGROUND_IMAGE.src}
          alt={BACKGROUND_IMAGE.alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-4xl">
          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 mt-24 sm:mt-0 leading-tight">
            {CONTENT.headline}
            <span className="text-orange-500">{CONTENT.highlight}</span>
            {CONTENT.headlineEnd}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-3xl">
            {CONTENT.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {BUTTONS.map((button) => (
              <Link key={button.href} href={button.href}>
                <Button
                  variant={button.variant}
                  className={`w-full sm:w-auto ${button.className} px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-semibold`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {button.label}
                    {button.icon && (
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}