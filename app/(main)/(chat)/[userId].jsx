import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserData } from '../../../services/userService';
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
} from '../../../services/messageService';
import moment from 'moment';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from '../../../components/Header';
import Avatar from '../../../components/Avatar';
import Icon from '../../../assets/icons'
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router'

const ChatScreen = () => {
  const { user } = useAuth();
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupedMessages, setGroupedMessages] = useState([]);

  useEffect(() => {
    const loadUserAndMessages = async () => {
      const userRes = await getUserData(userId);
      if (userRes.success) setChatUser(userRes.data);

      const msgRes = await getMessages(user.id, userId);
      if (!msgRes.error) setMessages(msgRes.data);
    };

    loadUserAndMessages();

    const subscription = subscribeToMessages(user.id, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => subscription.unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0 && chatUser) {
      markMessagesAsRead(chatUser.id, user.id);
    }
  }, [messages]);

  // Group messages by day (YYYY-MM-DD)
  useEffect(() => {
    const grouped = messages.reduce((acc, msg) => {
      const day = moment(msg.created_at).format('YYYY-MM-DD');
      if (!acc[day]) acc[day] = [];
      acc[day].push(msg);
      return acc;
    }, {});

    const days = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const dayGroups = days.map((day) => ({
      day,
      messages: grouped[day].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      ),
    }));

    setGroupedMessages(dayGroups);
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const res = await sendMessage(user.id, userId, newMessage);
    if (!res.error) {
      setMessages((prev) => [...prev, res.data[0]]);
      setNewMessage('');
    } else {
      alert('Send failed: ' + res.error.message);
    }
  };

  const handleChatProfile = () => {
    router.push({pathname:'chatProfile',params:{...chatUser, userId: chatUser.id}});
  };

  const renderMessage = (msg) => {
    const isMe = String(msg.senderid) === String(user.id);

    const avatarUri = isMe ? user.image : chatUser?.image || null;

    return (
      <View
        key={msg.id}
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        {!isMe && <Avatar uri={avatarUri} style={styles.avatarMargin} />}
        <View
          style={[
            styles.messageWrapper,
            isMe ? styles.myMsg : styles.theirMsg,
          ]}
        >
          <Text style={styles.messageText}>{msg.content}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.messageTime}>
              {moment(msg.created_at).format('h:mm A')}
            </Text>
            {isMe && msg.isread && <Text style={styles.seenText}>✓ Seen</Text>}
          </View>
        </View>
        {isMe && <Avatar uri={avatarUri} style={styles.avatarMargin} />}
      </View>
    );
  };

  if (!chatUser) {
    return (
      <View style={styles.container}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Header />
          <View style={{flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"}}>
            <Text style={styles.title}>{chatUser.name}</Text>
             <TouchableOpacity onPress={handleChatProfile}>
            <Avatar uri={chatUser?.image} style={{marginLeft:wp(3)}}  />
            </TouchableOpacity>
          </View>
          
        </View>

        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {groupedMessages.map(({ day, messages }) => (
            <View key={day} style={{ marginBottom: 20 }}>
              <Text style={styles.dayHeader}>
                {moment(day).format('MMMM Do, YYYY')}
              </Text>
              {messages.map(renderMessage)}
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholderTextColor={theme.colors.textLight}
            placeholder="Type a message..."
            
          />
          <TouchableOpacity style={styles.sendIcon} onPress={handleSend}>
                          <Icon name="send" color={theme.colors.primaryDark}/>
            </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },

  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  dayHeader: {
    fontSize: wp(3.5),
    fontWeight: theme.fonts.semibold,
    marginVertical: 8,
    alignSelf: "center",

    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: wp(2),
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    marginBottom: hp(3),
  },
  input: {
    flex: 1,
    borderRadius: theme.radius.xl,
    borderColor: "#aaa",
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 8,
    height: hp(5.8),
  },

  // New styles for message row with avatar
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    maxWidth: "70%",
  },
  messageRowLeft: {
    alignSelf: "flex-start",
  },
  messageRowRight: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  avatarMargin: {
    marginHorizontal: 8,
  },

  messageWrapper: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ECECEC",
    flexShrink: 1,
  },
  myMsg: {
    backgroundColor: "#DCF8C6",
  },
  theirMsg: {
    backgroundColor: "#ECECEC",
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  messageTime: {
    fontSize: 11,
    color: "#555",
  },
  seenText: {
    fontSize: 11,
    color: "green",
    marginLeft: 6,
  },
});
