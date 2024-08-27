import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useTranslation } from 'react-i18next';
import { Popover, Token } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import { useRef, useState } from 'react';

export const ServiceAccountTokenStatus = ({
  automount,
}: {
  automount: boolean;
}) => {
  const { t } = useTranslation();
  const [openPopover, setOpenPopover] = useState(false);
  const popoverRef = useRef<any>(null);
  const openerRef = useRef(null);

  const handleOpenerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (popoverRef.current) {
      popoverRef.current.opener = openerRef.current;
      setOpenPopover(prev => !prev);
    }
  };

  const accountTokenValues = automount
    ? {
        type: 'Warning',
        tooltipContent: t(
          'service-accounts.auto-mount-token.descriptions.enabled',
        ),
        status: t('service-accounts.auto-mount-token.enabled'),
      }
    : {
        type: 'Neutral',
        tooltipContent: t(
          'service-accounts.auto-mount-token.descriptions.disabled',
        ),
        status: t('service-accounts.auto-mount-token.disabled'),
      };

  const tokenElement = (
    <button ref={openerRef} onClick={handleOpenerClick} className="badge-wrap">
      <Token
        style={{ textTransform: 'capitalize' }}
        text={accountTokenValues.status}
        readonly
      ></Token>
    </button>
  );

  return automount ? (
    <StatusBadge
      type={accountTokenValues.type}
      tooltipContent={accountTokenValues.tooltipContent}
    >
      {accountTokenValues.status}
    </StatusBadge>
  ) : (
    <>
      {createPortal(
        <Popover
          ref={popoverRef}
          open={openPopover}
          onAfterClose={e => {
            e.stopPropagation();
            setOpenPopover(false);
          }}
          placementType="Right"
        >
          {accountTokenValues.tooltipContent}
        </Popover>,
        document.body,
      )}
      {tokenElement}
    </>
  );
};
