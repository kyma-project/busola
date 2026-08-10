import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useContext, useEffect } from 'react';
import { fromJS } from 'immutable';
import { scopePaths, TriggerContext, TriggerContextProvider } from '../Trigger';

type TriggerContextValue = React.ContextType<typeof TriggerContext>;

// Defined at module level so React sees the same component type across rerenders.
const ContextCapture = ({
  boxRef,
}: {
  boxRef: { current: TriggerContextValue };
}) => {
  const value = useContext(TriggerContext);
  useEffect(() => {
    boxRef.current = value;
  });
  return null;
};

const makeTree = () => {
  const ctxBox: { current: TriggerContextValue } = {
    current: {} as TriggerContextValue,
  };
  return {
    tree: (
      <TriggerContextProvider>
        <ContextCapture boxRef={ctxBox} />
      </TriggerContextProvider>
    ),
    ctx: () => ctxBox.current,
  };
};

// Creates a subscriber object for the given event name.
// The shape matches what trigger() reads: sub.current[name].{storeKeys, modifiers, callback}
const makeSub = (
  name: string,
  storeKeys: any,
  modifiers: string[],
  callback: () => void,
) => ({
  current: {
    [name]: { storeKeys, modifiers, callback },
  },
});

describe('scopePaths', () => {
  it('returns only the root path for empty storeKeys', () => {
    expect(scopePaths(fromJS([]) as any)).toEqual(['']);
  });

  it('returns only the root path when storeKeys has no numeric indexes', () => {
    expect(scopePaths(fromJS(['field', 'subfield']) as any)).toEqual(['']);
  });

  it('returns root and the indexed path for a single numeric index', () => {
    expect(scopePaths(fromJS(['items', 0, 'name']) as any)).toEqual([
      '',
      'items.0',
    ]);
  });

  it('returns root and all accumulated indexed paths for multiple numeric indexes', () => {
    expect(scopePaths(fromJS(['a', 0, 'b', 1, 'c']) as any)).toEqual([
      '',
      'a.0',
      'a.0.b.1',
    ]);
  });
});

describe('TriggerContextProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('provides enabled=true by default', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      expect(ctx().enabled).toBe(true);
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('increases subs count when a subscriber is added', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const sub = makeSub('onChange', fromJS([]) as any, [], vi.fn());
      act(() => {
        ctx().subscribe(sub);
      });
      expect(ctx().subs.current).toHaveLength(1);
    });

    it('removes the subscriber when unsubscribe is called with its identifier', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const identifier = {};
      const sub = {
        sub: identifier,
        current: {
          onChange: {
            storeKeys: fromJS(['items', 0]) as any,
            modifiers: [],
            callback: vi.fn(),
          },
        },
      };
      act(() => {
        ctx().subscribe(sub);
      });
      expect(ctx().subs.current).toHaveLength(1);
      act(() => {
        ctx().unsubscribe(identifier as any);
      });
      expect(ctx().subs.current).toHaveLength(0);
    });
  });

  describe('trigger', () => {
    it('calls the callback when the event name and path match', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      act(() => {
        ctx().subscribe(
          makeSub('onChange', fromJS(['items', 0]) as any, [], callback),
        );
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['items', 0]) as any);
      });
      vi.runAllTimers();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not call the callback when the event name does not match', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      act(() => {
        ctx().subscribe(
          makeSub('onBlur', fromJS(['items', 0]) as any, [], callback),
        );
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['items', 0]) as any);
      });
      vi.runAllTimers();
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not call the callback when the trigger path is at a different array index', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      act(() => {
        ctx().subscribe(
          makeSub('onChange', fromJS(['items', 1]) as any, [], callback),
        );
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['items', 0]) as any);
      });
      vi.runAllTimers();
      expect(callback).not.toHaveBeenCalled();
    });

    it('only calls the matching subscriber when multiple are registered', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const cb0 = vi.fn();
      const cb1 = vi.fn();
      act(() => {
        ctx().subscribe(
          makeSub('onChange', fromJS(['items', 0]) as any, [], cb0),
        );
        ctx().subscribe(
          makeSub('onChange', fromJS(['items', 1]) as any, [], cb1),
        );
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['items', 0]) as any);
      });
      vi.runAllTimers();
      expect(cb0).toHaveBeenCalledTimes(1);
      expect(cb1).not.toHaveBeenCalled();
    });

    it('does not call the callback when the context is disabled', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      act(() => {
        ctx().subscribe(
          makeSub('onChange', fromJS(['items', 0]) as any, [], callback),
        );
      });
      await act(async () => {
        ctx().disable();
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['items', 0]) as any);
      });
      vi.runAllTimers();
      expect(callback).not.toHaveBeenCalled();
    });

    it('calls the callback again after the context is re-enabled', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      act(() => {
        ctx().subscribe(
          makeSub('onChange', fromJS(['items', 0]) as any, [], callback),
        );
      });
      await act(async () => {
        ctx().disable();
      });
      await act(async () => {
        ctx().enable();
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['items', 0]) as any);
      });
      vi.runAllTimers();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('matches any trigger path when the $root modifier is used', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      // subscriber at a deep nested path but with $root — it should fire for any trigger
      act(() => {
        ctx().subscribe(
          makeSub(
            'onChange',
            fromJS(['a', 0, 'b', 1, 'c']) as any,
            ['$root'],
            callback,
          ),
        );
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['other', 2, 'field']) as any);
      });
      vi.runAllTimers();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('matches the parent array scope when the $parent modifier is used', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      // subscriber at ['a', 0, 'b', 1, 'c']; $parent resolves its scope one level up to 'a.0'
      act(() => {
        ctx().subscribe(
          makeSub(
            'onChange',
            fromJS(['a', 0, 'b', 1, 'c']) as any,
            ['$parent'],
            callback,
          ),
        );
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['a', 0, 'x']) as any);
      });
      vi.runAllTimers();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not match a sibling array scope when the $parent modifier is used', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      const callback = vi.fn();
      // subscriber resolves to 'a.0' via $parent — should not fire for index 1
      act(() => {
        ctx().subscribe(
          makeSub(
            'onChange',
            fromJS(['a', 0, 'b', 1, 'c']) as any,
            ['$parent'],
            callback,
          ),
        );
      });
      act(() => {
        ctx().trigger('onChange', fromJS(['a', 1, 'x']) as any);
      });
      vi.runAllTimers();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('disable / enable', () => {
    it('sets enabled to false when disable is called', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      await act(async () => {
        ctx().disable();
      });
      expect(ctx().enabled).toBe(false);
    });

    it('sets enabled back to true when enable is called after disable', async () => {
      const { tree, ctx } = makeTree();
      await act(async () => {
        render(tree);
      });
      await act(async () => {
        ctx().disable();
      });
      await act(async () => {
        ctx().enable();
      });
      expect(ctx().enabled).toBe(true);
    });
  });
});
