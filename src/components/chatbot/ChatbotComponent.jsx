// src/components/chatbot/ChatbotComponent.jsx
import React from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';

import config from './config.jsx';
import MessageParser from './MessageParser.js';
import ActionProvider from './ActionProvider.js';

const ChatbotComponent = () => {
  return (
    <div>
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
};

export default ChatbotComponent;
