import { Button } from '@ui5/webcomponents-react';
import copyToClipboard from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../Tooltip/Tooltip';
import { useState } from 'react';

interface TooltipWrapperProps {
  children: any;
  trigger: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  content: string;
  tippyProps?: {
    arrow?: boolean;
    distance?: number;
    open?: boolean;
  };
  className?: string;
}

const TooltipWrapper = ({
  children,
  trigger,
  position,
  content,
  tippyProps = {},
  className,
}: TooltipWrapperProps) => {
  return (
    <Tooltip
      trigger={trigger}
      position={position}
      content={content}
      tippyProps={tippyProps}
      aria-live="polite"
      className={className}
    >
      {children}
    </Tooltip>
  );
};

interface CopyButtonProps {
  contentToCopy: string;
  buttonClassName?: string;
  resourceName?: string;
  iconOnly?: boolean;
  tooltipClassName?: string;
}

const CopyButton = ({
  contentToCopy,
  buttonClassName,
  resourceName,
  iconOnly = true,
  tooltipClassName,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = () => {
    copyToClipboard(contentToCopy);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <TooltipWrapper
      className={tooltipClassName}
      trigger="manual"
      position="bottom"
      content={t('common.tooltips.copied-to-clipboard', { resourceName })}
      tippyProps={{
        arrow: true,
        distance: 15,
        open: iconOnly && copied,
      }}
    >
      <Button
        design="Transparent"
        icon="copy"
        onClick={() => handleCopy()}
        className={buttonClassName}
        tooltip={t('common.tooltips.copy-to-clipboard')}
        aria-label={
          iconOnly
            ? copied
              ? t('common.tooltips.copied-to-clipboard', { resourceName })
              : t('common.tooltips.copy-to-clipboard')
            : ''
        }
        aria-live={iconOnly ? 'polite' : undefined}
      >
        {!iconOnly
          ? copied
            ? t('common.buttons.copied')
            : t('common.buttons.copy')
          : null}
      </Button>
    </TooltipWrapper>
  );
};

export default CopyButton;
