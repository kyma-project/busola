import styled from 'styled-components';
import { Dialog } from 'fundamental-react';

export const ModalWrapper = styled.div`
  display: inline-block;
`;

export const FdModal = styled(Dialog)`
  && {
    .fd-modal {
      max-width: unset;
    }

    .fd-modal__content {
      min-width: 320px;
      width: ${props => props.width || 'unset'};
      border-left: ${props =>
        props.type === 'negative' ? '6px solid #ee0000' : ''};
    }

    .fd-modal__footer {
      border-top: none;
    }
  }
`;
