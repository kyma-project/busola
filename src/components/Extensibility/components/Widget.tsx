import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { useGetPlaceholder, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { valuePreprocessors, widgets } from './index';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';

export const SimpleRenderer = ({ children }: { children: ReactNode }) => {
  return children;
};
SimpleRenderer.copyable = true;

type InlineWidgetProps = {
  children?: ReactNode;
  value?: any;
  structure: any;
  [key: string]: any;
};

export function InlineWidget({
  children,
  value,
  structure,
  ...props
}: InlineWidgetProps) {
  const { widgetT } = useGetTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  let displayValue;
  if (!isNil(children)) {
    displayValue = children;
  } else if (!isNil(value)) {
    displayValue = value;
  } else {
    displayValue = emptyLeafPlaceholder;
  }

  return (
    <LayoutPanelRow name={widgetT(structure)} value={displayValue} {...props} />
  );
}
InlineWidget.copyable = (Renderer: any) => Renderer?.copyable;
InlineWidget.copyFunction = (
  props: any,
  Renderer: any,
  defaultCopyFunction: any,
) =>
  Renderer?.copyFunction
    ? Renderer.copyFunction(props, Renderer, defaultCopyFunction)
    : defaultCopyFunction(props, Renderer, defaultCopyFunction);

const defaultCopyFunction = ({ value }: any) =>
  typeof value === 'object' ? JSON.stringify(value) : value;

const CopyableWrapper = memo(function CopyableWrapper({
  children,
  Renderer,
  originalResource,
  singleRootResource,
  embedResource,
  scope,
  value,
  arrayItems,
  structure,
}: any) {
  const isRendererCopyable = useMemo(() => {
    return typeof Renderer.copyable === 'function'
      ? Renderer.copyable(Renderer)
      : Renderer.copyable;
  }, [Renderer]);

  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource,
    scope: value ?? scope,
    arrayItems,
  });
  const [textToCopy, setTextToCopy] = useState('');

  const copyFunction = useCallback(
    (
      { value, structure }: any,
      Renderer: any,
      defaultCopyFunction: any,
      linkObject: any,
    ) =>
      typeof Renderer.copyFunction === 'function'
        ? Renderer.copyFunction(
            { value, structure },
            Renderer,
            defaultCopyFunction,
            linkObject,
          )
        : defaultCopyFunction(
            { value, structure },
            Renderer,
            defaultCopyFunction,
            linkObject,
          ),
    [],
  );

  useEffect(() => {
    if (!structure?.copyable || !isRendererCopyable) return;
    jsonata(structure?.link).then((linkObject: any) => {
      setTextToCopy(
        copyFunction(
          { value, structure },
          Renderer,
          defaultCopyFunction,
          linkObject,
        ),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    structure?.link,
    structure?.copyable,
    isRendererCopyable,
    originalResource,
    singleRootResource,
    embedResource,
    scope,
    value,
    arrayItems,
    copyFunction,
    jsonata,
  ]);

  if (!structure?.copyable || !isRendererCopyable) return children;

  return (
    <CopiableText textToCopy={textToCopy} disabled={!textToCopy}>
      {children}
    </CopiableText>
  );
});

const SingleWidget = memo(function SingleWidget({
  inlineRenderer,
  Renderer,
  ...props
}: any) {
  const InlineRenderer = inlineRenderer || SimpleRenderer;

  return Renderer.inline ? (
    <InlineRenderer {...props}>
      <CopyableWrapper {...props} Renderer={Renderer}>
        <Renderer {...props} />
      </CopyableWrapper>
    </InlineRenderer>
  ) : (
    <Renderer {...props} />
  );
});

export type Structure = {
  id: string;
  title: string;
  description: string;
  illustration: string;
  design: string;
  source: string;
  visibility: boolean;
  widget?: keyof typeof widgets;
  valuePreprocessor?: any;
  children?: Structure[];
};

export type WidgetProps = {
  structure: Structure;
  value?: any;
  arrayItems?: any[];
  inlineRenderer?: any;
  originalResource?: any;
  singleRootResource?: any;
  embedResource?: any;
  index?: number;
  [key: string]: any;
};

export function Widget({
  structure,
  value,
  arrayItems = [],
  inlineRenderer,
  originalResource,
  singleRootResource,
  embedResource,
  index,
  ...props
}: WidgetProps) {
  const { Plain, Text } = widgets;
  const { t } = useTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope: value,
    arrayItems,
  });

  const [childValue, setChildValue] = useState<any>(null);
  const [visible, setVisible] = useState<any>(true);
  const [visibilityError, setVisibilityError] = useState<any>(null);

  const stableStructure = useMemo(
    () => structure,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [structure?.source, structure?.visibility],
  );
  const stableIndex = useMemo(() => index, [index]);
  const stableValue = useMemo(() => value, [value]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableArrayItems = useMemo(() => arrayItems, [arrayItems?.length]);

  useEffect(() => {
    let canceled = false;

    const setStatesFromJsonata = async () => {
      const [evaluatedChildValue] = await jsonata(stableStructure.source, {
        index: stableIndex,
      });
      const [result, error] = await jsonata(
        stableStructure.visibility?.toString(),
        { value: evaluatedChildValue },
        true,
      );
      if (canceled) return;
      setChildValue(evaluatedChildValue);
      setVisible(result);
      setVisibilityError(error);
    };

    setStatesFromJsonata();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stableStructure,
    stableIndex,
    stableValue,
    stableArrayItems,
    originalResource,
    singleRootResource,
    embedResource,
  ]);

  if (visibilityError) {
    return t('extensibility.configuration-error', {
      error: visibilityError.message,
    });
  }

  if (visible === false) return null;

  if (structure.valuePreprocessor) {
    const Preprocessor = (valuePreprocessors as any)[
      structure.valuePreprocessor
    ];
    const copiedStructure = JSON.parse(JSON.stringify(structure));
    copiedStructure.valuePreprocessor = null;
    return (
      <Preprocessor
        value={childValue}
        structure={copiedStructure}
        inlineRenderer={inlineRenderer}
        originalResource={originalResource}
        singleRootResource={singleRootResource}
        embedResource={embedResource}
        {...props}
      />
    );
  }

  if (Array.isArray(structure)) {
    return (
      <Plain
        value={value}
        structure={{ children: structure }}
        originalResource={originalResource}
        {...props}
      />
    );
  }
  let Renderer = structure.children ? Plain : Text;
  if (structure.widget) {
    Renderer = widgets[structure.widget] as any;
    if (!Renderer) {
      return `no widget ${structure.widget}`;
    }
  }

  const sanitizedValue = stringifyIfBoolean(childValue);

  if (sanitizedValue?.loading) {
    return null;
  }
  return Array.isArray(sanitizedValue) && !(Renderer as any).array ? (
    sanitizedValue.map((valueItem: any, index: number) => (
      <SingleWidget
        key={index}
        {...props}
        inlineRenderer={inlineRenderer}
        Renderer={Renderer}
        value={valueItem}
        arrayItems={[...arrayItems, valueItem]}
        structure={structure}
        originalResource={originalResource}
        singleRootResource={valueItem}
        embedResource={embedResource}
        scope={valueItem}
      />
    ))
  ) : (
    <SingleWidget
      {...props}
      inlineRenderer={inlineRenderer}
      Renderer={Renderer}
      value={sanitizedValue}
      scope={value}
      arrayItems={arrayItems}
      structure={structure}
      originalResource={originalResource}
      singleRootResource={singleRootResource || originalResource}
      embedResource={embedResource}
    />
  );
}
