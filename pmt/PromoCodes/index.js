/* eslint-disable react/destructuring-assignment */
import React from 'react'
import { injectIntl } from 'react-intl'
import { Empty, List, InputNumber, Input, Row, Col, Button, Select } from 'antd'

const { Option } = Select

@injectIntl
class PromoCodes extends React.Component {
  state = {}

  render() {
    const {
      promocodes,
      onChangePromo,
      deletePromo,
      intl: { formatMessage },
    } = this.props

    return (
      <div>
        {promocodes && promocodes.length !== 0 && (
          <div>
            <List
              bordered
              size="small"
              dataSource={promocodes}
              renderItem={(item, index) => (
                <List.Item>
                  <Row style={{ width: '100%', display: 'flex', alignItems: 'center' }} gutter={16}>
                    <Col md={6} sm={10}>
                      <Input
                        value={item.code}
                        style={{ width: '100%' }}
                        onChange={e => onChangePromo(e, 'code', index)}
                      />
                    </Col>
                    <Col md={6} sm={10}>
                      <Select
                        defaultValue={{ key: 'percentage' }}
                        value={item.type}
                        style={{ width: '100%' }}
                        onChange={e => onChangePromo(e, 'type', index)}
                      >
                        <Option key="fixedAmount" value="fixedAmount">
                          fixedAmount
                        </Option>
                        <Option key="percentage" value="percentage">
                          percentage
                        </Option>
                      </Select>
                    </Col>
                    <Col md={4} sm={10}>
                      <InputNumber
                        value={item.amount}
                        style={{ width: '100%' }}
                        onChange={e => onChangePromo(e, 'amount', index)}
                      />
                    </Col>
                    <Col md={2} sm={3}>
                      <Button type="danger" onClick={() => deletePromo(index)}>
                        {formatMessage({ id: 'global.remove' })}
                      </Button>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </div>
        )}
        {promocodes.length === 0 && <Empty description={false} />}
      </div>
    )
  }
}

export default PromoCodes
