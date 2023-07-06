/* eslint-disable no-plusplus */
import React from 'react'
import { injectIntl } from 'react-intl'
import moment from 'moment'
import _ from 'lodash'
import { connect } from 'react-redux'
import {
  DatePicker,
  Button,
  Select,
  Checkbox,
  InputNumber,
  notification,
  Form,
  Row,
  Col,
  Switch,
  Tabs,
} from 'antd'
import { Helmet } from 'react-helmet'
import StatisticPMT from 'components/NutritionPRO/StatisticsPMT'
import Authorize from 'components/LayoutComponents/Authorize'
import TableOfPrices from './Table'
import PromoCodes from './PromoCodes'
import styles from './style.module.scss'
import { getPMTByPeriod } from '../../../api/dashboard'
import priceDefaults from './price-defaults'
import { getRowsForSection, getNewPrices } from './utils'

const { TabPane } = Tabs
const { RangePicker } = DatePicker
const { Option } = Select

@injectIntl
@connect(({ user }) => ({ user }))
class PriceModelingTool extends React.Component {
  state = {
    start: moment()
      .startOf('month')
      .unix(),
    end: moment()
      .endOf('month')
      .unix(),
    statuses: ['accepted'],
    mealPlans: ['2', '3', '5'],
    types: ['new', 'prolong', 'return'],
    isInvoiced: 1,
    sales: 'all',
    without2days: true,
    mainDishPrice: 83,
    snackDishPrice: 47,
    deliveryCost: 40,
    loading: true,
    tableData: [],
    defaultTableData: [],
    statistics: [],
    salesList: [],
    cpd: 0,
    promocodes: [],
    useDefPrices: true,
    activeTab: '0',
    perc: 0,
    discountTableData: [],
    logisticCenterCost: 13,
  }

  constructor(props) {
    super(props)

    this.show = this.show.bind(this)
    this.onChangeInvoiced = this.onChangeInvoiced.bind(this)
    this.onChangeSales = this.onChangeSales.bind(this)
    this.onUpdatePriceTables = this.onUpdatePriceTables.bind(this)
    this.handleChangeWithout2days = this.handleChangeWithout2days.bind(this)
    this.handleChangePeriod = this.handleChangePeriod.bind(this)
    this.onChangePromo = this.onChangePromo.bind(this)
    this.deletePromo = this.deletePromo.bind(this)
    this.addPromo = this.addPromo.bind(this)
    this.handleChangeDefPrice = this.handleChangeDefPrice.bind(this)
    this.onChangeLogisticCenterCost = this.onChangeLogisticCenterCost.bind(this)
  }

  componentDidMount() {
    const tableData = Object.entries(priceDefaults)
      .sort()
      .reverse()
      .map(([section, cols]) => {
        return getRowsForSection(section, cols)
      })

    tableData.pop()

    this.setState(() => ({ tableData }))
    this.setState(() => ({ defaultTableData: tableData }))

    this.show()
  }

  onUpdatePriceTables(data, i) {
    const { tableData, discountTableData } = this.state
    const newData = [...tableData]
    newData[i] = data
    if (discountTableData.length) {
      this.setState({ discountTableData: newData })
    }
    this.setState({ tableData: newData })
  }

  onChangeField(e, field) {
    if (e.target) {
      if (e.target.type === 'checkbox') {
        this.setState({
          [field]: e.target.checked,
        })
      } else {
        this.setState({
          [field]: e.target.value,
        })
      }
    } else {
      this.setState({
        [field]: e,
      })
    }
  }

  onChangePromo(e, field, index) {
    const { promocodes } = this.state

    let value = e
    if (e.target) {
      if (e.target.type === 'checkbox') {
        value = e.target.checked
      } else {
        // eslint-disable-next-line prefer-destructuring
        value = e.target.value
      }
    }
    promocodes[index][field] = value
    this.setState({
      promocodes,
    })
  }

  onChangeSales(e) {
    try {
      this.setState({
        sales: e,
      })
    } catch (error) {
      console.log(error)
    }
  }

