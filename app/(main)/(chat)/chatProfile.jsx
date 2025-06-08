import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Header from '../../../components/Header';
import Avatar from '../../../components/Avatar';
import Icon from '../../../assets/icons'
import { theme } from '../../../constants/theme';
import { hp, wp } from '../../../helpers/common';
import { useRouter } from 'expo-router'
import { FlatList } from 'react-native';
import Loading from '../../../components/Loading';
import { fetchPosts } from '../../../services/postService';
import PostCard from '../../../components/PostCard';


var limit = 0;
const chatProfile = () => {
  const router = useRouter();

  const user = useLocalSearchParams();
  console.log(user.year);
  const [posts,setPosts] = useState([]);
  const [hasMore,setHasMore] = useState(true);
  

  const getPosts = async()=>{
      if(!hasMore) return null;
      limit = limit+10;
      let res= await fetchPosts(limit,user.id);
      if(res.success){
        if(posts.length == res.data.length) setHasMore(false);
        setPosts(res.data);
      }
    }

  
  return (
    <ScreenWrapper bg="white">
      <FlatList
              data={posts}
              ListHeaderComponent={
                <UserHeader user={user} />}
              ListHeaderComponentStyle={{marginBottom:30}}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listStyle}
              keyExtractor={item=>item.id.toString()}
              renderItem={({item})=> <PostCard 
                item={item}
                currentUser={user}
                router={router}
                />
            }
            onEndReached={()=>{
              getPosts();
              console.log('got to the end');
            }}
            onEndReachedThreshold={0}
            ListFooterComponent={hasMore? (
              <View style={{marginVertical:posts.length== 0 ? 100 :  30}}>
                <Loading/>
              </View>
            ):(
              <View style={{marginVertical:30}}>
                <Text style={[styles.noPosts,{alignSelf:'center'}]}>No more posts</Text>
                </View>
            )}
            />
    </ScreenWrapper>
  );
};

const UserHeader = ({user}) => {
  const getYearLabel = (value) => {
  switch (value) {
    case "1": return 'First Year';
    case "2": return 'Second Year';
    case "3": return 'Third Year';
    case "4": return 'Fourth Year';
    case "5": return 'Fifth Year';
    default: return '';
  }
};

  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" mb={30} />
      </View>
      <View style={styles.container}>
        <View style={[{gap:15},styles.avatarContainer]}>
          <Avatar
          uri={user?.image}
          size={hp(12)}
          rounded={theme.radius.xxl*1.4}
          />
        </View>
        {/* username and address */}
        <View style={{alignItems:'center',gap:4}}>
          <Text style={styles.userName}>{user && user.name}</Text>
          <Text style={styles.infoText}>{user && user.address}</Text>
        </View>
        {/* email,phone,bio */}
        <View style={{gap:10}}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight}/>
              <Text style={styles.infoText}>
                  {user && user.email}
              </Text>
            </View>
            {
              user && user.phoneNumber &&(
                <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight}/>
                <Text style={styles.infoText}>
                    {user && user.phoneNumber}
                </Text>
              </View>
              )
            }<View style={styles.info}>
          <Text style={styles.infoText}>
            {user && getYearLabel(user.year)}
          </Text>
</View>

            {
              user && user.bio && (
                <Text style={styles.infoText}>{user.bio}</Text>
              )
            }
        </View>
      </View>
    </View>
  );
};

export default chatProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textalign: "center",
    color: theme.colors.text,
  },
});
