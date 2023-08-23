import renderer from 'react-test-renderer';
import { LayoutPanel } from 'fundamental-react';
import { mount, shallow } from 'enzyme';

import { CollapsiblePanel } from 'shared/components/CollapsiblePanel/CollapsiblePanel';
import { Button } from '@ui5/webcomponents-react';

describe('Collapsible Panel', () => {
  const exceptPanelVisible = (component, isVisible) => {
    const body = component.find(LayoutPanel.Body);
    expect(body.hasClass('body--closed')).toBe(!isVisible);
    expect(body.hasClass('body--open')).toBe(isVisible);
  };

  it('Renders with minimal props (opened state)', () => {
    const component = renderer.create(
      <CollapsiblePanel
        children={<p>test</p>}
        title="Collapsible panel test"
      />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('Renders in closed state', () => {
    const component = renderer.create(
      <CollapsiblePanel
        children={<p>test</p>}
        title="Collapsible panel test"
        isOpenInitially={false}
      />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('Applies custom class names to Panel', () => {
    const component = shallow(
      <CollapsiblePanel
        children={<p>test</p>}
        title="Collapsible panel"
        className="test-class-name"
      />,
    );
    expect(component.find(LayoutPanel).hasClass('test-class-name')).toBe(true);
  });

  it('Is initially closed when isOpenInitially is false', () => {
    const component = shallow(
      <CollapsiblePanel
        children={<p>test</p>}
        title="Collapsible panel"
        isOpenInitially={false}
      />,
    );

    expect(component.find(LayoutPanel.Body).hasClass('body body--closed')).toBe(
      true,
    );
    expect(component.find(LayoutPanel.Body).hasClass('body body--open')).toBe(
      false,
    );
  });

  it('Opens and closes (chevron)', async () => {
    const component = mount(
      <CollapsiblePanel children={<p>test</p>} title="Collapsible panel" />,
    );
    const button = component.find(LayoutPanel.Header);

    // initially opened
    exceptPanelVisible(component, true);

    // close
    button.simulate('click');
    await component.update();
    exceptPanelVisible(component, false);

    // open again
    button.simulate('click');
    await component.update();
    exceptPanelVisible(component, true);
  });

  it('Opens and closes (header)', async () => {
    const component = mount(
      <CollapsiblePanel children={<p>test</p>} title="Collapsible panel" />,
    );
    const header = component.find(LayoutPanel.Header);

    // initially opened
    exceptPanelVisible(component, true);

    // close
    header.simulate('click');
    await component.update();
    exceptPanelVisible(component, false);

    // open again
    header.simulate('click');
    await component.update();
    exceptPanelVisible(component, true);
  });

  it('Does not open modal when clicking on custom actions', async () => {
    const child = <p>test</p>;
    const component = mount(
      <CollapsiblePanel
        children={child}
        title="Collapsible panel"
        actions={
          <Button id="action-button" onClick={() => {}}>
            test
          </Button>
        }
      />,
    );

    const button = component.find('ui5-button');

    // close
    button.simulate('click');
    await component.update();

    // expect it's still opened
    exceptPanelVisible(component, true);
  });
});
