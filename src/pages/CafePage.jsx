// src/pages/CafePage.jsx

// --- 파일 역할: '펫 카페' 목록을 보여주는 페이지 ---
// 이 컴포넌트는 사용자가 펫 카페를 검색하고 필터링할 수 있는 기능을 제공합니다.
// 지도 위에 카페 위치를 표시하고, 필터링된 결과를 카드 형태로 보여줍니다.
// 주요 기능으로는 위치 기반 검색, 운영 시간, 제공 서비스, 예약 필요 여부에 따른 필터링 및 페이지네이션이 있습니다.

import React, { useEffect, useMemo, useState } from 'react';
import MapView from '../components/common/MapView'; // 공통 지도 뷰 컴포넌트
import { Link } from 'react-router-dom';
import FilterSection from '../components/common/FilterSection'; // 필터 섹션 컴포넌트
import Pagination from '../components/common/Pagination'; // 페이지네이션 컴포넌트
import BusinessCardGrid from '../components/common/BusinessCardGrid'; // 업체 카드 그리드 컴포넌트
import styles from './CafePage.module.css'; // 카페 페이지 전용 스타일
import mapStyles from './MapPage.module.css'; // 지도와 필터 레이아웃 공통 스타일
import { useUI } from '../contexts/UIContext'; // 전역 UI 상태 컨텍스트
import cafeData from '../data/cafe.json'; // 카페 목 데이터

// --- CafePage Component ---
const CafePage = () => {
  // --- STATE & HOOKS (상태 및 훅) ---
  const { setIsLoading } = useUI(); // 전역 로딩 상태 설정 함수
  const [userLocation, setUserLocation] = useState(null); // 사용자의 현재 위치
  const [searchTerm, setSearchTerm] = useState(''); // 사용자가 입력하는 검색어
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // 디바운싱이 적용된 검색어
  const [filters, setFilters] = useState({ // 필터링 조건 상태
    startTime: '', // 운영 시작 시간
    endTime: '', // 운영 종료 시간
    services: [], // 선택된 서비스
    requiresReservation: [] // 예약 필요 여부 (['예약 불필요'], ['예약 필수'])
  });

  const [filteredCafes, setFilteredCafes] = useState([]); // 필터링된 전체 카페 목록
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [error, setError] = useState(null); // 오류 메시지 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 모바일 뷰 여부
  const itemsPerPage = 6; // 페이지 당 보여줄 카페 수

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

  // 필터 상태가 변경될 때마다 카페 데이터를 다시 필터링합니다.
  useEffect(() => {
    setLoading(true);
    setIsLoading(true);
    // 실제 API 호출을 시뮬레이션하기 위해 setTimeout 사용
    setTimeout(() => {
      let result = cafeData;

      // 위치(검색어) 필터링
      if (debouncedSearchTerm) {
        result = result.filter(cafe =>
          cafe.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          cafe.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      }
      // 서비스 필터링 (선택된 모든 서비스를 포함해야 함)
      if (filters.services.length > 0) {
        result = result.filter(cafe => filters.services.every(service => (cafe.services || []).includes(service)));
      }
      // 예약 필요 여부 필터링
      if (filters.requiresReservation.length > 0) {
        result = result.filter(cafe => {
          if (filters.requiresReservation.includes('예약 불필요') && cafe.requiresReservation === false) return true;
          if (filters.requiresReservation.includes('예약 필수') && cafe.requiresReservation === true) return true;
          return false;
        });
      }

      setFilteredCafes(result); // 필터링된 결과로 카페 목록 업데이트
      setLoading(false);
      setIsLoading(false);
    }, 500); // 0.5초 지연
  }, [debouncedSearchTerm, filters, setIsLoading]);

  // 컴포넌트 마운트 시 사용자의 현재 위치를 가져옵니다.
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        setError(new Error('위치 정보를 가져올 수 없습니다. 기본 위치로 지도를 표시합니다.'));
        setUserLocation({ lat: 37.5665, lng: 126.9780 }); // Default to Seoul
      }
    );
  }, []);

  // --- PAGINATION & MEMOIZED VALUES (페이지네이션 및 메모이제이션) ---
  const totalPages = Math.ceil(filteredCafes.length / itemsPerPage);
  const currentCafes = filteredCafes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 필터링된 카페 목록이 변경될 때만 지도 마커를 다시 계산합니다. (성능 최적화)
  const markers = useMemo(() => filteredCafes.map(cafe => ({
    id: cafe.id,
    lat: cafe.lat,
    lng: cafe.lng,
    name: cafe.name,
  })), [filteredCafes]);

  // --- EVENT HANDLERS (이벤트 처리 함수) ---
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

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // --- RENDER (렌더링) ---
  if (error) {
    return <div className={styles.pageContainer}><div className={styles.statusContainer} style={{ color: 'red' }}>오류: {error.message || '데이터를 불러오는 중 오류가 발생했습니다.'}</div></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <div className={styles.statusContainer}>카페 정보를 불러오는 중...</div>
      ) : (
        <>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>펫 카페</h1>
            <p className={styles.pageSubtitle}>반려동물과 함께 즐기는 특별한 카페 경험</p>
          </header>
          <div className={mapStyles.mapWrapper}>
            <div className={mapStyles.filterPanel}>
              <FilterSection
                locationPlaceholder="카페명이나 지역을 검색해보세요"
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                isMobile={isMobile}
              >
                <div className={`${mapStyles.filterGroup} ${styles.filterRow}`}>
                  <div className={`${mapStyles.filterInputWrapper} ${mapStyles.timeInputWrapper}`}>
                    <span className={mapStyles.timeIcon}></span>
                    <select value={filters.startTime} onChange={(e) => handleFilterChange('startTime', e.target.value)} className={mapStyles.filterInput}>
                      <option value="">시작 시간</option>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
                      })}
                    </select>
                    <span>~</span>
                    <select value={filters.endTime} onChange={(e) => handleFilterChange('endTime', e.target.value)} className={mapStyles.filterInput}>
                      <option value="">종료 시간</option>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className={mapStyles.filterGroup}>
                  <label className={mapStyles.filterLabel}>서비스</label>
                  <div className={mapStyles.checkboxContainer}>
                    {['애견음료', '대형견 가능', '야외 테라스', '고양이 전용 공간', '실내놀이터', '포토존', '굿즈', '보드게임', '수제 간식'].map(service => (
                      <label key={service} className={mapStyles.checkboxLabel}>
                        <input type="checkbox" value={service}
                          checked={filters.services.includes(service)}
                          onChange={() => handleToggleFilter('services', service)}
                          className={mapStyles.checkboxInput}
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={mapStyles.filterGroup}>
                  <label className={mapStyles.filterLabel}>예약</label>
                  <div className={mapStyles.checkboxContainer}>
                    {['예약 불필요', '예약 필수'].map(option => (
                      <label key={option} className={mapStyles.checkboxLabel}>
                        <input type="checkbox" value={option}
                          checked={filters.requiresReservation.includes(option)}
                          onChange={() => handleToggleFilter('requiresReservation', option)}
                          className={mapStyles.checkboxInput}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </FilterSection>
            </div>
            <div className={mapStyles.mapContainer}>
              <MapView 
                userLocation={userLocation} 
                markers={markers}
              />
            </div>
          </div>

          <div className={styles.cafeGrid}>
            <BusinessCardGrid items={currentCafes.map(c => ({ ...c, type: 'cafe' }))} />
          </div>

          {filteredCafes.length > 0 && totalPages > 1 && (
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

export default CafePage;