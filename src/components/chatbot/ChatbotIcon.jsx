// src/components/chatbot/ChatbotIcon.jsx
import React from 'react';
import styles from './ChatbotIcon.module.css';
import chatIcon from '../../assets/dog.jpg'; // 챗봇 아이콘 이미지 경로

const ChatbotIcon = ({ onClick }) => {
  return (
    <div className={styles.chatbotIconWrapper} onClick={onClick}>
      <img src={chatIcon} alt="Chatbot" className={styles.chatbotIcon} />
    </div>
  );
};

export default ChatbotIcon;
