import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LazyLoad from 'react-lazyload';

import { ALL_LEAGUES } from 'constants/common';
import { resolveLeagueImage } from 'utils/helpers';

import './styles/LeagueMenuExtendedItem.scss';

class LeagueMenuExtendedItem extends React.PureComponent {
  onItemClick = () => {
    const { handleClickLeague, slug } = this.props;
    handleClickLeague(slug);
  };

  render = () => {
    const {
      name, isSelected, matchesCount, slug, ...props
    } = this.props;

    const logoUrl = resolveLeagueImage(props);

    const leagueMenuItemClassName = classNames(
      'league-menu__item--extended',
      { 'is-active': isSelected },
    );

    return (
      <div onClick={this.onItemClick} className={leagueMenuItemClassName} data-cy="extended-league-menu-item">
        <LazyLoad offset={200}>
          <img src={logoUrl} alt={name} className="item-logo" />
        </LazyLoad>
        <span className="item-name">{name} ({matchesCount})</span>
      </div>
    );
  }
}

LeagueMenuExtendedItem.propTypes = {
  name: PropTypes.string,
  isSelected: PropTypes.bool,
  handleClickLeague: PropTypes.func,
  eventsCount: PropTypes.number,
  matchesCount: PropTypes.number,
  slug: PropTypes.string,
};
LeagueMenuExtendedItem.defaultProps = {
  name: '',
  handleClickLeague() {},
  isSelected: false,
  eventsCount: 0,
  matchesCount: 0,
  slug: ALL_LEAGUES,
};

export default LeagueMenuExtendedItem;
