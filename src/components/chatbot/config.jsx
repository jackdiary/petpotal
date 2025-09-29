import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import { GroomingLink, CafeLink, HospitalLink, HotelLink, PetSuppliesLink, AccommodationLink, VomitColorWidget } from './widgets.jsx';

const botName = 'PetpotalBot';

const config = {
  botName: botName,
  initialMessages: [createChatBotMessage(`안녕하세요! ${botName}입니다. 무엇을 도와드릴까요?`)],
  widgets: [
    {
      widgetName: 'groomingLink',
      widgetFunc: (props) => <GroomingLink {...props} />,
    },
    {
      widgetName: 'cafeLink',
      widgetFunc: (props) => <CafeLink {...props} />,
    },
    {
      widgetName: 'hospitalLink',
      widgetFunc: (props) => <HospitalLink {...props} />,
    },
    {
      widgetName: 'hotelLink',
      widgetFunc: (props) => <HotelLink {...props} />,
    },
    {
      widgetName: 'petSuppliesLink',
      widgetFunc: (props) => <PetSuppliesLink {...props} />,
    },
    {
      widgetName: 'accommodationLink',
      widgetFunc: (props) => <AccommodationLink {...props} />,
    },
    {
      widgetName: 'vomitColorWidget',
      widgetFunc: (props) => <VomitColorWidget {...props} />,
    },
  ],
};

export default config;
