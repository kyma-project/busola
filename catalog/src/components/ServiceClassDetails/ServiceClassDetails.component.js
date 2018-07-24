import React, { Component } from 'react';
import Moment from 'react-moment';
import styled from 'styled-components';
import { Button, Header, Separator, Text, Toolbar, Icon } from '@kyma-project/react-components';
import ColumnsWrapper from '../ColumnsWrapper/ColumnsWrapper.component';
import { media } from '@kyma-project/react-components';
import {
  sortDocumentsByType,
  getDocumentsTypes,
  getResourceDisplayName,
} from '../../commons/helpers';
import Apiconsole from '..//SwaggerApireference/SwaggerApireference.component';
import Events from '../Events/Events.component';
import Tabs from '../Tabs/Tabs.component';
import TabContent from '../Tabs/TabContent.component';
import Modal from '../Modal/Modal.container';
// import testData from './testData';

//variables used for testing cluster-like forms. It should stay for a while :)
// const testServiceClass = {
//   ...testData[1],
// };

const LeftSideWrapper = styled.div`
  box-sizing: border-box;
  width: 300px;
  padding: 30px;
  text-align: left;
  flex: 0 0 auto;
  ${media.phone`
    width: 100%;
    flex: 1 1 100%;
  `};
`;

const CenterSideWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 30px 30px 0 0;
  text-align: left;
  flex: 1 1 auto;
  ${media.phone`
    padding: 30px;
    width:100%;
  `} ${media.tablet`
    width:100%;
    padding-right: 30px;
  `};
`;

const ContentWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  margin: 0 0 20px 0;
  text-align: left;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.08);
  font-family: '72';
  width: 100%;
  font-weight: normal;
`;

const ContentHeader = styled.div`
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  line-height: 1.19;
  padding: 16px 20px;
`;

const ContentDescription = styled.div`
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 20px;
`;

const ImagePlaceholder = styled.div`
  width: 90px;
  height: 90px;
  margin-right: 20px;
  line-height: 90px;
  text-align: center;
  border-radius: 4px;
  background-color: #00b6ff;
  color: #ffffff;
  font-size: 25px;
`;

const ServiceTitle = styled.h3`
  font-family: '72';
  font-size: 16px;
  font-weight: normal;
  color: #32363a;
  margin: 0;
`;

const ServiceProvider = styled.p`
  font-family: '72';
  font-size: 14px;
  font-weight: 300;
  color: #b2b9bf;
  margin: 5px 0;
`;

class ServiceClassDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: null,
      openModal: false,
    };
  }

  componentDidUpdate() {
    const { serviceClass } = this.props;

    if (!serviceClass.loading && serviceClass.serviceClass) {
      if (!this.state.active) {
        // const activeTab = serviceClass.serviceClass.content.asyncApiSpec ? 'Events'
        let activeTab =
          serviceClass.serviceClass.content &&
          serviceClass.serviceClass.content.docs &&
          serviceClass.serviceClass.content.docs[0].type;

        if (!activeTab) {
          activeTab =
            serviceClass.serviceClass.content &&
            serviceClass.serviceClass.content.Docs &&
            serviceClass.serviceClass.content.Docs[0].Type;
        }

        if (!activeTab) {
          if (serviceClass.serviceClass.apiSpec) {
            activeTab = 'Console';
          } else if (serviceClass.serviceClass.asyncApiSpec) {
            activeTab = 'Events';
          }
        }
        if (activeTab) this.chooseTab(activeTab);
      }
    }
  }

  chooseTab(activeTab) {
    this.setState({
      active: activeTab,
    });
  }

  closeModal = () => {
    this.setState({
      openModal: false,
    });
  };

  render() {
    const serviceClass = this.props.serviceClass;
    let documentsByType = [],
      documentsTypes = [],
      eventsTopics = [];

    if (!serviceClass.loading && serviceClass.serviceClass) {
      documentsByType = sortDocumentsByType(serviceClass.serviceClass.content);

      documentsTypes = getDocumentsTypes(
        serviceClass.serviceClass,
        documentsByType,
      );

      if (
        serviceClass.serviceClass.asyncApiSpec &&
        serviceClass.serviceClass.asyncApiSpec.topics
      ) {
        eventsTopics = Object.keys(
          serviceClass.serviceClass.asyncApiSpec.topics,
        );
      }
    }

    const serviceClassDisplayName = getResourceDisplayName(
      serviceClass.serviceClass,
    );

    return (
      <div>
        {serviceClass.serviceClass && (
          <div>
            <div> {this.arrayOfJsx} </div>
            {this.renObjData}
            <Toolbar
              back={() => {
                this.props.history.goBack();
              }}
              headline={serviceClassDisplayName}
              addSeparator
            >
              <Button
                onClick={() =>
                  this.setState({
                    openModal: true,
                  })
                }
                primary
                first
                last
                microFullWidth
                data-e2e-id="add-to-env"
              >
                Add to your Environment
              </Button>
            </Toolbar>

            <ColumnsWrapper phoneRows>
              <LeftSideWrapper>
                <ColumnsWrapper>
                  <ImagePlaceholder>
                    <Icon>{'\ue113'}</Icon>
                  </ImagePlaceholder>
                  <div>
                    <ServiceTitle data-e2e-id="service-title">
                      {serviceClassDisplayName}
                    </ServiceTitle>
                    <ServiceProvider data-e2e-id="service-provider">
                      {serviceClass.serviceClass.providerDisplayName || ''}
                    </ServiceProvider>
                  </div>
                </ColumnsWrapper>
                <Separator margin="30px 0 30px" />
                <div>
                  <Header margin="0 0 20px">Vendor Information</Header>
                  <Text>
                    Last Update:{' '}
                    <Moment unix format="MMM DD, YYYY">
                      {serviceClass.serviceClass.creationTimestamp}
                    </Moment>
                  </Text>
                  {serviceClass.serviceClass.documentationUrl && (
                    <Text>
                      Documentation:
                      {serviceClass.serviceClass.documentationUrl}
                    </Text>
                  )}
                </div>
              </LeftSideWrapper>
              <CenterSideWrapper>
                {serviceClass &&
                  serviceClass.serviceClass &&
                  serviceClass.serviceClass.description && (
                    <ContentWrapper>
                      <ContentHeader>
                        <Header>General Information</Header>
                      </ContentHeader>

                      <Separator />
                      <ContentDescription>
                        <Text data-e2e-id="service-description">
                          {serviceClass.serviceClass.description}
                        </Text>
                      </ContentDescription>
                    </ContentWrapper>
                  )}

                {documentsTypes.length > 0 && (
                  <ContentWrapper data-e2e-id="service-docs">
                    <Tabs
                      items={documentsTypes}
                      callbackParent={newState => {
                        this.chooseTab(newState);
                      }}
                      active={this.state.active}
                    >
                      {documentsTypes.map(type => (
                        <TabContent
                          key={type}
                          active={this.state.active}
                          title={type}
                        >
                          {documentsByType &&
                            documentsByType[type] &&
                            documentsByType[type].map((item, i) => (
                              <div
                                key={i}
                                dangerouslySetInnerHTML={{
                                  __html: item.source || item.Source,
                                }}
                              />
                            ))}
                        </TabContent>
                      ))}
                      <TabContent active={this.state.active} title={'Console'}>
                        {serviceClass.serviceClass.apiSpec && (
                          <div>
                            <Apiconsole
                              url="http://petstore.swagger.io/v1/swagger.json"
                              schema={serviceClass.serviceClass.apiSpec}
                            />
                          </div>
                        )}
                      </TabContent>
                      <TabContent active={this.state.active} title={'Events'}>
                        {eventsTopics.length && (
                          <Events
                            data={serviceClass.serviceClass.asyncApiSpec.topics}
                            topics={eventsTopics}
                            title={
                              serviceClass.serviceClass.asyncApiSpec.info.title
                            }
                            description={
                              serviceClass.serviceClass.asyncApiSpec.info
                                .description
                            }
                          />
                        )}
                      </TabContent>
                    </Tabs>
                  </ContentWrapper>
                )}
              </CenterSideWrapper>
            </ColumnsWrapper>
          </div>
        )}
        {this.state.openModal && (
          <Modal
            createServiceInstance={this.props.createServiceInstance}
            serviceClass={serviceClass}
            closeModal={this.closeModal}
          />
        )}
      </div>
    );
  }
}

export default ServiceClassDetails;
