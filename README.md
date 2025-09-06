You will need to create the "index.js" file in constants folder. Supabase Url and Key needed to be placed in that file. this is the supabase database schema.

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  text text,
  userId uuid,
  postId bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_postId_fkey FOREIGN KEY (postId) REFERENCES public.posts(id),
  CONSTRAINT comments_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.group_members (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  group_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)
);
CREATE TABLE public.group_messages (
  senderid uuid NOT NULL,
  year smallint NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  audio_url text,
  file_url text,
  file_name text,
  file_type text,
  CONSTRAINT group_messages_pkey PRIMARY KEY (id),
  CONSTRAINT group_messages_senderid_fkey FOREIGN KEY (senderid) REFERENCES public.users(id)
);
CREATE TABLE public.groups (
  name text NOT NULL,
  year smallint,
  created_by uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  photo_url text,
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  audio_url text,
  senderid uuid,
  receiverid uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  isread boolean DEFAULT false,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  file_url text,
  file_name text,
  file_type text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_senderid_fkey FOREIGN KEY (senderid) REFERENCES public.users(id),
  CONSTRAINT messages_receiverid_fkey FOREIGN KEY (receiverid) REFERENCES public.users(id)
);
CREATE TABLE public.notes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  userid uuid,
  title text,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  isread boolean DEFAULT false,
  title text,
  senderId uuid,
  receiverId uuid,
  data text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_senderId_fkey FOREIGN KEY (senderId) REFERENCES public.users(id),
  CONSTRAINT notifications_receiverId_fkey FOREIGN KEY (receiverId) REFERENCES public.users(id)
);
CREATE TABLE public.postLikes (
  postId bigint,
  userId uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT postLikes_pkey PRIMARY KEY (id),
  CONSTRAINT postLikes_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id),
  CONSTRAINT postLikes_postId_fkey FOREIGN KEY (postId) REFERENCES public.posts(id)
);
CREATE TABLE public.posts (
  body text,
  file text,
  userId uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_userId_fkey FOREIGN KEY (userId) REFERENCES public.users(id)
);
CREATE TABLE public.todos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  userid uuid,
  task text,
  iscompleted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id)
);
CREATE TABLE public.user_group_messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  senderid uuid NOT NULL,
  group_id uuid NOT NULL,
  content text,
  audio_url text,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_group_messages_pkey PRIMARY KEY (id),
  CONSTRAINT user_group_messages_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT user_group_messages_senderid_fkey FOREIGN KEY (senderid) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  name text,
  image text,
  bio text,
  email text,
  address text,
  phoneNumber text,
  year smallint,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
