import { supabase } from '../lib/supabase';

export const sendMessage = async (senderid, receiverid, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        senderid,
        receiverid,
        content,
        isread: false,
      },
    ])
    .select();

  return { data, error };
};

export const getMessages = async (userId, chatPartnerId, limit = 20, offset = 0) => {
  const from = offset;
  const to = offset + limit - 1;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(senderid.eq.${userId},receiverid.eq.${chatPartnerId}),and(senderid.eq.${chatPartnerId},receiverid.eq.${userId})`)
    .order('created_at', { ascending: true })
    .range(from, to);

  return { data, error };
};


// export const getMessages = async (userId, chatPartnerId) => {
//   const { data, error } = await supabase
//     .from('messages')
//     .select('*')
//     .or(`and(senderid.eq.${userId},receiverid.eq.${chatPartnerId}),and(senderid.eq.${chatPartnerId},receiverid.eq.${userId})`)
//     .order('created_at', { ascending: true });

//   return { data, error };
// };

export const markMessagesAsRead = async (senderid, receiverid) => {
  const { error } = await supabase
    .from('messages')
    .update({ isread: true })
    .eq('senderid', senderid)
    .eq('receiverid', receiverid)
    .eq('isread', false);

  return error;
};

export const subscribeToMessages = (receiverid, onMessage) => {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiverid=eq.${receiverid}`,
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();
};
