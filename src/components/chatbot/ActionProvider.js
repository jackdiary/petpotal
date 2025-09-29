// src/components/chatbot/ActionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  greet() {
    const greetingMessage = this.createChatBotMessage("안녕하세요! 반갑습니다.");
    this.updateChatbotState(greetingMessage);
  }

  handleGrooming = () => {
    const message = this.createChatBotMessage(
      "펫 미용에 대해 궁금하시군요! 미용 페이지에서 다양한 미용실 정보를 확인하실 수 있습니다.",
      {
        widget: 'groomingLink',
      }
    );
    this.updateChatbotState(message);
  };

  handleCafe = () => {
    const message = this.createChatBotMessage(
      "펫 카페에 대해 궁금하시군요! 카페 페이지에서 반려동물과 함께할 수 있는 카페 정보를 찾아보세요.",
      {
        widget: 'cafeLink',
      }
    );
    this.updateChatbotState(message);
  };

  handleHospital = () => {
    const message = this.createChatBotMessage(
      "동물병원에 대해 궁금하시군요! 병원 페이지에서 주변 동물병원을 검색하고 예약할 수 있습니다.",
      {
        widget: 'hospitalLink',
      }
    );
    this.updateChatbotState(message);
  };

  handleHotel = () => {
    const message = this.createChatBotMessage(
      "펫 호텔에 대해 궁금하시군요! 호텔 페이지에서 편안한 숙소를 찾아보세요.",
      {
        widget: 'hotelLink',
      }
    );
    this.updateChatbotState(message);
  };

  handlePetSupplies = () => {
    const message = this.createChatBotMessage(
      "반려동물 용품이 필요하시군요! 여기에서 다양한 상품을 만나보세요.",
      {
        widget: 'petSuppliesLink',
      }
    );
    this.updateChatbotState(message);
  };

  handleAccommodation = () => {
    const message = this.createChatBotMessage(
      "반려동물 동반 숙소를 찾고 계신가요? 여기에서 확인해보세요.",
      {
        widget: 'accommodationLink',
      }
    );
    this.updateChatbotState(message);
  };

  handleSickness = () => {
    const message = this.createChatBotMessage(
      "반려동물이 아프다니 걱정되시겠어요. 어떤 증상이 있나요? 예를 들어, '토했어'라고 말씀해주시면 더 자세히 도와드릴 수 있어요."
    );
    this.updateChatbotState(message);
  };

  handleVomiting = () => {
    const message = this.createChatBotMessage(
      "강아지가 토했군요. 구토의 색깔은 어떤가요? 아래에서 가장 비슷한 색을 선택해주세요.",
      {
        widget: 'vomitColorWidget',
      }
    );
    this.updateChatbotState(message);
  };

  handleVomitColor = (color) => {
    let response;
    if (color === '투명') {
      response = "투명한 구토는 위액이나 물을 토해내는 경우가 많습니다. 일시적인 현상일 수 있지만, 반복된다면 병원 방문을 추천합니다.";
    } else if (color === '하얀 거품') {
      response = "하얀 거품토는 공복 상태에서 위액이 역류하는 경우가 많습니다. 식사 시간을 조절해보세요.";
    } else if (color === '노란색') {
      response = "노란색 구토는 공복 시간이 길어져 담즙이 역류한 것일 수 있습니다. 사료 양이나 횟수를 조절해주는 것이 좋습니다.";
    } else if (color === '초록색') {
      response = "초록색 구토는 담즙이 포함되었거나, 풀을 먹었을 때 나타날 수 있습니다. 이물질 섭취 가능성을 확인하고, 지속되면 진찰이 필요합니다.";
    } else if (color === '분홍색/빨간색') {
      response = "분홍색이나 빨간색 구토는 소화기관 내 출혈을 의미할 수 있습니다. 즉시 동물병원에 내원하여 진찰을 받아야 합니다.";
    } else if (color === '갈색') {
      response = "갈색 구토는 소화된 혈액이 섞여 나오거나, 흙이나 이물질을 먹었을 가능성이 있습니다. 출혈이 의심되면 즉시 병원에 방문해야 합니다.";
    }
    const message = this.createChatBotMessage(response);
    this.updateChatbotState(message);
  };

  handleUnknown = () => {
    const message = this.createChatBotMessage(
      "제가 답변해드리기 어려운 내용입니다. 고객센터에 문의주세요."
    );
    this.updateChatbotState(message);
  }

  updateChatbotState(message) {
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;
