import React from 'react';
import styled from 'styled-components';

const FilterHeader = styled.div`
  font-family: '72';
  font-size: 12px;
  font-weight: 300;
  text-align: left;
  color: rgba(63, 80, 96, 0.6);
  padding: 10px 0;
  text-transform: uppercase;
`;

const Items = styled.ul`
  margin: 0;
  padding: 0;
`;
//TODO: Move to constans
const ACTIVE_COLOR = '#167ee6';
const Item = styled.li`
  display: block;
  padding: 10px 0;
`;

const Link = styled.a`
  color: ${props => (props.active ? ACTIVE_COLOR : '#32363a')};
  font-family: '72';
  font-size: 14px;
  font-weight: normal;
  font-weight: normal;
  :hover {
    color: ${ACTIVE_COLOR};
    cursor: pointer;
  }
`;

const Filter = ({ name, items = [], activeValue, onChange }) => {
  const onFilterClick = value => {
    return onChange(name, value);
  };

  return (
    <div>
      <FilterHeader data-e2e-id={`filter-header-${name}`}>
        Filter by {name}
      </FilterHeader>
      <Items data-e2e-id={`filter-items-by-${name}`}>
        {items.map(item => {
          const count = typeof item.count === 'number' ? `(${item.count})` : '';
          const active = activeValue === item.value;
          return (
            <Item key={item.name} data-e2e-id="filter-item">
              <Link active={active} onClick={() => onFilterClick(item.value)}>
                {item.name} {count}
              </Link>
            </Item>
          );
        })}
      </Items>
    </div>
  );
};

export default Filter;
