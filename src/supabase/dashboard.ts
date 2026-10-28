import supabase from './client';

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  done: boolean;
  created_at: string;
}

export interface Blog {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const todoApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Todo[];
  },
  create: async (userId: string, text: string) => {
    const { data, error } = await supabase
      .from('user_todos')
      .insert({ user_id: userId, text })
      .select();
    if (error) throw error;
    return data?.[0] as Todo;
  },
  toggle: async (id: string, done: boolean) => {
    const { data, error } = await supabase
      .from('user_todos')
      .update({ done })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] as Todo;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('user_todos').delete().eq('id', id);
    if (error) throw error;
  },
  clearDone: async (userId: string) => {
    const { error } = await supabase
      .from('user_todos')
      .delete()
      .eq('user_id', userId)
      .eq('done', true);
    if (error) throw error;
  },
};

export const blogApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as Blog[];
  },
  create: async (userId: string, title: string, content: string) => {
    const { data, error } = await supabase
      .from('blogs')
      .insert({ user_id: userId, title, content })
      .select();
    if (error) throw error;
    return data?.[0] as Blog;
  },
  update: async (id: string, title: string, content: string) => {
    const { data, error } = await supabase
      .from('blogs')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] as Blog;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
  },
};
