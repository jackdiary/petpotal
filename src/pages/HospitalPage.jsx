// src/pages/HospitalPage.jsx

// --- 파일 역할: '동물병원' 목록을 보여주는 페이지 ---
// 이 컴포넌트는 사용자가 동물병원을 검색하고 필터링할 수 있는 기능을 제공합니다.
// 지도 위에 병원 위치를 표시하고, 필터링된 결과를 카드 형태로 보여줍니다.
// 주요 기능으로는 위치 기반 검색, 진료 종류, 대상 동물에 따른 필터링 및 페이지네이션이 있습니다.

import React, { useEffect, useMemo, useState } from 'react';
import MapView from '../components/common/MapView'; // 공통 지도 뷰 컴포넌트
import BusinessCardGrid from '../components/common/BusinessCardGrid'; // 업체 카드 그리드 컴포넌트
import FilterSection from '../components/common/FilterSection'; // 필터 섹션 컴포넌트
import styles from './HospitalPage.module.css'; // 병원 페이지 전용 스타일
import mapStyles from './MapPage.module.css'; // 지도와 필터 레이아웃 공통 스타일
import Pagination from '../components/common/Pagination'; // 페이지네이션 컴포넌트
import hospitalData from '../data/hospital.json'; // 병원 목 데이터

// --- HospitalPage Component ---
const HospitalPage = () => {
  // --- STATE & HOOKS (상태 및 훅) ---
  const [userLocation, setUserLocation] = useState(null); // 사용자의 현재 위치
  const [searchTerm, setSearchTerm] = useState(''); // 사용자가 입력하는 검색어
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // 디바운싱이 적용된 검색어
  const [filters, setFilters] = useState({ // 필터링 조건 상태
    date: '',
    time: '',
    hospitalServices: [], // 선택된 진료 종류
    targetAnimals: [] // 선택된 대상 동물
  });

  const [hospitals, setHospitals] = useState([]); // 필터링된 전체 병원 목록
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [error, setError] = useState(null); // 오류 메시지 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 모바일 뷰 여부
  const itemsPerPage = 6; // 페이지 당 보여줄 병원 수

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

  // 필터 상태가 변경될 때마다 병원 데이터를 다시 필터링합니다.
  useEffect(() => {
    setLoading(true);
    // 실제 API 호출을 시뮬레이션하기 위해 setTimeout 사용
    setTimeout(() => {
      let result = hospitalData;

      // 위치(검색어) 필터링
      if (debouncedSearchTerm) {
        result = result.filter(hospital => 
            hospital.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            hospital.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      }
      // 진료 종류 필터링 (선택된 모든 서비스를 포함해야 함)
      if (filters.hospitalServices.length > 0) {
          result = result.filter(hospital => filters.hospitalServices.every(service => (hospital.specialties || []).includes(service)));
      }
      // 대상 동물 필터링 (선택된 모든 동물을 포함해야 함)
      if (filters.targetAnimals.length > 0) {
          result = result.filter(hospital => filters.targetAnimals.every(animal => (hospital.targetAnimals || []).includes(animal)));
      }

      setHospitals(result); // 필터링된 결과로 병원 목록 업데이트
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

  // 병원 목록이 변경될 때만 지도에 표시할 마커 데이터를 다시 계산합니다. (성능 최적화)
  const markers = useMemo(() => hospitals.map(hospital => ({
    id: hospital.id,
    lat: hospital.lat,
    lng: hospital.lng,
    name: hospital.name,
  })), [hospitals]);

  // --- EVENT HANDLERS (이벤트 처리 함수) ---

  // 텍스트 입력 필터 값이 변경될 때 호출되는 함수
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
  };

  // 버튼형 토글 필터 값이 변경될 때 호출되는 함수
  const handleToggleFilter = (filterType, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterType];
      // 이미 선택된 값이면 배열에서 제거, 아니면 추가
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
    setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
  };

  // --- PAGINATION LOGIC (페이지네이션) ---
  const totalPages = Math.ceil(hospitals.length / itemsPerPage);
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  // 현재 페이지에 보여줄 병원 목록만 잘라냅니다.
  const currentHospitals = hospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- RENDER (렌더링) ---

  if (error) {
    return <div className={styles.pageContainer}><div className={styles.statusContainer} style={{ color: 'red' }}>오류: {error.message || '데이터를 불러오는 중 오류가 발생했습니다.'}</div></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <div className={styles.statusContainer}>병원 정보를 불러오는 중...</div>
      ) : (
        <>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>동물병원</h1>
            <p className={styles.pageSubtitle}>우리 아이를 맡길 수 있는 믿을 만한 동물병원을 찾아보세요</p>
          </header>

          <div className={mapStyles.mapWrapper}>
            <div className={mapStyles.filterPanel}>
                <FilterSection
                    locationPlaceholder="병원이름이나 지역을 검색해보세요"
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    isMobile={isMobile}
                >
                    <div className={`${mapStyles.filterGroup} ${styles.filterRow}`}>
                        <div className={`${mapStyles.filterInputWrapper} ${mapStyles.dateInputWrapper}`}>
                            <span className={mapStyles.dateIcon}></span>
                            <input type="date" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} className={mapStyles.filterInput} />
                        </div>
                        <div className={`${mapStyles.filterInputWrapper} ${mapStyles.timeInputWrapper}`}>
                            <span className={mapStyles.timeIcon}></span>
                            <select value={filters.time} onChange={(e) => handleFilterChange('time', e.target.value)} className={mapStyles.filterInput}>
                                <option value="">시간 선택</option>
                                {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
                                })}
                            </select>
                        </div>
                    </div>
                    <div className={mapStyles.filterGroup}>
                        <label className={mapStyles.filterLabel}>진료 종류</label>
                        <div className={mapStyles.checkboxContainer}>
                            {['24시 응급', '내과', '외과', '치과', '심장 전문', 'MRI/CT'].map(type => (
                                <label key={type} className={mapStyles.checkboxLabel}>
                                    <input type="checkbox" value={type} 
                                        checked={filters.hospitalServices.includes(type)}
                                        onChange={() => handleToggleFilter('hospitalServices', type)}
                                        className={mapStyles.checkboxInput} 
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className={mapStyles.filterGroup}>
                        <label className={mapStyles.filterLabel}>대상 동물</label>
                        <div className={mapStyles.checkboxContainer}>
                            {['강아지', '고양이', '특수동물'].map(animal => (
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

          {/* 병원 카드 그리드 */}
          <div className={styles.hospitalGrid}>
            <BusinessCardGrid items={currentHospitals.map(h => ({ ...h, type: 'hospital', images: h.imageUrl ? [h.imageUrl] : [] }))} />
          </div>

          {/* 페이지네이션 */}
          {hospitals.length > 0 && totalPages > 1 && (
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

export default HospitalPage;