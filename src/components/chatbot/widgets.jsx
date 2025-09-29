// src/components/chatbot/widgets.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const GroomingLink = () => (
  <Link to="/grooming">미용 페이지로 이동</Link>
);

export const CafeLink = () => (
  <Link to="/cafe">카페 페이지로 이동</Link>
);

export const HospitalLink = () => (
  <Link to="/hospital">병원 페이지로 이동</Link>
);

export const HotelLink = () => (
  <Link to="/hotel">호텔 페이지로 이동</Link>
);

export const PetSuppliesLink = () => (
  <Link to="/product">반려동물 용품 페이지로 이동</Link>
);

export const AccommodationLink = () => (
  <Link to="/pet-friendly-lodging">반려동물 동반 숙소 페이지로 이동</Link>
);

export const VomitColorWidget = (props) => {
  const colors = ['투명', '하얀 거품', '노란색', '초록색', '분홍색/빨간색', '갈색'];

  const handleColorClick = (color) => {
    props.actionProvider.handleVomitColor(color);
  };

  return (
    <div>
      {colors.map((color, index) => (
        <button key={index} onClick={() => handleColorClick(color)}>
          {color}
        </button>
      ))}
    </div>
  );
};
