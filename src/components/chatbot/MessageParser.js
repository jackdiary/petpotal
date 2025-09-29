// src/components/chatbot/MessageParser.js
class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("안녕")) {
      this.actionProvider.greet();
    } else if (lowerCaseMessage.includes("미용")) {
      this.actionProvider.handleGrooming();
    } else if (lowerCaseMessage.includes("카페")) {
      this.actionProvider.handleCafe();
    } else if (lowerCaseMessage.includes("병원")) {
      this.actionProvider.handleHospital();
    } else if (lowerCaseMessage.includes("호텔")) {
      this.actionProvider.handleHotel();
    } else if (lowerCaseMessage.includes("용품")) {
      this.actionProvider.handlePetSupplies();
    } else if (lowerCaseMessage.includes("숙소")) {
      this.actionProvider.handleAccommodation();
    } else if (lowerCaseMessage.includes("아플때") || lowerCaseMessage.includes("아파요")) {
      this.actionProvider.handleSickness();
    } else if (lowerCaseMessage.includes("토했") || lowerCaseMessage.includes("구토")) {
      this.actionProvider.handleVomiting();
    } else {
      this.actionProvider.handleUnknown();
    }
  }
}

export default MessageParser;
