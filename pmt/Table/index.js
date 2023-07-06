/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useCallback, Fragment } from 'react'
import { Table, Input, Form } from 'antd'
import { getNewPrices, getTableName } from '../utils'

const EditableContext = React.createContext(null)

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
)

const EditableFormRow = Form.create()(EditableRow)

class EditableCell extends React.Component {
  state = {
    editing: false,
  }

  toggleEdit = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const editing = !this.state.editing
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus()
      }
    })
  }

  save = e => {
    const { record, handleSave } = this.props
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return
      }
      this.toggleEdit()
      handleSave({ ...record, ...values })
    })
  }

  renderCell = form => {
    this.form = form
    const { children, dataIndex, record, title } = this.props
    const { editing } = this.state
    return editing ? (
      <Form.Item style={{ margin: 0, padding: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
          // eslint-disable-next-line no-return-assign
        })(
          <Input
            size="small"
            style={{ display: 'flex', width: '100%' }}
            ref={node => (this.input = node)}
            onPressEnter={this.save}
            onBlur={this.save}
          />,
        )}
      </Form.Item>
    ) : (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        className="editable-cell-value-wrap"
        style={{ padding: '0px', marfin: '0px', cursor: 'pointer' }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    )
  }

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props
    return (
      <td style={{ margin: '0', padding: '4px', width: '16%' }} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    )
  }
}

const EditableTable = ({ data, columns, tableIndex, updateTableData }) => {
  const components = {
    body: {
      row: EditableFormRow,
      cell: EditableCell,
    },
  }

  const editableColumns = columns.map(col => {
    if (!col.editable) {
      return col
    }

    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  const handleSave = useCallback(
    row => {
      const newData = [...data]
      const index = newData.findIndex(item => row.kcal === item.kcal)
      const item = newData[index]
      newData.splice(index, 1, { ...item, ...row })
      updateTableData(newData, tableIndex)
    },
    [data, tableIndex, updateTableData],
  )

  return (
    <Table
      components={components}
      rowClassName={() => 'editable-row'}
      bordered
      dataSource={data}
      columns={editableColumns}
      pagination={false}
      size="small"
      rowKey={() => Math.random().toString()}
    />
  )
}

const TableOfPrices = ({ data, onUpdate }) => {
  const columns = [
    {
      title: 'kcal',
      key: 'kcal',
      dataIndex: 'kcal',
    },
    {
      title: '2 days',
      key: '2',
      dataIndex: '2',
      editable: true,
    },
    {
      title: '2 weeks',
      key: '10',
      dataIndex: '10',
      editable: true,
    },
    {
      title: '1M',
      key: '20',
      dataIndex: '20',
      editable: true,
    },
    {
      title: '2M',
      key: '40',
      dataIndex: '40',
      editable: true,
    },
    {
      title: '3M',
      key: '60',
      dataIndex: '60',
      editable: true,
    },
  ]
  return (
    <>
      {data.map((tableData, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          <div
            style={{
              fontWeight: 'bold',
              width: '100%',
              backgroundColor: '#f2f4f8',
              padding: '0px 15px',
              borderRadius: '2px',
              border: '1px solid #e8e8e8',
              margin: '5px 0',
            }}
          >
            {getTableName(i)}
          </div>
          <EditableTable
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            data={tableData}
            columns={columns}
            tableIndex={i}
            updateTableData={onUpdate}
          />
        </Fragment>
      ))}
    </>
  )
}

export default TableOfPrices
