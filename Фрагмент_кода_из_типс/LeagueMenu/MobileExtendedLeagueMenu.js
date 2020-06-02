import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { forceCheck } from 'react-lazyload';

import { ModalContent, ModalHeader, Modal } from 'ui-kit/Modal';
import LeagueMenuExtendedItem from 'components/LeagueMenu/LeagueMenuExtendedItem';

import { ALL_LEAGUES } from 'constants/common';

import 'components/LeagueMenu/styles/MobileExtendedLeagueMenu.scss';

class MobileExtendedLeagueMenu extends React.PureComponent {
  modalRef = React.createRef();

  componentDidMount() {
    if (!this.modalRef.current) {
      this.forceUpdate();
    } else {
      this.registerEvent();
    }
  }

  componentDidUpdate() {
    this.registerEvent();
  }

  componentWillUnmount() {
    this.modalRef.current.removeEventListener('scroll', forceCheck);
  }

  registerEvent() {
    if (this.modalRef.current) {
      setTimeout(() => {
        forceCheck();
      }, 250);
      this.modalRef.current.addEventListener('scroll', forceCheck);
    }
  }

  render() {
    const {
      items, selected, onCloseClick, match, handleClickLeague, hideLeagueList,
    } = this.props;

    const menuItems = items.map(item => (
      <LeagueMenuExtendedItem
        {...item}
        handleClickLeague={handleClickLeague}
        match={match}
        key={item.id}
        isSelected={item.slug === selected}
      />
    ));

    return ReactDom.createPortal((
      <Modal
        onCloseClick={onCloseClick}
        isOpen
      >
        <ModalHeader onCloseClick={hideLeagueList}>
          <div className="title">
            <span>ВСЕ ЛИГИ</span>
          </div>
        </ModalHeader>
        <ModalContent>
          <div className="mobile-league-menu">
            <div data-cy="content-scroll" ref={this.modalRef} className="content__scroll">
              <div className="content">
                {menuItems}
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
    ), document.body);
  }
}

MobileExtendedLeagueMenu.propTypes = {
  handleClickLeague: PropTypes.func,
  hideLeagueList: PropTypes.func,
  isShowingMore: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.any),
  match: PropTypes.shape({}),
  onCloseClick: PropTypes.func,
  selected: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
MobileExtendedLeagueMenu.defaultProps = {
  handleClickLeague: () => {},
  hideLeagueList: () => {},
  isShowingMore: true,
  items: [],
  match: {},
  selected: ALL_LEAGUES,
  onCloseClick: () => {},
};

export default MobileExtendedLeagueMenu;
