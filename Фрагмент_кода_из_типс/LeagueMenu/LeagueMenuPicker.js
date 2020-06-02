import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter, generatePath } from 'react-router-dom';
import moment from 'moment';

import LeagueMenuPickerItem from './LeagueMenuPickerItem';
import { moveActiveElementToSecondPlace } from '../../utils/helpers';
import MoreLeaguesModal from '../MatchCenter/MoreLeaguesModal';
import MoreLeagues from './MoreLeaguesBtn';
import ScrollWrapper from '../ScrollWrapper';
import {
  matchType, menuType, historyType,
} from '../../utils/types';
import MobileExtendedLeagueMenu from './MobileExtendedLeagueMenu';
import { allMatches } from '../Calendar/constant';
import * as leaguesActions from '../../reduxStore/actions/leagues';
import * as eventsActions from '../../reduxStore/actions/events';
import { DATE_PICKER_MAX_DAYS } from '../../constants/common';
import { LEAGUE_ROUTE_NAME } from '../../constants/routeNames';

import './styles/LeagueMenuPicker.scss';

/**
 * Комопнент выбора лиг для матч-центра
 */
@withRouter
@connect(
  state => ({
    isShowingMore: state.header.isShowingMore,
    selectedSport: state.filters.selectedSport,
    sports: state.filters.sports,
  }),
  {
    updateSelectedLeague: leaguesActions.updateSelectedLeague,
    fetchLeaguesMenu: leaguesActions.fetchLeaguesMenu,
    fetchMatchByLeague: eventsActions.fetchMatchByLeagueAction,
  },
)
class LeagueMenuPicker extends React.PureComponent {
  static propTypes = {
    dateFilter: PropTypes.shape({
      from: PropTypes.any,
      to: PropTypes.any,
      id: PropTypes.any,
    }),
    fetchLeagueEvents: PropTypes.func,
    fetchLeaguesMenu: PropTypes.func.isRequired,
    fetchMatchByLeague: PropTypes.func.isRequired,
    isAfterSSR: PropTypes.bool,
    isMobile: PropTypes.bool,
    isShowingMore: PropTypes.bool,
    loading: PropTypes.shape({}),
    localDateFilter: PropTypes.shape({
      from: PropTypes.any,
      to: PropTypes.any,
      id: PropTypes.any,
    }),
    menu: menuType.isRequired,
    match: matchType.isRequired,
    history: historyType.isRequired,
    selectedSport: PropTypes.string,
    setFilterDate: PropTypes.func,
    setLocalFilterDate: PropTypes.func,
    toggle: PropTypes.func,
    // Функция устанавливающая флаг, что модальное окно открыто
    updateSelectedLeague: PropTypes.func.isRequired,
  };

  static defaultProps = {
    dateFilter: {},
    fetchLeagueEvents() {},
    isAfterSSR: true,
    isMobile: false,
    isShowingMore: false,
    loading: {},
    localDateFilter: {},
    selectedSport: 'football',
    setFilterDate() {},
    setLocalFilterDate() {},
    toggle() {},
  };

  state = {
    isModalOpen: false,
    leagues: {},
    prevDate: undefined,
    filterDate: {
      from: moment(),
      to: moment().add(DATE_PICKER_MAX_DAYS, 'days'),
      max: moment().add(DATE_PICKER_MAX_DAYS, 'days'),
      id: 3,
    },
    activeOptionId: null,
  };

  componentDidMount = () => {
    const { fetchLeaguesMenu } = this.props;
    fetchLeaguesMenu();
    this.fetchLeagueMenuItems();
  }

  fetchSSRData = () => {
    const { match, updateSelectedLeague } = this.props;
    const leagueName = match?.params?.slug;

    updateSelectedLeague(leagueName);
    return leaguesActions.fetchLeaguesMenu();
  }

  componentDidUpdate = (prevProps, prevState) => {
    const { filterDate } = this.state;
    const { selectedSport, fetchLeaguesMenu } = this.props;

    if (prevProps.selectedSport !== selectedSport) {
      this.fetchLeagueMenuItems();
    }
    if (prevState.filterDate !== filterDate) {
      fetchLeaguesMenu({ dateFilter: filterDate });
    }
  };

  /**
   * Получение данных о лигах за месяц. Для отрисовки меню
   */
  fetchLeagueMenuItems = async () => {
    const { selectedSport, fetchLeaguesMenu } = this.props;
    const { leagues } = this.state;

    if (leagues[selectedSport]) return;
    const { data } = await fetchLeaguesMenu({
      date: allMatches[0].date,
    }) || {};

    this.setState(prevState => ({
      leagues: {
        ...prevState.leagues,
        [selectedSport]: data,
      },
    }));
  }

  handleClickLeague = async (league) => {
    const { setFilterDate, setLocalFilterDate } = this.props;
    if (setLocalFilterDate) {
      await setLocalFilterDate(allMatches[0].date);
    } else {
      // Сбрасываем фильтр даты на "месяц"
      await setFilterDate(allMatches[0].date);
    }
    this.fetchLeagueEvents(league);
  };