  onChangeInvoiced(e) {
    try {
      this.setState({
        isInvoiced: e,
      })
    } catch (error) {
      console.log(error)
    }
  }

  changeTab = key => {
    this.setState({
      activeTab: key,
    })
  }

  handleChangeDefPrice = checked => {
    this.setState({
      useDefPrices: checked,
    })
  }

  handleChangePeriod = async period => {
    this.setState({ start: period[0].unix(), end: period[1].unix() })
  }

  handleChangeWithout2days = e => {
    this.setState({
      without2days: e.target.checked,
    })
  }

  onChangeLogisticCenterCost = e => {
    if (e) {
      this.setState({
        logisticCenterCost: e,
      })
    }
  }

  acceptPerc = () => {
    const { perc, defaultTableData } = this.state
    const {
      intl: { formatMessage },
    } = this.props
    const newTableData = _.cloneDeep(defaultTableData)
    for (let i = 0; i < newTableData.length; i++) {
      for (let j = 0; j < newTableData[i].length; j++) {
        Object.entries(newTableData[i][j]).forEach(([key, value]) => {
          if (typeof value === 'number') {
            newTableData[i][j][key] = Math.floor(value * (1 + perc / 100))
          }
        })
      }
    }
    this.setState({
      discountTableData: newTableData,
    })
    notification.success({
      message: formatMessage({ id: 'global.success' }),
      description: 'Prices were changed',
    })
  }

  resetPerc = () => {
    const { defaultTableData } = this.state
    const {
      intl: { formatMessage },
    } = this.props
    this.setState({
      perc: 0,
      discountTableData: [],
      tableData: defaultTableData,
    })
    notification.success({
      message: formatMessage({ id: 'global.success' }),
      description: 'Prices were reseted',
    })
  }

  addPromo() {
    const { promocodes } = this.state

    promocodes.push({
      code: '',
      type: 'percentage',
      amount: null,
    })

    this.setState({
      promocodes,
    })
  }

  deletePromo(key) {
    const { promocodes } = this.state
    promocodes.splice(key, 1)

    this.setState({
      promocodes,
    })
  }

  show() {
    const {
      start,
      end,
      statuses,
      mealPlans,
      isInvoiced,
      sales,
      without2days,
      mainDishPrice,
      snackDishPrice,
      deliveryCost,
      types,
      cpd,
      tableData,
      discountTableData,
      useDefPrices,
      promocodes,
      logisticCenterCost,
    } = this.state

    this.setState({
      loading: true,
    })

    const prices = getNewPrices(discountTableData.length ? discountTableData : tableData)

    const body = {
      statuses,
      mealPlans,
      isInvoiced,
      sales,
      without2days,
      mainDishPrice,
      snackDishPrice,
      deliveryCost,
      types,
      cpd,
      promocodes,
      logisticCenterCost,
    }

    if (!useDefPrices) {
      body.prices = prices
    }

    getPMTByPeriod(
      moment.unix(start).format('DD-MM-YYYY'),
      moment.unix(end).format('DD-MM-YYYY'),
      body,
    ).then(async req => {
      if (req.status === 401) {
        const { dispatch } = this.props
        dispatch({
          type: 'user/SET_STATE',
          payload: {
            authorized: false,
          },
        })
        return
      }
      if (req.status === 200) {
        const pmt = await req.json()
        this.setState({
          statistics: pmt.statistics,
          loading: false,
        })
      } else {
        notification.error({
          message: req.status,
          description: req.statusText,
        })
        this.setState({
          loading: false,
        })
      }
    })
  }

