import { Blog, blogApi } from '@/supabase/dashboard';
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Typography,
  message,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl, useModel } from 'umi';

const DashboardBlog: React.FC = () => {
  const intl = useIntl();
  const { user } = useModel('user');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await blogApi.list(user.id);
      setBlogs(data);
    } catch (e: any) {
      message.error(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setEditorOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    form.setFieldsValue({ title: blog.title, content: blog.content });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        const updated = await blogApi.update(
          editing.id,
          values.title,
          values.content,
        );
        setBlogs((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b)),
        );
      } else {
        const created = await blogApi.create(
          user.id,
          values.title,
          values.content,
        );
        setBlogs((prev) => [created, ...prev]);
      }
      message.success(intl.formatMessage({ id: 'dashboard.blog.saved' }));
      setEditorOpen(false);
    } catch (e: any) {
      message.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await blogApi.remove(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      message.success(intl.formatMessage({ id: 'dashboard.blog.deleted' }));
    } catch (e: any) {
      message.error(e?.message || 'Delete failed');
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>{intl.formatMessage({ id: 'dashboard.blog.title' })}</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={load}>
              {intl.formatMessage({ id: 'dashboard.blog.refresh' })}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {intl.formatMessage({ id: 'dashboard.blog.new' })}
            </Button>
          </Space>
        }
      >
        <List
          loading={loading}
          dataSource={blogs}
          locale={{
            emptyText: (
              <Empty
                description={intl.formatMessage({
                  id: 'dashboard.blog.empty',
                })}
              />
            ),
          }}
          renderItem={(blog) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openEdit(blog)}
                >
                  {intl.formatMessage({ id: 'dashboard.blog.edit' })}
                </Button>,
                <Popconfirm
                  title={intl.formatMessage({
                    id: 'dashboard.blog.confirmDelete',
                  })}
                  onConfirm={() => handleDelete(blog.id)}
                  okText={intl.formatMessage({ id: 'app.confirm' })}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    {intl.formatMessage({ id: 'dashboard.blog.delete' })}
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={blog.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Typography.Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 4 }}
                    >
                      {blog.content || '(empty)'}
                    </Typography.Paragraph>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(blog.updated_at)}
                    </Typography.Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={intl.formatMessage({
          id: editing
            ? 'dashboard.blog.editor.edit'
            : 'dashboard.blog.editor.new',
        })}
        open={editorOpen}
        onOk={handleSave}
        onCancel={() => setEditorOpen(false)}
        confirmLoading={saving}
        okText={intl.formatMessage({ id: 'dashboard.blog.editor.save' })}
        cancelText={intl.formatMessage({ id: 'dashboard.blog.editor.cancel' })}
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="title"
            label={intl.formatMessage({ id: 'dashboard.blog.editor.title' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'dashboard.blog.editor.titlePlaceholder',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'dashboard.blog.editor.titlePlaceholder',
              })}
              maxLength={120}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="content"
            label={intl.formatMessage({ id: 'dashboard.blog.editor.content' })}
          >
            <Input.TextArea
              placeholder={intl.formatMessage({
                id: 'dashboard.blog.editor.contentPlaceholder',
              })}
              rows={12}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default React.memo(DashboardBlog);
