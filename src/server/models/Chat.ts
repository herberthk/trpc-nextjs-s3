import mongoose from "mongoose";

// An interface that describes the properties
// that are required to create a new Chat
interface ChatAttrs {
  message: string;
  imageKey?: string;
  pd: Date;
}

// An interface that describes the properties
// that a Chat Document has
interface ChatDoc extends mongoose.Document {
  message: string;
  imageKey?: string;
  pd: Date;
}

// An interface that describes the properties
// that a Chat Model has
interface ChatModel extends mongoose.Model<ChatDoc> {
  build(attrs: ChatAttrs): ChatDoc;
}

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },

  imageKey: {
    type: String,
  },
  pd: {
    type: Date,
    required: true,
  },
});

chatSchema.statics.build = (attrs: ChatAttrs) => {
  return new Chat(attrs);
};

const Chat = mongoose.model<ChatDoc, ChatModel>("Chats", chatSchema);
export default Chat;