  render() {
    const {
      start,
      end,
      loading,
      tableData,
      discountTableData,
      statistics,
      sales,
      isInvoiced,
      statuses,
      mealPlans,
      without2days,
      mainDishPrice,
      snackDishPrice,
      deliveryCost,
      types,
      salesList,
      cpd,
      promocodes,
      useDefPrices,
      activeTab,
      perc,
      logisticCenterCost,
    } = this.state

    const {
      intl: { formatMessage },
    } = this.props

    return (
      <Authorize roles={['finance', 'root', 'salesDirector']} redirect to="/main">
        <Helmet title={formatMessage({ id: 'PMT.PriceModelingTool' })} />
        <div className="row">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>{formatMessage({ id: 'PMT.PriceModelingTool' })}</strong>
                </div>
              </div>
              <div className="card-body">
                <RangePicker
                  ranges={{
                    'Previous Month': [
                      moment()
                        .subtract(1, 'month')
                        .startOf('month'),
                      moment()
                        .subtract(1, 'month')
                        .endOf('month'),
                    ],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                  }}
                  defaultValue={[moment(start * 1000), moment(end * 1000)]}
                  format="DD.MM.YYYY"
                  onChange={this.handleChangePeriod}
                  style={{ marginRight: '10px', width: '75%' }}
                />
                <div style={{ marginTop: '15px' }}>
                  <span>
                    Use actual price from server
                    <Switch
                      style={{ marginLeft: '15px' }}
                      checked={useDefPrices}
                      onChange={this.handleChangeDefPrice}
                    />
                  </span>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <span>% </span>
                  <InputNumber
                    disabled={useDefPrices}
                    size="small"
                    value={perc}
                    onChange={e => this.onChangeField(e, 'perc')}
                  />
                  <Button
                    disabled={useDefPrices}
                    style={{ marginLeft: '15px' }}
                    type="primary"
                    onClick={() => {
                      this.acceptPerc()
                    }}
                    size="small"
                  >
                    {formatMessage({ id: 'global.accept' })}
                  </Button>
                  <Button
                    disabled={useDefPrices}
                    style={{ marginLeft: '15px' }}
                    type="primary"
                    onClick={() => {
                      this.resetPerc()
                    }}
                    size="small"
                  >
                    {formatMessage({ id: 'PMT.Reset' })}
                  </Button>
                </div>
                <Button
                  style={{ marginTop: '15px' }}
                  loading={loading}
                  type="primary"
                  onClick={() => {
                    this.show()
                    this.setState({ activeTab: '2' })
                  }}
                  size="large"
                >
                  {formatMessage({ id: 'global.show' })}
                </Button>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <div>
                  <div style={{ float: 'left', marginRight: '15px' }}>
                    <small>{formatMessage({ id: 'PMT.Invoice' })}</small>
                    <br />
                    <Select
                      value={isInvoiced}
                      style={{ width: 120 }}
                      onChange={this.onChangeInvoiced}
                      size="small"
                    >
                      <Option value={-1}>{formatMessage({ id: 'PMT.All' })}</Option>
                      <Option value={2}>{formatMessage({ id: 'PMT.Invoiced&customPrice' })}</Option>
                      <Option value={1}>{formatMessage({ id: 'PMT.Invoiced' })}</Option>
                      <Option value={0}>{formatMessage({ id: 'PMT.NoneInvoiced' })}</Option>
                    </Select>
                  </div>
                  <div style={{ float: 'left', marginRight: '15px' }}>
                    <small>{formatMessage({ id: 'PMT.Sales' })}</small>
                    <br />
                    <Select
                      value={sales}
                      style={{ width: 120 }}
                      onChange={this.onChangeSales}
                      size="small"
                    >
                      <Option value="all">{formatMessage({ id: 'PMT.All' })}</Option>
                      {salesList &&
                        salesList.map(sale => (
                          <Option key={sale.id} value={sale.id}>
                            {sale.name}
                          </Option>
                        ))}
                    </Select>
                  </div>
                  <div style={{ float: 'left', marginRight: '15px' }}>
                    <small>Statuses</small>
                    <br />
                    <Select
                      placeholder={formatMessage({ id: 'PMT.statuses' })}
                      mode="tags"
                      value={statuses}
                      onChange={e => this.onChangeField(e, 'statuses')}
                      size="small"
                    >
                      {['accepted', 'canceled', 'waitingPayment'].map(tag => (
                        <Option key={tag} value={tag}>
                          {tag}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ float: 'left', marginRight: '15px' }}>
                    <small>{formatMessage({ id: 'PMT.Program' })}</small>
                    <br />
                    <Select
                      placeholder={formatMessage({ id: 'PMT.Meals' })}
                      mode="tags"
                      value={mealPlans}
                      onChange={e => this.onChangeField(e, 'mealPlans')}
                      size="small"
                    >
                      {['2', '3', '5'].map(tag => (
                        <Option key={tag} value={tag}>
                          {`${tag} meals`}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ marginRight: '15px' }}>
                    <small>{formatMessage({ id: 'PMT.WithoutTrial' })}</small>
                    <br />
                    <Checkbox
                      checked={without2days}
                      onClick={e => this.handleChangeWithout2days(e)}
                    >
                      {without2days ? 'Yes' : 'No'}
                    </Checkbox>
                  </div>
                </div>
                <hr />
                <div>
                  <div style={{ float: 'left', marginRight: '15px' }}>
                    <small>{formatMessage({ id: 'PMT.Type' })}</small>
                    <br />
                    <Select
                      placeholder={formatMessage({ id: 'PMT.Meals' })}
                      mode="tags"
                      value={types}
                      onChange={e => this.onChangeField(e, 'types')}
                      size="small"
                    >
                      {['new', 'prolong', 'return', 'trial'].map(tag => (
                        <Option key={tag} value={tag}>
                          {tag}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <Authorize roles={['root', 'salesDirector']}>
                    <Col span={4}>
                      <small>{formatMessage({ id: 'STF.Logistic Center Cost' })}</small>
                      <br />
                      <InputNumber
                        size="small"
                        value={logisticCenterCost}
                        onChange={e => this.onChangeLogisticCenterCost(e)}
                      />
                    </Col>
                  </Authorize>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <Tabs activeKey={activeTab} onChange={this.changeTab}>
              <TabPane tab={formatMessage({ id: 'PMT.Prices' })} key={0}>
                <div className="card">
                  <div className="card-body">
                    <Authorize roles={['root', 'salesDirector']}>
                      <div style={{ marginBottom: '20px' }} className="utils__title">
                        <strong>{formatMessage({ id: 'PMT.COGS' })}</strong>
                      </div>
                      <div style={{ float: 'left', marginRight: '15px' }}>
                        <small>{formatMessage({ id: 'PMT.HlavniJidlo' })}</small>
                        <br />
                        <InputNumber
                          size="small"
                          value={mainDishPrice}
                          onChange={e => this.onChangeField(e, 'mainDishPrice')}
                        />
                      </div>
                      <div style={{ float: 'left', marginRight: '15px' }}>
                        <small>{formatMessage({ id: 'PMT.Snack' })}</small>
                        <br />
                        <InputNumber
                          size="small"
                          value={snackDishPrice}
                          onChange={e => this.onChangeField(e, 'snackDishPrice')}
                        />
                      </div>
                      <div style={{ float: 'left', marginRight: '15px' }}>
                        <small>{formatMessage({ id: 'PMT.Delivery' })}</small>
                        <br />
                        <InputNumber
                          size="small"
                          value={deliveryCost}
                          onChange={e => this.onChangeField(e, 'deliveryCost')}
                        />
                      </div>
                      <div style={{ marginRight: '15px' }}>
                        <small>{formatMessage({ id: 'PMT.CoastPerDeal' })}</small>
                        <br />
                        <InputNumber
                          size="small"
                          value={cpd}
                          onChange={e => this.onChangeField(e, 'cpd')}
                        />
                      </div>
                      <hr style={{ marginBottom: '20px' }} />
                    </Authorize>
                    <div style={{ marginBottom: '20px' }} className="utils__title">
                      <strong>{formatMessage({ id: 'PMT.TableOfPrices' })}</strong>
                    </div>
                    <TableOfPrices
                      data={discountTableData.length ? discountTableData : tableData}
                      loading={loading}
                      onUpdate={this.onUpdatePriceTables}
                    />
                  </div>
                </div>
              </TabPane>
              <TabPane tab={formatMessage({ id: 'PMT.PromoCodes' })} key={1}>
                <div className="card">
                  <div className="card-body">
                    <Form layout="vertical" onSubmit={this.onSend}>
                      <Row gutter={16}>
                        <Col md={24} sm={24}>
                          <div style={{ marginBottom: '20px' }} className="utils__title">
                            <strong>{formatMessage({ id: 'PMT.PromoCodes' })}</strong>
                          </div>
                          <PromoCodes
                            promocodes={promocodes}
                            deletePromo={this.deletePromo}
                            onChangePromo={this.onChangePromo}
                          />
                          <Button
                            type="primary"
                            onClick={this.addPromo}
                            style={{ marginTop: '15px' }}
                          >
                            Add Promocode
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </div>
              </TabPane>
              <TabPane tab={formatMessage({ id: 'PMT.Statistics' })} key={2}>
                <div className={styles.list}>
                  <div className="utils__title utils__title--flat mb-3">
                    <strong>{formatMessage({ id: 'PMT.Statistics' })}</strong>
                  </div>
                  <Row gutter={[8, 8]}>
                    {statistics.map((item, i) => {
                      const actionData = (
                        <span style={{ color: item.actionDataColor }}>{item.actionData}</span>
                      )
                      if (i > 2) return
                      return (
                        <Col span={8} key={item.label}>
                          <div style={{ height: '100%' }} className="card card--fullHeight">
                            <div className="card-body">
                              <StatisticPMT
                                key={item?.label}
                                label={item?.label}
                                value={item?.value}
                                digits={item?.digits}
                                suffix={item?.suffix}
                                actionData={actionData}
                                i={i}
                              />
                            </div>
                          </div>
                        </Col>
                      )
                    })}
                  </Row>
                  <Row gutter={[8, 8]}>
                    {statistics.map((item, i) => {
                      const actionData = (
                        <span style={{ color: item.actionDataColor }}>{item.actionData}</span>
                      )
                      if (i < 3 || i > 8) return
                      return (
                        <Col span={4} key={item.label}>
                          <div style={{ height: '100%' }} className="card card--fullHeight">
                            <div className="card-body">
                              <StatisticPMT
                                key={item?.label}
                                label={item?.label}
                                value={item?.value}
                                digits={item?.digits}
                                suffix={item?.suffix}
                                actionData={actionData}
                                i={i}
                              />
                            </div>
                          </div>
                        </Col>
                      )
                    })}
                  </Row>
                  <Row gutter={[8, 8]}>
                    {statistics.map((item, i) => {
                      const actionData = (
                        <span style={{ color: item.actionDataColor }}>{item.actionData}</span>
                      )
                      if (i < 9 || i > 14) return
                      return (
                        <Col span={4} key={item.label}>
                          <div style={{ height: '100%' }} className="card card--fullHeight">
                            <div className="card-body">
                              <StatisticPMT
                                key={item?.label}
                                label={item?.label}
                                value={item?.value}
                                digits={item?.digits}
                                suffix={item?.suffix}
                                actionData={actionData}
                                i={i}
                              />
                            </div>
                          </div>
                        </Col>
                      )
                    })}
                  </Row>
                </div>

                <Row>
                  <Col span={24}>
                    <div className="card">
                      <div className="card-header">
                        <div className="utils__title">
                          <strong>{formatMessage({ id: 'PMT.FinanceStats' })}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }} className="card-body">
                        <Row gutter={[16, 16]}>
                          {statistics.map((item, i) => {
                            if (i <= 14) return
                            const actionData = (
                              <span style={{ color: item.actionDataColor }}>{item.actionData}</span>
                            )
                            return (
                              <Col span={4} key={item.label}>
                                <div
                                  style={{
                                    padding: '10px',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '4px',
                                  }}
                                >
                                  <StatisticPMT
                                    key={item?.label}
                                    label={item?.label}
                                    value={item?.value}
                                    digits={item?.digits}
                                    suffix={item?.suffix}
                                    actionData={actionData}
                                    i={i}
                                  />
                                </div>
                              </Col>
                            )
                          })}
                        </Row>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Authorize>
    )
  }
}

export default PriceModelingTool
