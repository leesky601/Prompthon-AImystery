'use client';

import { useState } from 'react';
import { Search, User, ShoppingCart, Menu, ChevronDown, ChevronRight, Heart, Minus, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock product detail data
const productDetail = {
  id: '65qned70tna-stand',
  name: 'LG QNED TV (스탠드형)',
  model: '65QNED70TNA',
  size: '163cm',
  category: 'QNED',
  tags: ['스탠드형', '벽걸이형'],
  originalPrice: 2340000,
  discountPrice: 1290000,
  discountRate: 48,
  monthlyPrice: 53750,
  rating: 4.5,
  reviewCount: 1247,
  images: [
    'https://ext.same-assets.com/2158291103/3226367552.jpeg',
    'https://ext.same-assets.com/2158291103/809746982.jpeg',
    'https://ext.same-assets.com/2158291103/2812149775.jpeg'
  ],
  features: [
    '4K UHD 해상도',
    'QNED Mini LED 디스플레이',
    'α7 Gen5 AI 프로세서 4K',
    'webOS 23 스마트 TV',
    'Magic Remote 포함',
    'Dolby Vision IQ / Dolby Atmos'
  ],
  specs: {
    '화면 크기': '163cm (65")',
    '해상도': '3840 x 2160 (4K UHD)',
    '디스플레이 타입': 'QNED Mini LED',
    '프로세서': 'α7 Gen5 AI Processor 4K',
    '운영체제': 'webOS 23',
    '오디오': '20W (우퍼 포함)',
    '입력단자': 'HDMI 4개, USB 3개',
    '네트워크': 'Wi-Fi, 블루투스, 이더넷',
    '스탠드 포함 크기': '1449 x 897 x 350mm',
    '무게': '28.8kg'
  },
  benefits: [
    '무료배송',
    '무료설치',
    '5년 품질보증',
    'LG Care+ 가입 가능'
  ]
};

export default function ProductDetail() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as category page */}
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
          <Link href="/category/tvs" className="hover:text-gray-900">TV</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{productDetail.name}</span>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="max-w-[1440px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] bg-white rounded-lg overflow-hidden border">
              <img
                src={productDetail.images[selectedImage]}
                alt={productDetail.name}
                className="w-full h-full object-contain p-8"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2">
              {productDetail.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square w-20 bg-white rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-[#A50034]' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productDetail.name} ${index + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {productDetail.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold mb-2">{productDetail.name}</h1>
              <p className="text-gray-600 text-lg mb-3">{productDetail.model}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(productDetail.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {productDetail.rating} ({productDetail.reviewCount.toLocaleString()}개 리뷰)
                  </span>
                </div>
              </div>
            </div>

            {/* Price Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-red-500">{productDetail.discountRate}%</span>
                  <span className="text-gray-400 line-through text-lg">
                    {productDetail.originalPrice.toLocaleString()}원
                  </span>
                </div>
                <div className="text-4xl font-bold text-black">
                  {productDetail.discountPrice.toLocaleString()}원
                </div>
                <div className="text-sm text-gray-600">
                  최대혜택가 {productDetail.monthlyPrice.toLocaleString()}원/월
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-lg font-bold mb-3">주요 특징</h3>
              <div className="grid grid-cols-2 gap-2">
                {productDetail.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#A50034] rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Options */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium">수량:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex-shrink-0 p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Heart
                      className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                  <button className="flex-1 py-3 px-6 border border-[#A50034] text-[#A50034] rounded-lg font-medium hover:bg-[#A50034] hover:text-white transition-colors">
                    장바구니
                  </button>
                </div>
                <button className="w-full py-4 px-6 bg-[#A50034] text-white rounded-lg font-bold text-lg hover:bg-[#8B002A] transition-colors">
                  바로구매
                </button>
              </div>

              {/* Benefits */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">구매 혜택</h4>
                <div className="space-y-1">
                  {productDetail.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">제품 사양</h2>
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {Object.entries(productDetail.specs).map(([key, value], index) => (
                <div
                  key={key}
                  className={`p-4 border-b border-r ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium text-gray-700">{key}</div>
                    <div className="text-gray-900">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Features Detail */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">제품 특징</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-[#A50034] rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>
              <h3 className="font-bold mb-2">4K UHD 화질</h3>
              <p className="text-sm text-gray-600">
                선명하고 생생한 4K UHD 해상도로 모든 콘텐츠를 최고 화질로 감상하세요.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-[#A50034] rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>
              <h3 className="font-bold mb-2">QNED Mini LED</h3>
              <p className="text-sm text-gray-600">
                미니 LED 백라이트와 퀀텀닷 기술로 정확한 색상과 명암비를 구현합니다.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-[#A50034] rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>
              <h3 className="font-bold mb-2">AI 프로세서</h3>
              <p className="text-sm text-gray-600">
                α7 Gen5 AI 프로세서가 콘텐츠를 분석하여 최적의 화질과 음질을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
