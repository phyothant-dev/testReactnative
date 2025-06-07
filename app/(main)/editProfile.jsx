import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Header from '../../components/Header'
import { Image } from 'expo-image'
import { useAuth } from '../../contexts/AuthContext'
import { getUserImageSrc, upLoadFile } from '../../services/imageService'
import Icon from '../../assets/icons'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { Alert } from 'react-native'
import { updateUser } from '../../services/userService'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import DropDownPicker from 'react-native-dropdown-picker';
const EditProfile = () => {

  const {user:currentUser,setUserData} = useAuth();
  const router = useRouter();
  const [loading,setLoading]=useState(false);

  const [year, setYear] = useState(null);
  const [open, setOpen] = useState(false);
  const [itemss, setItemss] = useState([
    { label: 'First Year', value: 1 },
    { label: 'Second Year', value: 2 },
    { label: 'Third Year', value: 3 },
    { label: 'Fourth Year', value: 4 },
    { label: 'Fifth Year', value: 5 },
  ]);


  const [user,setUser]=useState({
    name:'',
    phoneNumber:'',
    image:null,
    bio:'',
    address:'',
    year:null
  });

  useEffect(()=>{
    if(currentUser){
      setUser({
        name:currentUser.name || '',
        phoneNumber:currentUser.phoneNumber || '',
        image:currentUser.image || null,
        address:currentUser.address || '',
        bio:currentUser.bio || '',
        year:currentUser.year || ''
      })
      setYear(currentUser.year || null); 
    }
    
  },[currentUser])

  let imageSource = user.image && typeof user.image == 'object' ? user.image.uri : getUserImageSrc(user.image);

  const onPickImage =async ()=>{
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:ImagePicker.MediaTypeOptions.Images,
      allowsEditing:true,
      aspect:[4,3],
      quality:0.7,
    });

    if(!result.canceled){
      setUser({...user,image:result.assets[0]});
    }
  }

  const onSubmit = async ()=>{
    let userData={...user};
    let {name,phoneNumber,address,image,bio} = userData;
    if(!name || !phoneNumber || !address|| !image || !bio){
      Alert.alert('Profile',"Please fill all the fields");
      return;
    }
    setLoading(true);

    if(typeof image == 'object'){
      //upload
      let imageRes = await upLoadFile('profiles',image?.uri,true);
      if(imageRes.success) userData.image=imageRes.data;
      else userData.image=null;
    }

    //update user
    const res= await updateUser(currentUser?.id,userData);
    setLoading(false);

    if(res.success){
      setUserData({...currentUser,...userData});
      router.back();
    }
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView style={{flex:1}}>
          <Header title="Edit Profile" />

          {/* form */}
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" size={20} strokeWidth={2.5} />
              </Pressable>
            </View>
            <Text style={{fontSize:hp(1.5),color:theme.colors.text}}>
              Please fill your profile details
            </Text>
            <Input   
            icon={<Icon name="user"/>}
            placeholder="Enter your name"
            value={user.name}
            onChangeText={value=>setUser({...user,name:value})}
            />
            <Input   
            icon={<Icon name="call"/>}
            placeholder="Enter your phone number"
            value={user.phoneNumber}
            onChangeText={value=>setUser({...user,phoneNumber:value})}
            />
             <View style={{ zIndex: 10 }}>
  <DropDownPicker
    open={open}
    value={year}
    items={itemss}
    setOpen={setOpen}
    setValue={(callback) => {
    const newYear = callback(year);
    setYear(newYear);
    setUser((prevUser) => ({ ...prevUser, year: newYear }));
  }}
    setItems={setItemss}
    placeholder="Select your year"
    listMode="SCROLLVIEW"
    style={{
      borderColor: theme.colors.textLight,
      paddingHorizontal: 15,
      borderWidth:0.4,
      borderRadius:theme.radius.xxl,
      borderColor:theme.colors.text,
      borderCurve:'continuous',
      height: 55,
      backgroundColor: '#fff',
    }}
    dropDownContainerStyle={{
      borderColor: theme.colors.textLight,
      borderWidth: 1,
      borderRadius: 12,
      backgroundColor: '#fff',
      elevation: 4, // shadow for Android
      zIndex: 1000,
    }}
    textStyle={{
      fontSize: wp(4),
      color: theme.colors.textLight,
    }}
    placeholderStyle={{
      color: theme.colors.textLight,
    }}
    labelStyle={{
      fontSize: wp(4),
    }}
    arrowIconStyle={{
      tintColor: theme.colors.textLight,
    }}
  />
</View>
            <Input   
            icon={<Icon name="location"/>}
            placeholder="Enter your address"
            value={user.address}
            onChangeText={value=>setUser({...user,address:value})}
            />
            <Input   
            placeholder="Enter your bio"
            value={user.bio}
            multiline={true}
            containerStyle={styles.bio}
            onChangeText={value=>setUser({...user,bio:value})}
            />

            <Button title="Update" loading={loading} onPress={onSubmit}/>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal:wp(4)
  },
  avatarContainer:{
    alignSelf:'center',
    height:hp(14),
    width:hp(14)
  },
  avatar:{
    width:'100%',
    height:'100%',
    borderRadius:theme.radius.xxl*1.8,
    borderCurve:'continuous',
    borderWidth:1,
    borderColor:theme.colors.darkLight
  },
  cameraIcon:{
    position:'absolute',
    bottom:0,
    right:-10,
    padding:8,
    borderRadius:50,
    backgroundColor:'white',
    shadowColor:theme.colors.textLight,
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.4,
    shadowRadius:5,
    elevation:7
  },
  form:{
    gap:18,
    marginTop:20,
  },
  input:{
    flexDirection:'row',
    borderWidth:0.4,
    borderColor:theme.colors.text,
    borderRadius:theme.radius.xxl,
    borderCurve:'continuous',
    padding:17,
    paddingHorizontal:20,
    gap:15
  },
  bio:{
    flexDirection:'row',
    height:hp(15),
    alignItems:'flex-start',
    paddingVertical:15
  }
})