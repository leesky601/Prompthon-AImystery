'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Share2,
  ShoppingCart,
  User,
  Search,
  Menu,
  Plus,
  Minus,
  Check,
  Info,
  Star,
  RefreshCw,
  Truck,
  Shield,
  Gift,
  CreditCard,
  Home,
  X
} from 'lucide-react';

// Import JSON data
import productsData from '../../../data/products.json';

export default function ProductDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState('benefits');
  const [showCareshipInfo, setShowCareshipInfo] = useState(false);
  const [showARInfo, setShowARInfo] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  
  // Mouse tracking and button animation states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isButtonMoving, setIsButtonMoving] = useState(false);

  // Get product data from JSON based on ID
  const productData = productsData.bestProducts.find(product => product.id === params.id) || productsData.bestProducts[0];
  const [salesCount] = useState(productData.salesCount); // 최근 7일간 판매대수
  
  // 이미지 갤러리 데이터
  const productImages = [
    'https://www.lge.co.kr/kr/images/tvs/md10466830/gallery/large-interior02.jpg',
    productData.image,
    'https://ext.same-assets.com/2158291103/2812149775.jpeg',
    'https://ext.same-assets.com/2158291103/1164128085.jpeg',
    'https://ext.same-assets.com/2158291103/1511966904.jpeg'
  ];

  // 제품 정보 - JSON에서 가져오기
  const productInfo = {
    name: productData.name,
    model: productData.model,
    size: productData.size || '163cm',
    originalPrice: productData.originalPrice,
    memberDiscount: productData.detailInfo.memberDiscount,
    couponDiscount: productData.detailInfo.couponDiscount,
    finalPrice: productData.detailInfo.finalPrice,
    monthlyPrice: productData.detailInfo.monthlyPrice,
    monthlyDiscountPrice: productData.detailInfo.monthlyDiscountPrice,
    cardMaxDiscount: productData.detailInfo.cardMaxDiscount,
    monthlyFinalPrice: productData.detailInfo.monthlyFinalPrice,
    badge: productData.badge,
    careship: productData.careship,
    subscription: productData.subscription
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 9) {
      setQuantity(newQuantity);
    }
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Button animation effect - moves to mouse every 10 seconds
  useEffect(() => {
    const animationInterval = setInterval(() => {
      if (!isButtonMoving) {
        setIsButtonMoving(true);
        
        // Calculate relative position from button's original location
        const buttonElement = document.querySelector('.subscribe-debate-detail-btn') as HTMLElement;
        if (buttonElement) {
          const buttonRect = buttonElement.getBoundingClientRect();
          const buttonCenterX = buttonRect.left + buttonRect.width / 2;
          const buttonCenterY = buttonRect.top + buttonRect.height / 2;
          
          // Calculate offset to mouse position with some easing
          const targetX = (mousePosition.x - buttonCenterX) * 0.8; // 80% of the distance for smoother movement
          const targetY = (mousePosition.y - buttonCenterY) * 0.8;
          
          // Move to mouse position with smooth animation
          setButtonPosition({
            x: targetX,
            y: targetY
          });

          // Return to original position after 2 seconds
          setTimeout(() => {
            setButtonPosition({ x: 0, y: 0 });
            setTimeout(() => {
              setIsButtonMoving(false);
            }, 1500); // Wait for return animation to complete
          }, 2000);
        }
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(animationInterval);
  }, [mousePosition, isButtonMoving]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b sticky top-0 z-40">
        {/* Top bar */}
        <div className="bg-black text-white text-xs">
          <div className="max-w-[1440px] mx-auto px-4 py-2 flex justify-end items-center gap-4">
            <a href="#" className="hover:underline">LG SIGNATURE</a>
            <a href="#" className="hover:underline">LG Objet Collection</a>
            <a href="#" className="hover:underline">LG ThinQ</a>
            <a href="#" className="hover:underline">LG gram</a>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex items-center justify-between h-[70px]">
            <Link href="/" className="flex items-center">
              <img 
                src="https://page.gensparksite.com/v1/base64_upload/ed0885953a88ee41c3e61962681af947" 
                alt="LG전자" 
                className="h-8"
              />
            </Link>

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
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <a href="#" className="hover:text-gray-900">제품/소모품</a>
          <ChevronRight className="w-4 h-4" />
          <a href="#" className="hover:text-gray-900">TV/라이프스타일 스크린</a>
          <ChevronRight className="w-4 h-4" />
          <Link href="/" className="hover:text-gray-900">TV</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">제품 상세</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
              <img
                src={productImages[currentImageIndex]}
                alt={`${productInfo.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {productImages.length}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => handleImageChange(Math.max(0, currentImageIndex - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleImageChange(Math.min(productImages.length - 1, currentImageIndex + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                disabled={currentImageIndex === productImages.length - 1}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-black' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Product Caption */}
            <p className="text-sm text-gray-500 italic">
              ※소비자의 이해를 돕기 위해 연출된 이미지입니다.
            </p>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Badge */}
            {productInfo.badge && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                {productInfo.badge}
              </div>
            )}

            {/* Product Title */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold mb-2">{productInfo.name}</h1>
                <p className="text-xl text-gray-600">{productInfo.size}</p>
              </div>
              <div className="lg:col-span-1 flex justify-center lg:justify-end">
                <button
                  onClick={() => alert('구독 서비스에 관심을 보여주셔서 감사합니다!')}
                  className="subscribe-debate-detail-btn"
                  style={{
                    transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
                    transition: isButtonMoving 
                      ? 'transform 1.2s cubic-bezier(0.23, 1, 0.32, 1)' 
                      : 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)',
                    zIndex: isButtonMoving ? 9999 : 'auto',
                    boxShadow: isButtonMoving 
                      ? '0 20px 40px rgba(107,58,166,0.4), 0 0 0 1px rgba(255,255,255,0.1)' 
                      : '0 8px 20px rgba(107,58,166,0.2)'
                  }}
                >
                  구독 할래말래?
                </button>
              </div>
            </div>

            {/* Sales Counter */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>최근 7일간</span>
              <span className="font-bold text-black">{salesCount.toLocaleString()}</span>
              <span>대 판매되었어요</span>
            </div>

            {/* AR Experience */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://www.lge.co.kr/lg5-common/images/KRP0008/icon_ar_logo.png" 
                    alt="AR" 
                    className="w-8 h-8"
                  />
                  <span className="font-medium">AR 체험 안내</span>
                </div>
                <button 
                  onClick={() => setShowARInfo(!showARInfo)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
              
              {showARInfo && (
                <div className="space-y-3 text-sm text-gray-600 mb-4">
                  <p>AR 체험은 앱에서 이용하실 수 있습니다.</p>
                  <p>* AR체험은 내 공간에 제품을 가상으로 배치해볼 수 있는 서비스입니다.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2 px-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">
                  <img src="/google-play-icon.png" alt="Google Play" className="w-5 h-5" />
                  <span className="text-sm">안드로이드 앱 설치하기</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 px-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">
                  <img src="/app-store-icon.png" alt="App Store" className="w-5 h-5" />
                  <span className="text-sm">아이폰 앱 설치하기</span>
                </button>
              </div>
            </div>

            {/* Options Selection */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg">옵션 선택</h3>
              <button className="w-full py-3 px-4 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <span className="text-gray-500">옵션을 선택해주세요</span>
                <ChevronDown className="float-right w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Price Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">판매가</span>
                <span className="text-lg">{productInfo.originalPrice.toLocaleString()}원</span>
              </div>
              
              <div className="flex justify-between items-center text-red-500">
                <span>회원 할인</span>
                <span className="font-medium">-{productInfo.memberDiscount.toLocaleString()}원</span>
              </div>

              <div className="flex justify-between items-center text-red-500">
                <span>쿠폰 할인</span>
                <span className="font-medium">-{productInfo.couponDiscount.toLocaleString()}원</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">최대혜택가</span>
                  <span className="text-2xl font-bold text-red-500">
                    {productInfo.finalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription Price */}
            {productInfo.subscription && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  구독 혜택가
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>이용 요금</span>
                    <span>월 {productInfo.monthlyPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>할인 이용 요금</span>
                    <span className="font-medium">월 {productInfo.monthlyDiscountPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>제휴카드 할인</span>
                    <span>월 최대 -{productInfo.cardMaxDiscount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>최대혜택가</span>
                    <span className="text-red-500">월 {productInfo.monthlyFinalPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">수량</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= 9}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">(최대 9개)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-4 px-6 bg-[#A50034] text-white rounded-lg font-medium hover:bg-[#8A002B] transition-colors">
                  바로구매
                </button>
                <button className="py-4 px-6 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  장바구니
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>찜하기</span>
                </button>
                <button className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>비교하기</span>
                </button>
                <button className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span>공유하기</span>
                </button>
              </div>
            </div>

            {/* Careship Notice */}
            {productInfo.careship && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium">선택하신 제품은 케어십이 필요한 제품입니다.</p>
                    <p className="text-sm text-gray-600">
                      케어십은 케어매니저가 주기적으로 방문하여 친절하게 관리해드리는 서비스입니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 space-y-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setSelectedTab('benefits')}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  selectedTab === 'benefits' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                구매 혜택 안내
              </button>
              <button
                onClick={() => setSelectedTab('delivery')}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  selectedTab === 'delivery' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                배송/설치 안내
              </button>
              <button
                onClick={() => setSelectedTab('points')}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  selectedTab === 'points' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                포인트 혜택
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'benefits' && (
            <div className="space-y-6">
              {/* LG Card Benefits */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4">LGE.COM 신한카드 혜택안내</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="https://www.lge.co.kr/lg5-common/images/common/header/logo-h1-new.svg" 
                    alt="LG Card" 
                    className="h-12"
                  />
                  <div>
                    <p className="font-medium">LGE.COM 플러스 서비스</p>
                    <p className="text-sm text-gray-600">
                      제품 구매 시 신청한 금액만큼 먼저 할인받고, 카드 이용 실적에 따라 12개월 뒤 할인 금액이 확정되는 서비스입니다.
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm mb-2">신청 가능 금액 : 10만 원, 20만 원, 50만 원, 100만 원 중 선택</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">결제 금액</th>
                        <th className="text-right py-2">캐시백 혜택</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">50만 원 이상 결제 시</td>
                        <td className="text-right font-medium">7% (최대 100만 원)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    결제일 할인
                  </h4>
                  <p className="text-sm text-gray-600">매월 최대 100만원 한도</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gray-600" />
                    무이자 혜택
                  </h4>
                  <p className="text-sm text-gray-600">최대 12개월 무이자 할부</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-gray-600" />
                    간편결제 이벤트
                  </h4>
                  <p className="text-sm text-gray-600">네이버페이, 카카오페이, 토스페이</p>
                </div>
              </div>

              {/* Easy Payment Events */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">간편결제 이벤트</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Naver Pay */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">N</div>
                      <span className="font-medium">네이버페이</span>
                    </div>
                    <p className="text-sm font-medium mb-1">15만원 이상 결제 시</p>
                    <p className="text-lg font-bold text-green-600">7% 포인트 적립</p>
                    <p className="text-xs text-gray-600 mt-1">(최대 10만원)</p>
                  </div>

                  {/* Kakao Pay */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">K</div>
                      <span className="font-medium">카카오페이</span>
                    </div>
                    <p className="text-sm font-medium mb-1">15만원 이상 결제 시</p>
                    <p className="text-lg font-bold text-yellow-600">7% 즉시할인</p>
                    <p className="text-xs text-gray-600 mt-1">(최대 10만원, 선착순 50명)</p>
                  </div>

                  {/* Toss Pay */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">T</div>
                      <span className="font-medium">토스페이</span>
                    </div>
                    <p className="text-sm font-medium mb-1">토스페이 결제 시</p>
                    <p className="text-lg font-bold text-blue-600">1% 포인트 적립</p>
                    <p className="text-xs text-gray-600 mt-1">(최대 2만원)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'delivery' && (
            <div className="space-y-6">
              {/* Tomorrow Delivery */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Truck className="w-6 h-6" />
                  내일배송 책임 보상제
                </h3>
                <div className="flex items-start gap-4">
                  <img 
                    src="https://www.lge.co.kr/lg5-common/images/KRP0008/img_tomorrow_delivery_pc.jpg" 
                    alt="Tomorrow Delivery" 
                    className="w-32 h-32 object-contain"
                  />
                  <div className="space-y-3">
                    <p className="font-medium">
                      LGE.COM 내일배송 서비스 제품 구매 후 다음날 배송 받지 못한 경우 고객님께 보상해드립니다!
                    </p>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-medium text-sm mb-1">보상 기준</p>
                      <p className="text-lg font-bold text-red-500">
                        배송 지체일 수 X 1만원 = LG전자 멤버십 포인트 증정
                      </p>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>내일배송 서비스는 LGE.COM에서만 제공됩니다</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>평일 16시까지 주문 시 다음날 배송</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>일요일 및 공휴일은 배송일에서 제외</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4">배송/설치 안내</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold">01</span>
                    </div>
                    <div>
                      <p className="font-medium">제품 주문</p>
                      <p className="text-sm text-gray-600">원하시는 제품을 선택하여 주문합니다</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold">02</span>
                    </div>
                    <div>
                      <p className="font-medium">배송 준비</p>
                      <p className="text-sm text-gray-600">제품 준비 및 배송 일정을 안내드립니다</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold">03</span>
                    </div>
                    <div>
                      <p className="font-medium">설치 완료</p>
                      <p className="text-sm text-gray-600">전문 설치기사가 방문하여 설치해드립니다</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'points' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4">포인트 혜택안내</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded p-4">
                    <p className="font-medium mb-2">멤버십포인트 적립</p>
                    <p className="text-sm text-gray-600">
                      멤버십포인트는 LGE.COM 회원에게만 지급되므로, 로그인 상태에서 구매하시기 바랍니다.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <p className="font-medium mb-2">포인트 사용처</p>
                    <p className="text-sm text-gray-600">
                      멤버십포인트의 사용처와 유효기간 등 각종 사항은 아래 경로에서 확인 가능합니다.
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      LGE.COM → 이벤트/멤버십 → 멤버십
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-[1440px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">제품</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">TV/라이프스타일 스크린</a></li>
                <li><a href="#" className="hover:text-white">PC/모니터</a></li>
                <li><a href="#" className="hover:text-white">주방가전</a></li>
                <li><a href="#" className="hover:text-white">생활가전</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">고객지원</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">제품 등록</a></li>
                <li><a href="#" className="hover:text-white">매뉴얼 & 소프트웨어</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">매장</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">베스트샵</a></li>
                <li><a href="#" className="hover:text-white">매장 찾기</a></li>
                <li><a href="#" className="hover:text-white">스토어 이벤트</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">기업정보</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">회사소개</a></li>
                <li><a href="#" className="hover:text-white">투자자 정보</a></li>
                <li><a href="#" className="hover:text-white">지속가능경영</a></li>
                <li><a href="#" className="hover:text-white">뉴스룸</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <p>LG전자 대표이사 : 조주완, 배두용</p>
                <p>사업자등록번호 : 107-86-14075</p>
                <p>통신판매업신고번호 : 제1997-00084호</p>
                <p className="mt-2">© 2024 LG Electronics Inc. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}