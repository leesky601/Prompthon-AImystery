'use client';

import React from 'react';
import { ShoppingCart, CreditCard, CheckCircle, Wrench } from 'lucide-react';

interface DetailedProductInfo {
  id: string;
  이름: string;
  설명: string;
  구매가격정보: number;
  구독가격_3년: number | null;
  구독가격_4년: number | null;
  구독가격_5년: number | null;
  구독가격_6년: number | null;
  구독장점: string[];
  케어서비스빈도: string;
  케어서비스유형: string[];
  케어서비스설명: string;
  케어서비스가격정보: string;
  image?: string;
}

interface ProductSidebarProps {
  detailedProduct: DetailedProductInfo;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({ detailedProduct }) => {
  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto min-h-0">
      <div className="p-4">
        {/* Product Image and Title */}
        <div className="flex items-start gap-3 mb-4">
          {/* Product Image - Left */}
          {detailedProduct.image && (
            <div className="flex-shrink-0">
              <img 
                src={detailedProduct.image} 
                alt={detailedProduct.이름}
                className="w-24 h-24 object-contain rounded-lg bg-gray-100"
              />
            </div>
          )}
          
          {/* Product Title - Right */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold mb-1">{detailedProduct.이름}</h3>
            <p className="text-sm text-gray-600">{detailedProduct.설명}</p>
          </div>
        </div>

        {/* Purchase vs Subscription Price Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Purchase Card */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <ShoppingCart className="w-4 h-4 mr-1 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">일시불 구매</span>
            </div>
            <p className="text-lg font-bold text-blue-700">
              {detailedProduct.구매가격정보.toLocaleString()}<span className="text-xs">원</span>
            </p>
          </div>

          {/* Subscription Card */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <CreditCard className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-sm font-semibold text-green-900">월 구독</span>
            </div>
            <div className="text-sm space-y-1">
              {detailedProduct.구독가격_3년 && (
                <div className="flex justify-between">
                  <span className="text-green-700">3년</span>
                  <span className="font-bold text-green-800">{detailedProduct.구독가격_3년.toLocaleString()}원</span>
                </div>
              )}
              {detailedProduct.구독가격_4년 && (
                <div className="flex justify-between">
                  <span className="text-green-700">4년</span>
                  <span className="font-bold text-green-800">{detailedProduct.구독가격_4년.toLocaleString()}원</span>
                </div>
              )}
              {detailedProduct.구독가격_5년 && (
                <div className="flex justify-between">
                  <span className="text-green-700">5년</span>
                  <span className="font-bold text-green-800">{detailedProduct.구독가격_5년.toLocaleString()}원</span>
                </div>
              )}
              {detailedProduct.구독가격_6년 && (
                <div className="flex justify-between">
                  <span className="text-green-700">6년</span>
                  <span className="font-bold text-green-800">{detailedProduct.구독가격_6년.toLocaleString()}원</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Benefits */}
        {detailedProduct.구독장점 && detailedProduct.구독장점.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-sm font-semibold">구독 혜택</span>
            </div>
            <ul className="space-y-2">
              {detailedProduct.구독장점.map((benefit, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Care Service Info */}
        {detailedProduct.케어서비스설명 && detailedProduct.케어서비스설명 !== "" && (
          <div className="mb-4 bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Wrench className="w-4 h-4 mr-1 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">케어 서비스</span>
            </div>
            <p className="text-sm text-purple-700 mb-2">{detailedProduct.케어서비스설명}</p>
            
            {detailedProduct.케어서비스빈도 && (
              <div className="mb-2">
                <span className="text-sm font-semibold text-purple-800">방문 주기:</span>
                <span className="text-sm text-purple-600 ml-1">{detailedProduct.케어서비스빈도}</span>
              </div>
            )}
            
            {detailedProduct.케어서비스유형 && detailedProduct.케어서비스유형.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-semibold text-purple-800">서비스 유형:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {detailedProduct.케어서비스유형.map((type, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-sm rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {detailedProduct.케어서비스가격정보 && detailedProduct.케어서비스가격정보 !== "없음" && (
              <div className="pt-2 border-t border-purple-200">
                <span className="text-sm font-semibold text-purple-800">가격 정보:</span>
                <p className="text-sm text-purple-600 mt-1">{detailedProduct.케어서비스가격정보}</p>
              </div>
            )}
          </div>
        )}

        {/* Total Cost Comparison */}
        <div className="p-3 bg-gray-100 rounded-lg">
          <h4 className="text-base font-semibold mb-3 text-gray-800">총 비용 비교 (6년 기준)</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">일시불 구매</span>
              <span className="text-base font-bold text-gray-800">
                {detailedProduct.구매가격정보.toLocaleString()}원
              </span>
            </div>
            {detailedProduct.구독가격_6년 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">6년 구독 기본 총액</span>
                  <span className="text-sm text-gray-700">
                    {(detailedProduct.구독가격_6년 * 72).toLocaleString()}원
                  </span>
                </div>
                
                {/* Calculate subscription with benefits */}
                {(() => {
                  const basicTotal = detailedProduct.구독가격_6년 * 72;
                  let finalTotal = basicTotal;
                  const appliedBenefits: string[] = [];
                  
                  // Parse benefits to calculate actual final cost
                  detailedProduct.구독장점.forEach(benefit => {
                    // Check for card discount
                    if (benefit.includes('제휴카드 할인')) {
                      const match = benefit.match(/월\s*([\d,]+)원/);
                      if (match) {
                        const monthlyDiscount = parseInt(match[1].replace(/,/g, ''));
                        finalTotal -= monthlyDiscount * 72;
                        appliedBenefits.push(`카드할인: -${(monthlyDiscount * 72).toLocaleString()}원`);
                      }
                    }
                    
                    // Check for prepayment discount
                    if (benefit.includes('선 결제') && benefit.includes('추가 할인')) {
                      const match = benefit.match(/월\s*([\d,]+)원\s*추가\s*할인/);
                      if (match) {
                        const monthlyDiscount = parseInt(match[1].replace(/,/g, ''));
                        finalTotal -= monthlyDiscount * 72;
                        appliedBenefits.push(`선결제 할인: -${(monthlyDiscount * 72).toLocaleString()}원`);
                      }
                    }
                    
                    // Check for membership points
                    if (benefit.includes('멤버십 포인트')) {
                      const match = benefit.match(/([\d,]+)P/);
                      if (match) {
                        const points = parseInt(match[1].replace(/,/g, ''));
                        finalTotal -= points;
                        appliedBenefits.push(`포인트: -${points.toLocaleString()}원`);
                      }
                    }
                    
                    // Check for first year discount
                    if (benefit.includes('첫 12개월') && benefit.includes('반값') && detailedProduct.구독가격_6년) {
                      const halfYearDiscount = detailedProduct.구독가격_6년 * 6;
                      finalTotal -= halfYearDiscount;
                      appliedBenefits.push(`첫년 반값: -${halfYearDiscount.toLocaleString()}원`);
                    }
                    
                    // Check if total cost is mentioned in benefit
                    if (benefit.includes('총 비용')) {
                      const match = benefit.match(/총\s*비용\s*([\d,]+)원/);
                      if (match) {
                        finalTotal = parseInt(match[1].replace(/,/g, ''));
                      }
                    }
                  });
                  
                  return (
                    <>
                      {appliedBenefits.length > 0 && (
                        <div className="pl-3 space-y-1 text-xs text-gray-500 italic">
                          {appliedBenefits.map((benefit, idx) => (
                            <div key={idx}>{benefit}</div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center bg-green-100 p-2 rounded">
                        <span className="text-xs font-semibold text-green-800">혜택 적용 최종가</span>
                        <span className="text-sm font-bold text-green-700">
                          {finalTotal.toLocaleString()}원
                        </span>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-700">구매 대비 차액</span>
                          <span className={`text-sm font-bold ${
                            finalTotal > detailedProduct.구매가격정보 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {Math.abs(finalTotal - detailedProduct.구매가격정보).toLocaleString()}원
                            {finalTotal > detailedProduct.구매가격정보 
                              ? ' 더 비쌈' 
                              : ' 절약'}
                          </span>
                        </div>
                        {finalTotal <= detailedProduct.구매가격정보 && (
                          <div className="mt-2 p-2 bg-green-50 rounded">
                            <p className="text-sm text-green-700 font-medium text-center">
                              ✨ 최대 할인 적용 시 구독이 더 경제적입니다!
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSidebar;
