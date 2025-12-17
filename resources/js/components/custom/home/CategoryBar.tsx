import React from 'react';
import { 
  FiUser, 
  FiUsers,
  FiMonitor,
  
  FiShoppingBag,
  FiHome,
  FiClock,
  FiHeart,
  FiEye,
  FiDroplet,
  FiBriefcase,
  FiStar,
  FiRefreshCw,
  FiTool,
  FiBook,
  FiMoreHorizontal
} from 'react-icons/fi';

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const categories: CategoryItem[] = [
  {
    id: 'women',
    label: 'Women',
    icon: <FiUser size={20} />,
    href: '/categories/women'
  },
  {
    id: 'men',
    label: 'Men',
    icon: <FiUsers size={20} />,
    href: '/categories/men'
  },
  {
    id: 'electronics',
    label: 'Electronics',
    icon: <FiMonitor size={20} />,
    href: '/categories/electronics'
  },
//   {
//     id: 'toys',
//     label: 'Toys',
//     icon: <FiGamepad size={20} />,
//     href: '/categories/toys'
//   },
//   {
//     id: 'gaming',
//     label: 'Gaming',
//     icon: <FiGamepad size={20} />,
//     href: '/categories/gaming'
//   },
  {
    id: 'handbags',
    label: 'Handbags',
    icon: <FiShoppingBag size={20} />,
    href: '/categories/handbags'
  },
  {
    id: 'home',
    label: 'Home',
    icon: <FiHome size={20} />,
    href: '/categories/home'
  },
  {
    id: 'vintage',
    label: 'Vintage',
    icon: <FiClock size={20} />,
    href: '/categories/vintage'
  },
  {
    id: 'beauty',
    label: 'Beauty',
    icon: <FiHeart size={20} />,
    href: '/categories/beauty'
  },
  {
    id: 'kids',
    label: 'Kids',
    icon: <FiUser size={18} />,
    href: '/categories/kids'
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: <FiEye size={20} />,
    href: '/categories/sports'
  },
  {
    id: 'handmade',
    label: 'Handmade',
    icon: <FiDroplet size={20} />,
    href: '/categories/handmade'
  },
  {
    id: 'office',
    label: 'Office',
    icon: <FiBriefcase size={20} />,
    href: '/categories/office'
  },
  {
    id: 'pet',
    label: 'Pet',
    icon: <FiStar size={20} />,
    href: '/categories/pet'
  },
  {
    id: 'outdoor',
    label: 'Outdoor',
    icon: <FiRefreshCw size={20} />,
    href: '/categories/outdoor'
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: <FiTool size={20} />,
    href: '/categories/tools'
  },
  {
    id: 'books',
    label: 'Books',
    icon: <FiBook size={20} />,
    href: '/categories/books'
  },
  {
    id: 'more',
    label: 'View all',
    icon: <FiMoreHorizontal size={20} />,
    href: '/categories'
  }
];

const CategoryBar: React.FC = () => {
  return (
    <div className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          {/* Desktop Categories */}
          <div className="hidden lg:flex items-center justify-between space-x-6">
            {categories.map((category) => (
              <a
                key={category.id}
                href={category.href}
                className="flex flex-col items-center justify-center min-w-0 group"
              >
                <div className="flex items-center justify-center w-8 h-8 text-gray-600 group-hover:text-primary transition-colors duration-200">
                  {category.icon}
                </div>
                <span className="mt-1 text-xs font-medium text-gray-700 group-hover:text-primary transition-colors duration-200 text-center">
                  {category.label}
                </span>
              </a>
            ))}
          </div>

          {/* Mobile/Tablet Horizontal Scroll */}
          <div className="lg:hidden">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2 px-1 -mx-1 scroll-smooth snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={category.href}
                  className="flex flex-col items-center justify-center min-w-0 flex-shrink-0 group px-3 py-2 snap-start"
                >
                  <div className="flex items-center justify-center w-12 h-12 text-gray-600 group-hover:text-primary group-active:text-primary transition-colors duration-200 bg-white rounded-xl shadow-sm group-hover:shadow-md">
                    {category.icon}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-primary group-active:text-primary transition-colors duration-200 text-center whitespace-nowrap max-w-16">
                    {category.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        @media (max-width: 1024px) {
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryBar;