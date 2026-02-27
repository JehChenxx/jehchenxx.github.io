import supabase from '@/utils/supabase';
import { useEffect, useState } from 'react';

function SupaBaseExample() {
  const [todos, setTodos] = useState([]);

  async function getTodos() {
    const { data: todoss } = await supabase.from('todos').select();
    if (todoss && todoss.length > 0) {
      setTodos(() => todoss);
    }
  }

  useEffect(() => {
    console.log('登录成功，现在可以获取 Todos 了');
    getTodos(); // 登录成功后立即拉取数据
  }, []);

  return (
    <div>
      {todos.map((todo) => {
        console.log(todo);
        return <li key={todo}>{JSON.stringify(todo)}</li>;
      })}
    </div>
  );
}
export default SupaBaseExample;
