import React from 'react';
import PropTypes from 'prop-types';
import MoreButton from '../../ui-kit/Buttons/MoreButton';

const MoreLeagues = ({ showMoreLeagues }) => (
  <MoreButton
    onClick={showMoreLeagues}
    withArrow
    data-cy="league-picker-show-more"
  >
    Ещё лиги
  </MoreButton>
);

MoreLeagues.propTypes = {
  showMoreLeagues: PropTypes.func.isRequired,
};

export default React.memo(MoreLeagues);
