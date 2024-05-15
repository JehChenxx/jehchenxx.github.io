import type { TableProps } from 'antd';
import { Button, Popconfirm, Table } from 'antd';
import React from 'react';

interface DataType {
  id: string;
  name: string;
}

const ProductList: React.FC<{
  products: DataType[];
  onDelete: (id: string) => void;
}> = ({ onDelete, products }) => {
  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Actions',
      render(text, record) {
        return (
          <Popconfirm title="Delete?" onConfirm={() => onDelete(record.id)}>
            <Button>Delete</Button>
          </Popconfirm>
        );
      },
    },
  ];
  return <Table rowKey="id" dataSource={products} columns={columns} />;
};

export default ProductList;
