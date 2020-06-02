import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pickBy from 'lodash/pickBy';

import CustomLink from 'components/CustomLink';
import { PROGNOZY } from 'constants/seoConstants';
import {
  HOME_PAGE_PROGNOZY_BY_SPORT, MATCH_CENTER_BY_LEAGUE, HOME_PAGE_PROGNOZY_BY_LEAGUE, MATCH_CENTER_BY_SPORT,
} from 'router';
import { ALL_LEAGUES } from 'constants/common';
import { resolveLeagueImage, isMatchCenterRoute } from '../../utils/helpers';
import LazyLoadWrapper from '../../ui-kit/LazyLoadWrapper';
import TeamLogo from '../../ui-kit/TeamLogo';
import { matchType } from '../../utils/types';

import './styles/LeagueMenuPickerItem.scss';

const LeagueMenuPickerItem = ({
  name,
  matchesCount,
  slug,
  isSelected,
  sport,
  isNoLazy,
  handleClickLeague,
  match,
  ...props
}) => {
  const logoUrl = resolveLeagueImage(props); // там уже лежат все нужные картинки

  const leagueMenuItemClassName = classNames(
    'league-menu-picker__item',
    { 'is-active': isSelected },
  );
  const formatedName = name.length > 25 ? `${name.slice(0, 23).trim()}…` : name;
  let routeName = '';
  const isAllLeaguesSlug = slug === ALL_LEAGUES;

  if (match.path === HOME_PAGE_PROGNOZY_BY_SPORT || match.path === HOME_PAGE_PROGNOZY_BY_LEAGUE) {
    routeName = isAllLeaguesSlug ? HOME_PAGE_PROGNOZY_BY_SPORT : HOME_PAGE_PROGNOZY_BY_LEAGUE;
  } else if (isMatchCenterRoute(match.path)) {
    routeName = isAllLeaguesSlug ? MATCH_CENTER_BY_SPORT : MATCH_CENTER_BY_LEAGUE;
  }
  const leagueSlug = isAllLeaguesSlug ? undefined : slug;

  const routeParams = pickBy({
    slug: leagueSlug,
    sport: sport || 'football',
    filter: PROGNOZY,
  }, val => Boolean(val));

  const onItemClick = () => {
    handleClickLeague(slug);
  };

  return (
    <CustomLink
      to={routeName}
      routeParams={routeParams}
      className={leagueMenuItemClassName}
      onClick={onItemClick}
      data-cy="league-picker-item"
    >
      <LazyLoadWrapper height={20} debounce={false} offsetVertical={500}>
        <TeamLogo src={logoUrl} />
      </LazyLoadWrapper>
      <span>{`${formatedName} (${matchesCount})`}</span>
    </CustomLink>
  );
};

LeagueMenuPickerItem.propTypes = {
  name: PropTypes.string,
  eventsCount: PropTypes.number,
  matchesCount: PropTypes.number,
  slug: PropTypes.string,
  handleClickLeague: PropTypes.func,
  isNoLazy: PropTypes.bool,
  isSelected: PropTypes.bool,
  match: matchType,
  sport: PropTypes.string,
};
LeagueMenuPickerItem.defaultProps = {
  name: 'Все матчи',
  eventsCount: 0,
  slug: ALL_LEAGUES,
  matchesCount: 0,
  handleClickLeague() {},
  isNoLazy: false,
  isSelected: false,
  match: {},
  sport: 'football',
};

export default React.memo(LeagueMenuPickerItem);
