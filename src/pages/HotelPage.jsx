// src/pages/HotelPage.jsx

// --- 파일 역할: '펫 호텔' 목록을 보여주는 페이지 ---
// 이 컴포넌트는 사용자가 펫 호텔을 검색하고 필터링할 수 있는 기능을 제공합니다.
// 지도 위에 호텔 위치를 표시하고, 필터링된 결과를 카드 형태로 보여줍니다.
// 주요 기능으로는 위치 기반 검색, 날짜 선택, 가격 범위, 제공 서비스,
// 동반 가능 동물 종류에 따른 필터링 및 페이지네이션이 있습니다.

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import MapView from '../components/common/MapView'; // 공통 지도 뷰 컴포넌트
import BusinessCardGrid from '../components/common/BusinessCardGrid'; // 업체 카드 그리드 컴포넌트
import FilterSection from '../components/common/FilterSection'; // 필터 섹션 컴포넌트
import styles from './HotelPage.module.css'; // 호텔 페이지 전용 스타일
import mapStyles from './MapPage.module.css'; // 지도와 필터 레이아웃 공통 스타일
import Pagination from '../components/common/Pagination'; // 페이지네이션 컴포넌트
import hotelData from '../data/hotel.json'; // 호텔 목 데이터

// --- HotelPage Component ---
const HotelPage = () => {
  // --- STATE & HOOKS (상태 및 훅) ---
  const [userLocation, setUserLocation] = useState(null); // 사용자의 현재 위치
  const [searchTerm, setSearchTerm] = useState(''); // 사용자가 입력하는 검색어
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // 디바운싱이 적용된 검색어
  const [filters, setFilters] = useState({ // 필터링 조건 상태
    startDate: '', // 체크인 날짜
    endDate: '', // 체크아웃 날짜
    priceRange: { min: 0, max: 1000000 }, // 가격 범위
    hotelServices: [], // 선택된 편의시설
    targetAnimals: [] // 선택된 동반 가능 동물
  });

  const [hotels, setHotels] = useState([]); // 필터링된 전체 호텔 목록
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [error, setError] = useState(null); // 오류 메시지 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 모바일 뷰 여부
  const itemsPerPage = 6; // 페이지 당 보여줄 호텔 수

  // --- EFFECTS (데이터 로딩 및 필터링) ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 필터 상태가 변경될 때마다 호텔 데이터를 다시 필터링합니다.
  useEffect(() => {
    setLoading(true);
    // 실제 API 호출을 시뮬레이션하기 위해 setTimeout 사용
    setTimeout(() => {
      let result = hotelData;

      // 위치(검색어) 필터링
      if (debouncedSearchTerm) {
        result = result.filter(hotel => 
            hotel.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            hotel.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      }
      // 가격 범위 필터링
      result = result.filter(hotel => (hotel.pricePerNight ?? 0) >= filters.priceRange.min && (hotel.pricePerNight ?? 0) <= filters.priceRange.max);
      // 편의시설 필터링 (선택된 모든 서비스를 포함해야 함)
      if (filters.hotelServices.length > 0) {
          result = result.filter(hotel => filters.hotelServices.every(service => (hotel.petAmenities || []).includes(service)));
      }
      // 동반 가능 동물 필터링 (선택된 모든 동물을 포함해야 함)
      if (filters.targetAnimals.length > 0) {
          result = result.filter(hotel => filters.targetAnimals.every(animal => (hotel.targetAnimals || []).includes(animal)));
      }

      setHotels(result); // 필터링된 결과로 호텔 목록 업데이트
      setLoading(false);
    }, 500); // 0.5초 지연
  }, [debouncedSearchTerm, filters]);

  // 컴포넌트 마운트 시 사용자의 현재 위치를 가져옵니다.
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        // 위치 정보 가져오기 실패 시 오류 처리 및 기본 위치(서울) 설정
        setError(new Error('위치 정보를 가져올 수 없습니다. 기본 위치로 지도를 표시합니다.'));
        setUserLocation({ lat: 37.5665, lng: 126.9780 }); // Default to Seoul
      }
    );
  }, []);

  // --- MEMOIZED VALUES (메모이제이션) ---

  // 호텔 목록이 변경될 때만 지도에 표시할 마커 데이터를 다시 계산합니다. (성능 최적화)
  const markers = useMemo(() => hotels.map(hotel => ({
    id: hotel.id,
    lat: hotel.lat,
    lng: hotel.lng,
    name: hotel.name,
  })), [hotels]);

  // --- EVENT HANDLERS (이벤트 처리 함수) ---

  // 필터 값이 변경될 때 호출되는 함수
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
  };

  const handleToggleFilter = (filterType, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
    setCurrentPage(1);
  };

  // --- PAGINATION LOGIC (페이지네이션) ---
  const totalPages = Math.ceil(hotels.length / itemsPerPage);
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  // 현재 페이지에 보여줄 호텔 목록만 잘라냅니다.
  const currentHotels = hotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- RENDER (렌더링) ---

  // 오류 발생 시 오류 메시지 표시
  if (error) {
    return <div className={styles.pageContainer}><div className={styles.statusContainer} style={{ color: 'red' }}>오류: {error.message || '데이터를 불러오는 중 오류가 발생했습니다.'}</div></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        // 로딩 중일 때 표시할 UI
        <div className={styles.statusContainer}>호텔 정보를 불러오는 중...</div>
      ) : (
        // 로딩 완료 후 표시할 UI
        <>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>펫 호텔</h1>
            <p className={styles.pageSubtitle}>반려동물과 편안하게 머무를 수 있는 호텔을 찾아보세요</p>
          </header>
          
          {/* 지도 및 필터 섹션 */}
          <div className={mapStyles.mapWrapper}>
            <div className={mapStyles.filterPanel}>
                <FilterSection
                    locationPlaceholder="호텔명이나 지역을 검색해보세요"
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    isMobile={isMobile}
                >
                    <div className={`${mapStyles.filterGroup} ${styles.filterRow}`}>
                        <div className={`${mapStyles.filterInputWrapper} ${mapStyles.dateInputWrapper}`}>
                            <span className={mapStyles.dateIcon}></span>
                            <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className={mapStyles.filterInput} />
                        </div>
                        <div className={`${mapStyles.filterInputWrapper} ${mapStyles.dateInputWrapper}`}>
                            <span className={mapStyles.dateIcon}></span>
                            <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className={mapStyles.filterInput} />
                        </div>
                    </div>
                    <div className={mapStyles.filterGroup}>
                        <label className={mapStyles.filterLabel}>가격 범위 (1박)</label>
                        <div className={styles.priceRangeWrapper}>
                            <span>{filters.priceRange.min.toLocaleString()}원</span>
                            <input 
                                type="range"
                                min="0"
                                max="500000"
                                step="10000"
                                value={filters.priceRange.max}
                                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: parseInt(e.target.value) })}
                                className={styles.priceRangeSlider}
                            />
                            <span>{filters.priceRange.max.toLocaleString()}원</span>
                        </div>
                    </div>
                    <div className={mapStyles.filterGroup}>
                        <label className={mapStyles.filterLabel}>편의시설</label>
                        <div className={mapStyles.checkboxContainer}>
                            {['수영장', '운동장', '개별난방', '애견드라이기', '목욕시설'].map(service => (
                                <label key={service} className={mapStyles.checkboxLabel}>
                                    <input type="checkbox" value={service} 
                                        checked={filters.hotelServices.includes(service)}
                                        onChange={() => handleToggleFilter('hotelServices', service)}
                                        className={mapStyles.checkboxInput} 
                                    />
                                    {service}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className={mapStyles.filterGroup}>
                        <label className={mapStyles.filterLabel}>동반 가능 동물</label>
                        <div className={mapStyles.checkboxContainer}>
                            {['대형견', '중형견', '소형견', '고양이'].map(animal => (
                                <label key={animal} className={mapStyles.checkboxLabel}>
                                    <input type="checkbox" value={animal} 
                                        checked={filters.targetAnimals.includes(animal)}
                                        onChange={() => handleToggleFilter('targetAnimals', animal)}
                                        className={mapStyles.checkboxInput} 
                                    />
                                    {animal}
                                </label>
                            ))}
                        </div>
                    </div>
                </FilterSection>
            </div>
            <div className={mapStyles.mapContainer}>
                <MapView userLocation={userLocation} markers={markers} />
            </div>
          </div>

          {/* 호텔 카드 그리드 */}
          <div className={styles.hotelGrid}>
            <BusinessCardGrid items={currentHotels.map(h => {
              // BusinessCardGrid에 맞는 데이터 형태로 변환
              const nameParts = h.name.split(' ');
              const location = nameParts.pop();
              const nameOnly = nameParts.join(' ');
              return { ...h, type: 'hotel', name: nameOnly, location: location, images: h.imageUrl ? [h.imageUrl] : [] };
            })} />
          </div>

          {/* 페이지네이션 */}
          {hotels.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HotelPage;
