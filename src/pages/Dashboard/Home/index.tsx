import { Todo, todoApi } from '@/supabase/dashboard';
import { DeleteOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  List,
  Row,
  Space,
  message,
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl, useModel } from 'umi';

const SCROLL_THRESHOLD = 24;

const DashboardHome: React.FC = () => {
  const intl = useIntl();
  const { user } = useModel('user');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [showDownArrow, setShowDownArrow] = useState(false);

  // 检测是否需要显示箭头：内容可滚动 AND 尚未滚到底
  const checkOverflow = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + SCROLL_THRESHOLD;
    const atBottom =
      scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
    setShowDownArrow(canScroll && !atBottom);
  }, []);

  // todos 变化、loading 结束、初次挂载时检测
  useEffect(() => {
    checkOverflow();
  }, [todos, loading, checkOverflow]);

  const scrollToListBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await todoApi.list(user.id);
      setTodos(data);
    } catch (e: any) {
      message.error(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addTodo = async () => {
    const text = input.trim();
    if (!text || !user) return;
    try {
      const item = await todoApi.create(user.id, text);
      setTodos((prev) => [item, ...prev]);
      setInput('');
    } catch (e: any) {
      message.error(e?.message || 'Create failed');
    }
  };

  const toggleTodo = async (id: string, done: boolean) => {
    try {
      await todoApi.toggle(id, !done);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !done } : t)),
      );
    } catch (e: any) {
      message.error(e?.message || 'Update failed');
    }
  };

  const removeTodo = async (id: string) => {
    try {
      await todoApi.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) {
      message.error(e?.message || 'Delete failed');
    }
  };

  const clearDone = async () => {
    if (!user) return;
    try {
      await todoApi.clearDone(user.id);
      setTodos((prev) => prev.filter((t) => !t.done));
    } catch (e: any) {
      message.error(e?.message || 'Clear failed');
    }
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <Row justify="end" style={{ height: '100%' }}>
      <Col span={6} style={{ height: '100%', display: 'flex' }}>
        <Card
          variant="borderless"
          title={
            <Space>
              <span>{intl.formatMessage({ id: 'dashboard.todo.title' })}</span>
              <span
                style={{
                  fontSize: 12,
                  color: '#999',
                  fontWeight: 'normal',
                }}
              >
                ({doneCount}/{todos.length})
              </span>
            </Space>
          }
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          styles={{
            body: {
              background: 'transparent',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
          extra={
            <Button size="small" onClick={clearDone} disabled={!doneCount}>
              {intl.formatMessage({ id: 'dashboard.todo.clearDone' })}
            </Button>
          }
        >
          <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
            <Input
              value={input}
              placeholder={intl.formatMessage({
                id: 'dashboard.todo.placeholder',
              })}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={addTodo}
              style={{
                background: 'rgba(255,255,255,0.35)',
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={addTodo}
              style={{
                background: 'rgba(255,255,255,0.45)',
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            >
              {intl.formatMessage({ id: 'dashboard.todo.add' })}
            </Button>
          </Space.Compact>

          <div
            ref={listRef}
            onScroll={checkOverflow}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              scrollBehavior: 'smooth',
            }}
          >
            <List
              loading={loading}
              dataSource={todos}
              locale={{
                emptyText: (
                  <Empty
                    description={intl.formatMessage({
                      id: 'dashboard.todo.empty',
                    })}
                  />
                ),
              }}
              renderItem={(todo) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeTodo(todo.id)}
                    />,
                  ]}
                >
                  <Checkbox
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id, todo.done)}
                    style={{
                      flex: 1,
                      textDecoration: todo.done ? 'line-through' : undefined,
                    }}
                  >
                    {todo.text}
                  </Checkbox>
                </List.Item>
              )}
            />
          </div>
          {showDownArrow && (
            <div
              onClick={scrollToListBottom}
              title={intl.formatMessage({
                id: 'dashboard.todo.scrollDown',
              })}
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#999',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 14,
                padding: '2px 8px',
                animation: 'float-down 1.8s ease-in-out infinite',
                pointerEvents: 'auto',
                zIndex: 10,
              }}
            >
              <DownOutlined style={{ fontSize: 14, opacity: 0.6 }} />
              <DownOutlined style={{ fontSize: 14, marginTop: -8 }} />
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default React.memo(DashboardHome);
