import { KeyOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, notification } from 'antd';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

const saveKey = 'encryptedKey';

export const getDataAPIkey = () => {
  const enc = localStorage.getItem(saveKey);
  return enc && window.atob(window.atob(enc));
};

const MongoDBAltasKey = () => {
  const [form] = Form.useForm();

  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    if (showModel) {
      form.setFieldsValue({ [saveKey]: localStorage.getItem(saveKey) });
    }
  }, [showModel]);

  return (
    <>
      <KeyOutlined onClick={() => setShowModel(true)} />
      <Modal
        open={showModel}
        title="MongoDB Altas"
        footer={
          <Button
            type="primary"
            onClick={() =>
              form.validateFields().then((values) => {
                if (isEmpty(values[saveKey])) {
                  Modal.confirm({
                    title: '警告',
                    content: '确认后将清除Data Api Key缓存',
                    onOk: () => localStorage.removeItem(saveKey),
                  });
                } else {
                  try {
                    if (values[saveKey] !== localStorage.getItem(saveKey)) {
                      localStorage.setItem(
                        saveKey,
                        window.btoa(window.btoa(values[saveKey])),
                      );
                    }
                    setShowModel(false);
                  } catch {
                    notification.error({
                      message: '保存失败，请检查输入无特殊字符后尝试保存',
                    });
                  }
                }
              })
            }
          >
            确定
          </Button>
        }
        onCancel={() => setShowModel(false)}
      >
        <Form name="mongodb" form={form}>
          <Form.Item label="Data Api Key" name={saveKey}>
            <Input.TextArea rows={10} allowClear></Input.TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MongoDBAltasKey;
