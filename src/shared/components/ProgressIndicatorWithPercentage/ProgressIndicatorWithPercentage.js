import { ProgressIndicator } from '@ui5/webcomponents-react';
import PropTypes from 'prop-types';
import './ProgressIndicatorWithPercentage.scss';

export const ProgressIndicatorWithPercentage = ({ title, value }) => {
  return (
    <div className="progress-indicator-percentage">
      <p className="progress-indicator-percentage__percents">{value}%</p>
      <ProgressIndicator displayValue={title} value={value} />
    </div>
  );
};

ProgressIndicatorWithPercentage.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number,
};