  handleClickLeagueFromModal = (league) => {
    const { history, match } = this.props;

    history.push(generatePath(LEAGUE_ROUTE_NAME, {
      ...match.params,
      slug: league,
    }));
    this.fetchLeagueEvents(league);
    this.handleCloseModal(true);
  }

  /**
   * Получение данных о событиях лиги.
   */
  fetchLeagueEvents = async (league) => {
    const {
      fetchMatchByLeague, updateSelectedLeague, selectedSport, match,
    } = this.props;

    // Обновляем в сторе активную лигу
    await updateSelectedLeague(league);
    // Идем в апи за данными новой лиги
    fetchMatchByLeague({
      leagueSlug: league,
      sport: match?.params?.sport || selectedSport,
      dateFilter: allMatches[0].date,
      reset: true,
    });
  }

  handleOpenModal = () => {
    const {
      dateFilter, toggle, setFilterDate, setLocalFilterDate, localDateFilter,
    } = this.props;

    toggle();
    this.setState({
      isModalOpen: true,
      prevDate: localDateFilter || dateFilter,
    });
    if (setLocalFilterDate) {
      setLocalFilterDate(allMatches[0].date);
    } else {
      setFilterDate(allMatches[0].date);
    }
  }

  handleCloseModal = (needSave) => {
    const { prevDate } = this.state;
    const { setFilterDate, toggle } = this.props;

    setTimeout(toggle, 200);
    this.setState({ isModalOpen: false });
    if (needSave === true) {
      return;
    }

    // Action ожидает moment объекты
    const date = {
      from: moment(prevDate.from),
      to: moment(prevDate.to),
      max: moment(prevDate.max),
      id: prevDate.id,
    };
    setFilterDate(date);
  };

  setFilterDate = (date) => {
    const dateDiff = moment().diff(date.from, 'days', true);
    let id = null;
    if (dateDiff < 2 && dateDiff > 1) {
      id = 0;
    } else if (dateDiff < 1 && dateDiff > 0) {
      id = 1;
    } else if (dateDiff < 0 && dateDiff > -1) {
      id = 2;
    }
    this.setState({ filterDate: date, activeOptionId: id });
  };

  render() {
    const {
      isModalOpen, leagues, filterDate, activeOptionId,
    } = this.state;
    const {
      menu,
      selectedSport,
      isMobile,
      match,
      fetchLeaguesMenu,
      loading,
    } = this.props;
    const { data = [], selected } = menu;
    const leaguesBySport = leagues[selectedSport] || [];
    const activeLeague = match?.params?.slug || selected;

    // Чтобы активный элемент всегда был на втором месте.
    const activeLeagueIndex = data.findIndex(league => league?.slug === activeLeague);

    const modifiedData = activeLeagueIndex > 2
      ? moveActiveElementToSecondPlace(leaguesBySport, activeLeague)
      : leaguesBySport;

    return (
      <div className="league-menu-picker-wrap">
        <div className="league-menu-picker">
          <ScrollWrapper isMobile={isMobile}>
            <React.Fragment>
              <div className="league-menu-picker__items">
                {modifiedData.slice(0, isMobile ? 4 : 8).map(league => (
                  <LeagueMenuPickerItem
                    {...league}
                    match={match}
                    key={league.id}
                    isSelected={league.slug === activeLeague}
                    sport={match?.params?.sport || selectedSport}
                    handleClickLeague={this.handleClickLeague}
                  />
                ))}
                {isMobile && <MoreLeagues showMoreLeagues={this.handleOpenModal} />}
                {/* div нужен что бы компонент скрола позволил сделать отступ с правой стороны */}
                <div className="scroll-box__margin" />
              </div>
            </React.Fragment>
          </ScrollWrapper>
          {!isMobile && <MoreLeagues showMoreLeagues={this.handleOpenModal} />}
        </div>
        {isModalOpen && !isMobile && (
          <MoreLeaguesModal
            match={match}
            handleClickLeague={this.handleClickLeagueFromModal}
            hideLeagueList={this.handleCloseModal}
            leagues={menu}
            allLeague={leaguesBySport}
            selectedSport={selectedSport}
            fetchLeaguesMenu={fetchLeaguesMenu}
            loading={loading}
            setFilterDate={this.setFilterDate}
            filterDate={filterDate}
            activeOptionId={activeOptionId}
            onCloseClick={this.handleCloseModal}
            isModalOpen
          />
        )}
        {isModalOpen && isMobile && (
          <MobileExtendedLeagueMenu
            items={data}
            match={match}
            selected={selected}
            handleClickLeague={this.handleClickLeagueFromModal}
            isShowingMore={isModalOpen}
            hideLeagueList={this.handleCloseModal}
            isOpen
          />
        )}
      </div>
    );
  }
}

export default LeagueMenuPicker;
