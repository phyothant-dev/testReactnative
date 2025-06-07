import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';
import { theme } from '../../constants/theme';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

const ChatList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUsersAndMessages = async () => {
      // 1. Fetch all users except the current user
      const { data: userList, error: userError } = await supabase
        .from('users')
        .select('id, name, image')
        .neq('id', user.id);

      if (userError) {
        console.error(userError.message);
        return;
      }

      // 2. Fetch all messages involving current user
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('id, senderid, receiverid, content, created_at, isread')
        .or(`senderid.eq.${user.id},receiverid.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (msgError) {
        console.error(msgError.message);
        return;
      }

      // 3. Track latest message and unread count
      const latestMap = new Map();
      const unreadCountMap = new Map();

      for (const msg of messages) {
        const otherUserId = msg.senderid === user.id ? msg.receiverid : msg.senderid;

        // Latest message
        if (!latestMap.has(otherUserId)) {
          const isSentByMe = msg.senderid === user.id;
          latestMap.set(otherUserId, {
            content: msg.content,
            created_at: msg.created_at,
            senderLabel: isSentByMe ? 'You' : 'Them',
          });
        }

        // Unread messages (received by me)
        if (msg.receiverid === user.id && !msg.is_read) {
          unreadCountMap.set(otherUserId, (unreadCountMap.get(otherUserId) || 0) + 1);
        }
      }

      // 4. Combine with user data
      const enrichedUsers = userList.map(u => {
        const latest = latestMap.get(u.id);
        return {
          ...u,
          lastMessage: latest ? `${latest.senderLabel}: ${latest.content}` : 'No conversation yet',
          lastMessageTime: latest?.created_at || null,
          unreadCount: unreadCountMap.get(u.id) || 0,
        };
      });

      // 5. Sort by message time
      enrichedUsers.sort((a, b) => {
        if (a.lastMessageTime && b.lastMessageTime) {
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        } else if (a.lastMessageTime) return -1;
        else if (b.lastMessageTime) return 1;
        else return a.name.localeCompare(b.name);
      });

      setUsers(enrichedUsers);
    };

    fetchUsersAndMessages();

    // Realtime updates
    const messageSub = supabase
      .channel('messages-listener')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new;
          if (msg.senderid === user.id || msg.receiverid === user.id) {
            fetchUsersAndMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSub);
    };
  }, [user]);

  const onUserPress = (selectedUser) => {
    router.push(`/(chat)/${selectedUser.id}`);
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Chat List" />
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
          {users.map((u) => (
            <Pressable
              key={u.id}
              style={styles.userItem}
              onPress={() => onUserPress(u)}
            >
              <Avatar
                size={hp(6.5)}
                uri={u.image}
                rounded={theme.radius.md}
              />
              <View style={styles.userInfo}>
                <View style={styles.userText}>
                  <Text style={styles.username}>{u.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.preview} numberOfLines={1}>
                      {u.lastMessage}
                    </Text>
                    {u.unreadCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{u.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {u.lastMessageTime && (
                  <Text style={styles.dateText}>
                    {new Date(u.lastMessageTime).toLocaleString([], {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  scrollView: {
    gap: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderRadius: theme.radius.xl * 1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 5,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: '#000',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    flexShrink: 1,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  preview: {
    fontSize: 12,
    color: 'gray',
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
    flexShrink: 0,
    textAlign: 'right',
    minWidth: 100,
  },
  badge: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
