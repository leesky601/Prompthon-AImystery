'use client';

import { useState } from 'react';
import { Search, User, ShoppingCart, Menu, ChevronDown, ChevronRight, Heart, SlidersHorizontal, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Import JSON data
import productsData from '../data/products.json';

// Product data from JSON with additional products for grid
const products = [
  ...productsData.bestProducts,
  {
    id: '5',
    name: 'LG 스마트 캠',
    model: 'VC23GA',
    tags: ['무료설치'],
    originalPrice: 142000,
    discountPrice: 129000,
    discountRate: 9,
    image: 'https://ext.same-assets.com/2158291103/14921819.jpeg'
  },
  {
    id: '6',
    name: 'LG 일반 LED TV (스탠드형)',
    model: '43LM5610HA',
    size: '107cm',
    tags: ['스탠드형', '벽걸이형'],
    originalPrice: 744000,
    discountPrice: 670000,
    discountRate: 9,
    monthlyPrice: 27916,
    image: 'https://ext.same-assets.com/2158291103/531222907.jpeg'
  },
  {
    id: '7',
    name: 'LG QNED TV (벽걸이형)',
    model: '65QNED70TKA',
    size: '163cm',
    tags: ['스탠드형', '벽걸이형'],
    originalPrice: 1890000,
    discountPrice: 1290000,
    discountRate: 48,
    monthlyPrice: 53750,
    image: 'https://ext.same-assets.com/2158291103/3226367552.jpeg'
  },
  {
    id: '8',
    name: 'LG QNED TV (벽걸이형)',
    model: '75QNED70TGA',
    size: '189cm',
    tags: ['스탠드형', '벽걸이형'],
    originalPrice: 2340000,
    discountPrice: 1870000,
    discountRate: 34,
    monthlyPrice: 77916,
    image: 'https://ext.same-assets.com/2158291103/1130268752.jpeg'
  },
  {
    id: '9',
    name: 'LG 올레드 HD TV (스탠드형)',
    model: '75UTEB9BHA',
    size: '189cm',
    tags: ['스탠드형', '벽걸이형'],
    originalPrice: 2690000,
    discountPrice: 1390000,
    discountRate: 48,
    monthlyPrice: 57916,
    image: 'https://ext.same-assets.com/2158291103/3348132104.jpeg'
  },
  {
    id: '10',
    name: 'LG QNED TV (벽걸이형)',
    model: '65QNED70TTA',
    size: '163cm',
    tags: ['스탠드형', '벽걸이형'],
    originalPrice: 2340000,
    discountPrice: 1290000,
    discountRate: 48,
    monthlyPrice: 53750,
    image: 'https://ext.same-assets.com/2158291103/3559190027.jpeg'
  },
  {
    id: '11',
    name: 'LG QNED AI (벽걸이형)',
    model: '75QNED65SBA',
    size: '217cm',
    tags: ['스탠드형', '벽걸이형'],
    originalPrice: 4240000,
    discountPrice: 2850000,
    discountRate: 33,
    monthlyPrice: 118750,
    image: 'https://ext.same-assets.com/2158291103/2884644704.jpeg'
  },
  {
    id: '12',
    name: 'LG 올레드 TV (스탠드형)',
    model: 'OLED55B4ANA',
    size: '84" / 138cm',
    tags: ['스탠드형', '벽걸이형'],
    originalPrice: 2690000,
    discountPrice: 1890000,
    discountRate: 9,
    monthlyPrice: 78750,
    image: 'https://ext.same-assets.com/2158291103/1628106263.jpeg'
  }
];

export default function Home() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b sticky top-0 z-50">
        {/* Top bar */}
        <div className="bg-black text-white text-xs">
          <div className="max-w-[1440px] mx-auto px-4 py-2 flex justify-end items-center gap-4">
            <a href="#" className="hover:underline">LG SIGNATURE</a>
            <a href="#" className="hover:underline">LG Objet Collection</a>
            <a href="#" className="hover:underline">LG ThinQ</a>
            <a href="#" className="hover:underline">Let's gram</a>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="text-[#A50034] font-bold text-2xl">LG전자</div>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <div className="relative group">
                <button className="flex items-center gap-1 py-6 font-medium hover:text-[#A50034] transition-colors">
                  제품/소모품
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <a href="#" className="py-6 font-medium hover:text-[#A50034] transition-colors">고객지원</a>
              <a href="#" className="py-6 font-medium hover:text-[#A50034] transition-colors">기업 구매</a>
              <a href="#" className="py-6 font-medium hover:text-[#A50034] transition-colors">베네핏센터</a>
              <a href="#" className="py-6 font-medium hover:text-[#A50034] transition-colors">스토리</a>
              <a href="#" className="py-6 font-medium hover:text-[#A50034] transition-colors">베스트샵</a>
              <a href="#" className="py-6 font-medium text-[#A50034]">LG AI</a>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">홈</Link>
          <ChevronRight className="w-4 h-4" />
          <a href="#" className="hover:text-gray-900">제품/소모품</a>
          <ChevronRight className="w-4 h-4" />
          <a href="#" className="hover:text-gray-900">TV/라이프스타일 스크린</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">TV</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="max-w-[1440px] mx-auto px-4 pb-6">
        <h1 className="text-4xl font-bold">TV</h1>
      </div>

      {/* Category Tabs */}
      <div className="max-w-[1440px] mx-auto px-4 pb-6">
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-black text-white rounded-full font-medium">
            TV
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-100">
            스탠바이미
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-100">
            프로젝터
          </button>
        </div>
      </div>

      {/* Main Banners */}
      <div className="max-w-[1440px] mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Banner 1 - 올레드 으뜸 페스타 */}
          <div className="relative banner-gradient-blue rounded-lg overflow-hidden h-[300px] cursor-pointer group">
            <div className="absolute inset-0 group-hover:scale-[1.02] transition-transform duration-300">
              <img
                src="https://page.gensparksite.com/v1/base64_upload/b42b02f53244bc4de4f1e3998b05af1b"
                alt="올레드 으뜸 페스타"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Banner 2 - TV + 사운드바 세트 기획전 */}
          <div className="relative banner-gradient-orange rounded-lg overflow-hidden h-[300px] cursor-pointer group">
            <div className="absolute inset-0 group-hover:scale-[1.02] transition-transform duration-300">
              <img
                src="https://page.gensparksite.com/v1/base64_upload/b27ac80cc9a62999056ee9c1eec6c2ac"
                alt="TV + 사운드바 세트 기획전"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 pb-12">
        <div className="flex gap-8">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">필터</h3>

              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">브랜드</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">디플렉할인</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">인트로할인금</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">구독혜택</span>
                  </label>
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">화면크기</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">SIGNATURE</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Objet Collection</span>
                  </label>
                </div>
              </div>

              {/* Quality Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">화질명</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">올레드</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">QNED</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">나노셀</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">울트라 HD</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">일반 LED</span>
                  </label>
                </div>
              </div>

              {/* Screen Size */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">화면크기</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">190cm 이상(75인치 이상)</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort and Filter Bar */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    카테고리별 제품 비교하기 <span className="font-bold text-black">0/3</span>
                  </span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg text-sm font-medium">
                    초기화
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">총 <strong>295개</strong></span>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>추천순</option>
                    <option>인기순</option>
                    <option>낮은 가격순</option>
                    <option>높은 가격순</option>
                    <option>최신순</option>
                  </select>
                  <button
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden p-2 border border-gray-300 rounded-lg"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Best Ranking Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">베스트랭킹</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productsData.bestProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="product-card bg-white rounded-lg overflow-hidden group cursor-pointer">
                    <div className="relative">
                      {product.ranking && (
                        <div className="absolute top-2 left-2 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10">
                          {product.ranking}
                        </div>
                      )}
                      <div className="aspect-square bg-gray-100 p-4 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image w-full h-full object-contain"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Heart
                          className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.model}</p>
                      {product.size && (
                        <p className="text-xs text-gray-500 mb-2">{product.size}</p>
                      )}
                      {product.discountRate > 0 && (
                        <p className="text-xs text-red-500 font-medium mb-1">
                          {product.discountRate}% {product.originalPrice.toLocaleString()}원
                        </p>
                      )}
                      <p className="text-lg font-bold">
                        {product.discountPrice.toLocaleString()}원
                      </p>
                      {product.monthlyPrice && (
                        <p className="text-xs text-gray-500 mt-1">
                          최대혜택가 {product.monthlyPrice.toLocaleString()}원
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Regular Products Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4 text-gray-600">
                카테고리별 제품 비교하기 <span className="text-sm font-normal">0/3</span>
              </h2>
              <button className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg mb-6">
                결과보기
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="product-card bg-white rounded-lg overflow-hidden group cursor-pointer">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-100 p-4 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image w-full h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Heart
                        className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                      />
                    </button>
                    {product.tags && (
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-800 text-white text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{product.model}</p>
                    {product.size && (
                      <p className="text-sm text-gray-500 mb-3">{product.size}</p>
                    )}
                    {product.discountRate > 0 && (
                      <div className="mb-2">
                        <span className="text-red-500 font-bold text-lg">{product.discountRate}%</span>
                        <span className="text-gray-400 line-through text-sm ml-2">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                      </div>
                    )}
                    <p className="text-xl font-bold mb-1">
                      {product.discountPrice.toLocaleString()}원
                    </p>
                    {product.monthlyPrice && (
                      <p className="text-sm text-gray-500">
                        최대혜택가 {product.monthlyPrice.toLocaleString()}원
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button */}
            <div className="text-center mt-8">
              <button className="px-8 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors">
                더 많은 제품 보기
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">필터</h3>
              <button onClick={() => setShowMobileFilter(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              {/* Mobile filter content - same as desktop */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">브랜드</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">디플렉할인</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">인트로할인금</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">구독혜택</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-[1440px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">전체</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">올레드</a></li>
                <li><a href="#" className="hover:text-white">QNED</a></li>
                <li><a href="#" className="hover:text-white">나노셀</a></li>
                <li><a href="#" className="hover:text-white">울트라 HD</a></li>
                <li><a href="#" className="hover:text-white">일반 LED</a></li>
                <li><a href="#" className="hover:text-white">라이프스타일 스크린</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">제품별 구매 혜택</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">제품별 구매 혜택</a></li>
                <li><a href="#" className="hover:text-white">이벤트/혜택보기</a></li>
                <li><a href="#" className="hover:text-white">여름준비 가전세트</a></li>
                <li><a href="#" className="hover:text-white">에너지효율1등급 가전제품</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">LG전자 날짜별 등록</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">LG전자 날짜별 등록</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">특별 수비스</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">특별 매장</a></li>
                <li><a href="#" className="hover:text-white">직접 매일 매장</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <p>LG전자 대표이사 : 02-3777-1114</p>
                <p>대표 이메일 : lgelectronics@lge.com</p>
                <p>LGE.COM 콘텐츠는 통신 (기기비스포함)기능 1544-7777</p>
                <p className="mt-2">사업자정보 확인 | 개인정보처리방침</p>
              </div>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
