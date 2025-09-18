'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Heart, ShoppingCart, Star, Truck, Shield, Award } from 'lucide-react';
import ChatbotButton from '@/components/ChatbotButton';

// Sample product data - in real app this would come from API/DB
const productData = {
  '1': {
    id: '1',
    name: 'LG QNED TV (벽걸이형)',
    model: '86QNED70THA',
    size: '217cm (86인치)',
    category: 'QNED',
    originalPrice: 2890000,
    discountPrice: 2720000,
    discountRate: 30,
    monthlySubscription: 113333,
    image: 'https://ext.same-assets.com/2158291103/809746982.jpeg',
    images: [
      'https://ext.same-assets.com/2158291103/809746982.jpeg',
      'https://ext.same-assets.com/2158291103/809746982.jpeg',
      'https://ext.same-assets.com/2158291103/809746982.jpeg'
    ],
    features: [
      '퀀텀닷과 나노셀 기술의 만남',
      '생생한 컬러와 선명한 화질',
      'α7 AI 프로세서 4K Gen6',
      '돌비 비전 & 돌비 애트모스'
    ],
    specs: {
      '화면크기': '86인치 (217cm)',
      '해상도': '4K UHD (3840 x 2160)',
      '화면비율': '16:9',
      '패널타입': 'QNED',
      '프로세서': 'α7 AI 프로세서 4K Gen6',
      'HDR': 'HDR10 Pro, HLG, 돌비 비전',
      '사운드': '2.0ch 20W',
      '스마트TV': 'webOS 23'
    }
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const product = productData[productId] || productData['1']; // Default to product 1 if not found
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handlePurchase = () => {
    console.log('Purchase:', { productId, quantity, type: 'purchase' });
  };

  const handleSubscription = () => {
    console.log('Subscribe:', { productId, quantity, type: 'subscription' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-[1440px] mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">홈</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/" className="hover:text-gray-900">TV/라이프스타일 스크린</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg p-8 flex items-center justify-center">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg p-2 border-2 transition-colors ${
                    selectedImage === index ? 'border-red-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600">{product.model} | {product.size}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8/5.0) 리뷰 234개</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-3">
                {product.discountRate > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-red-600">{product.discountRate}%</span>
                    <span className="text-lg text-gray-400 line-through">
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  </div>
                )}
                <div className="text-3xl font-bold">
                  {product.discountPrice.toLocaleString()}원
                </div>
                {product.monthlySubscription && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-1">구독 시 월</p>
                    <p className="text-xl font-semibold text-blue-600">
                      {product.monthlySubscription.toLocaleString()}원
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <Truck className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">무료배송</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">2년 무상보증</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Award className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">베스트셀러</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-medium">수량</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handlePurchase}
                  className="flex-1 py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  구매하기
                </button>
                <button
                  onClick={handleSubscription}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  구독하기
                </button>
              </div>
              
              {/* Chatbot Button */}
              <div className="flex justify-center">
                <ChatbotButton 
                  productId={productId} 
                  buttonText="할래말래? 구매 vs 구독 결정 도우미"
                  className="w-full justify-center"
                />
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  장바구니
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  찜하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specs */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">제품 사양</h2>
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {Object.entries(product.specs).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-gray-700 w-1/4">{key}</td>
                    <td className="px-6 py-4 text-gray-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}