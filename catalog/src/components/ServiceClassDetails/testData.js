export default [
  {
    serviceClass: {
      name: 'a2257daa-0e26-4c61-a68d-8a7453c1b767',
      externalName: 'redis',
      displayName: 'Redis',
      creationTimestamp: 1524700345,
      description: 'Redis by Helm Broker (Experimental)',
      documentationUrl: '',
      providerDisplayName: 'bitnami',
      tags: ['database', 'cache'],
      content: null,
      apiSpec: null,
      asyncApiSpec: null,
      plans: [
        {
          name: 'a6078798-70a1-4674-af90-aba364dd6a56',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              imagePullPolicy: {
                default: 'IfNotPresent',
                enum: ['Always', 'IfNotPresent', 'Never'],
                title: 'Image pull policy',
                type: 'string',
              },
              redisPassword: {
                default: '',
                description:
                  'Redis password. Defaults to a random 10-character alphanumeric string.',
                title:
                  'Password (Defaults to a random 10-character alphanumeric string)',
                type: 'string',
              },
            },
            type: 'object',
          },
          displayName: 'Enterprise',
          relatedServiceClassName: 'a2257daa-0e26-4c61-a68d-8a7453c1b767',
          externalName: 'enterprise',
          __typename: 'ServicePlan',
        },
        {
          name: 'a6078798-70a1-4674-af94-ab9664d36a54',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              imagePullPolicy: {
                default: 'IfNotPresent',
                enum: ['Always', 'IfNotPresent', 'Never'],
                title: 'Image pull policy',
                type: 'string',
              },
              redisPassword: {
                default: '',
                description:
                  'Redis password. Defaults to a random 10-character alphanumeric string.',
                title:
                  'Password (Defaults to a random 10-character alphanumeric string)',
                type: 'string',
              },
            },
            type: 'object',
          },
          displayName: 'Micro',
          relatedServiceClassName: 'a2257daa-0e26-4c61-a68d-8a7453c1b767',
          externalName: 'micro',
          __typename: 'ServicePlan',
        },
      ],
      __typename: 'ServiceClass',
    },
  },
  {
    serviceClass: {
      name: '997b8372-8dac-40ac-ae65-758b4a5075a5',
      externalName: 'azure-mysqldb',
      displayName: 'Azure Database for MySQL',
      creationTimestamp: 1524700345,
      description: 'Azure Database for MySQL (Experimental)',
      documentationUrl: '',
      providerDisplayName: 'Microsoft Azure',
      tags: ['Azure', 'MySQL', 'Database'],
      content: {
        description: 'Documentaion for Azure Database for MySQL.',
        displayName: 'Azure Database for MySQL',
        docs: [
          {
            source:
              '\u003cp\u003eThe Open Service Broker for Azure contains \u003cstrong\u003eAzure Database for MySQL\u003c/strong\u003e services. There is only one service available:\u003c/p\u003e\n\u003ctable\u003e\n\u003cthead\u003e\n\u003ctr\u003e\n\u003cth\u003eService Name\u003c/th\u003e\n\u003cth\u003eDescription\u003c/th\u003e\n\u003c/tr\u003e\n\u003c/thead\u003e\n\u003ctbody\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eazure-mysqldb\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eProvision both an Azure Database for MySQL Database Management System (DBMS) and a database.\u003c/td\u003e\n\u003c/tr\u003e\n\u003c/tbody\u003e\n\u003c/table\u003e\n\u003cp\u003eThe \u003ccode\u003eazure-mysqldb\u003c/code\u003e service allows you to provision both a DBMS and a database. When the provision operation is successful, the database is ready to use. You can not provision additional databases onto an instance provisioned through this service.\u003c/p\u003e\n\u003cblockquote\u003e\n\u003cp\u003e\u003cstrong\u003eNote:\u003c/strong\u003e This version of the service is based on Open Service Broker for Azure, version 0.8.0-alpha, available on the [Azure] (\u003ca href="https://github.com/Azure/open-service-broker-azure/tree/v0.8.0-alpha"\u003ehttps://github.com/Azure/open-service-broker-azure/tree/v0.8.0-alpha\u003c/a\u003e) website.\nFor more information, see the \u003ca href="https://github.com/Azure/open-service-broker-azure/blob/v0.8.0-alpha/docs/modules/mysqldb.md"\u003edocumentation\u003c/a\u003e.\u003c/p\u003e\n\u003c/blockquote\u003e\n',
            title: 'Overview',
            type: 'Overview',
          },
          {
            source:
              '\u003ch3 id="service-description"\u003eService description\u003c/h3\u003e\n\u003cp\u003eThis service is named \u003ccode\u003eazure-mysqldb\u003c/code\u003e with the following plan names and descriptions:\u003c/p\u003e\n\u003ctable\u003e\n\u003cthead\u003e\n\u003ctr\u003e\n\u003cth\u003ePlan Name\u003c/th\u003e\n\u003cth\u003eDescription\u003c/th\u003e\n\u003c/tr\u003e\n\u003c/thead\u003e\n\u003ctbody\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eMYSQLB50\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eBasic Tier, 50 DTUs\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eMYSQLB100\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eBasic Tier, 100 DTUs\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eMYSQLS100\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eStandard Tier, 100 DTUs\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eMYSQLS200\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eStandard Tier, 200 DTUs\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eMYSQLS400\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eStandard Tier, 400 DTUs\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eMYSQLS800\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eStandard Tier, 800 DTUs\u003c/td\u003e\n\u003c/tr\u003e\n\u003c/tbody\u003e\n\u003c/table\u003e\n\u003ch4 id="provision"\u003eProvision\u003c/h4\u003e\n\u003cp\u003eThis service provisions a new MySQL DBMS and a new database upon it. The new database is named randomly.\u003c/p\u003e\n\u003ch5 id="provisioning-parameters"\u003eProvisioning parameters\u003c/h5\u003e\n\u003cp\u003eThese are the provisioning parameters:\u003c/p\u003e\n\u003ctable\u003e\n\u003cthead\u003e\n\u003ctr\u003e\n\u003cth\u003eParameter Name\u003c/th\u003e\n\u003cth\u003eType\u003c/th\u003e\n\u003cth\u003eDescription\u003c/th\u003e\n\u003cth\u003eRequired\u003c/th\u003e\n\u003cth\u003eDefault Value\u003c/th\u003e\n\u003c/tr\u003e\n\u003c/thead\u003e\n\u003ctbody\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eLocation\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eThe Azure region in which to provision applicable resources.\u003c/td\u003e\n\u003ctd\u003eY\u003c/td\u003e\n\u003ctd\u003eNone.\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eResource group\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eThe (new or existing) resource group with which to associate new resources.\u003c/td\u003e\n\u003ctd\u003eY\u003c/td\u003e\n\u003ctd\u003eA new resource group will be created with a UUID as its name.\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eFirewall start IP address\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eSpecifies the start of the IP range allowed by the firewall rule\u003c/td\u003e\n\u003ctd\u003eY\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003e0.0.0.0\u003c/code\u003e\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eFirewall end IP address\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eSpecifies the end of the IP range allowed by the firewall rule\u003c/td\u003e\n\u003ctd\u003eY\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003e255.255.255.255\u003c/code\u003e\u003c/td\u003e\n\u003c/tr\u003e\n\u003c/tbody\u003e\n\u003c/table\u003e\n\u003ch6 id="credentials"\u003eCredentials\u003c/h6\u003e\n\u003cp\u003eThe binding returns the following connection details and credentials:\u003c/p\u003e\n\u003ctable\u003e\n\u003cthead\u003e\n\u003ctr\u003e\n\u003cth\u003eParameter Name\u003c/th\u003e\n\u003cth\u003eType\u003c/th\u003e\n\u003cth\u003eDescription\u003c/th\u003e\n\u003c/tr\u003e\n\u003c/thead\u003e\n\u003ctbody\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003ehost\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eThe fully-qualified address of the SQL Server.\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eport\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003eint\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eThe port number to connect to on the SQL Server.\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003edatabase\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eThe name of the database.\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003eusername\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eThe name of the database user.\u003c/td\u003e\n\u003c/tr\u003e\n\u003ctr\u003e\n\u003ctd\u003e\u003ccode\u003epassword\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003e\u003ccode\u003estring\u003c/code\u003e\u003c/td\u003e\n\u003ctd\u003eThe password for the database user.\u003c/td\u003e\n\u003c/tr\u003e\n\u003c/tbody\u003e\n\u003c/table\u003e\n',
            title: 'Services and Plans',
            type: 'Details',
          },
        ],
        id: '997b8372-8dac-40ac-ae65-758b4a5075a5',
        type: 'Service Class',
      },
      apiSpec: null,
      asyncApiSpec: null,
      plans: [
        {
          name: '08e4b43a-36bc-447e-a81f-8202b13e339c',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              firewallEndIPAddress: {
                default: '255.255.255.255',
                description: 'Firewall end IP address',
                title: 'Firewall end IP address',
                type: 'string',
              },
              firewallStartIPAddress: {
                default: '0.0.0.0',
                description: 'Firewall start IP address',
                title: 'Firewall start IP address',
                type: 'string',
              },
              location: {
                description: 'Location',
                enum: ['westeurope', 'northeurope', 'centralus'],
                title: 'Location',
                type: 'string',
              },
              //   location2: {
              //     description: 'Location2',
              //     enum: ['westeurope', 'northeurope', 'centralus'],
              //     title: 'Location2',
              //     type: 'string',
              //     default: 'northeurope',
              //   },
              resourceGroup: {
                description: 'Resource group',
                title: 'Resource group',
                type: 'string',
              },
            },
            required: [
              'location',
              'resourceGroup',
              'firewallStartIPAddress',
              'firewallEndIPAddress',
            ],
            type: 'object',
          },
          displayName: 'MYSQLS800',
          relatedServiceClassName: '997b8372-8dac-40ac-ae65-758b4a5075a5',
          externalName: 'standard800',
          __typename: 'ServicePlan',
        },
        {
          name: '1a538e06-9bcc-4077-8480-966cbf85bf36',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              firewallEndIPAddress: {
                default: '255.255.255.255',
                description: 'Firewall end IP address',
                title: 'Firewall end IP address',
                type: 'string',
              },
              firewallStartIPAddress: {
                default: '0.0.0.0',
                description: 'Firewall start IP address',
                title: 'Firewall start IP address',
                type: 'string',
              },
              location: {
                description: 'Location',
                enum: ['westeurope', 'northeurope', 'centralus'],
                title: 'Location',
                type: 'string',
              },
              resourceGroup: {
                description: 'Resource group',
                title: 'Resource group',
                type: 'string',
              },
            },
            required: [
              'location',
              'resourceGroup',
              'firewallStartIPAddress',
              'firewallEndIPAddress',
            ],
            type: 'object',
          },
          displayName: 'MYSQLB100',
          relatedServiceClassName: '997b8372-8dac-40ac-ae65-758b4a5075a5',
          externalName: 'basic100',
          __typename: 'ServicePlan',
        },
        {
          name: '427559f1-bf2a-45d3-8844-32374a3e58aa',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              firewallEndIPAddress: {
                default: '255.255.255.255',
                description: 'Firewall end IP address',
                title: 'Firewall end IP address',
                type: 'string',
              },
              firewallStartIPAddress: {
                default: '0.0.0.0',
                description: 'Firewall start IP address',
                title: 'Firewall start IP address',
                type: 'string',
              },
              location: {
                description: 'Location',
                enum: ['westeurope', 'northeurope', 'centralus'],
                title: 'Location',
                type: 'string',
              },
              resourceGroup: {
                description: 'Resource group',
                title: 'Resource group',
                type: 'string',
              },
            },
            required: [
              'location',
              'resourceGroup',
              'firewallStartIPAddress',
              'firewallEndIPAddress',
            ],
            type: 'object',
          },
          displayName: 'MYSQLB50',
          relatedServiceClassName: '997b8372-8dac-40ac-ae65-758b4a5075a5',
          externalName: 'basic50',
          __typename: 'ServicePlan',
        },
        {
          name: '9995c891-48ba-46cc-8dae-83595c1f443f',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              firewallEndIPAddress: {
                default: '255.255.255.255',
                description: 'Firewall end IP address',
                title: 'Firewall end IP address',
                type: 'string',
              },
              firewallStartIPAddress: {
                default: '0.0.0.0',
                description: 'Firewall start IP address',
                title: 'Firewall start IP address',
                type: 'string',
              },
              location: {
                description: 'Location',
                enum: ['westeurope', 'northeurope', 'centralus'],
                title: 'Location',
                type: 'string',
              },
              resourceGroup: {
                description: 'Resource group',
                title: 'Resource group',
                type: 'string',
              },
            },
            required: [
              'location',
              'resourceGroup',
              'firewallStartIPAddress',
              'firewallEndIPAddress',
            ],
            type: 'object',
          },
          displayName: 'MYSQLS200',
          relatedServiceClassName: '997b8372-8dac-40ac-ae65-758b4a5075a5',
          externalName: 'standard200',
          __typename: 'ServicePlan',
        },
        {
          name: 'ae3cd3dd-9818-48c0-9cd0-62c3b130944e',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              firewallEndIPAddress: {
                default: '255.255.255.255',
                description: 'Firewall end IP address',
                title: 'Firewall end IP address',
                type: 'string',
              },
              firewallStartIPAddress: {
                default: '0.0.0.0',
                description: 'Firewall start IP address',
                title: 'Firewall start IP address',
                type: 'string',
              },
              location: {
                description: 'Location',
                enum: ['westeurope', 'northeurope', 'centralus'],
                title: 'Location',
                type: 'string',
              },
              resourceGroup: {
                description: 'Resource group',
                title: 'Resource group',
                type: 'string',
              },
            },
            required: [
              'location',
              'resourceGroup',
              'firewallStartIPAddress',
              'firewallEndIPAddress',
            ],
            type: 'object',
          },
          displayName: 'MYSQLS400',
          relatedServiceClassName: '997b8372-8dac-40ac-ae65-758b4a5075a5',
          externalName: 'standard400',
          __typename: 'ServicePlan',
        },
        {
          name: 'edc2badc-d93b-4d9c-9d8e-da2f1c8c3e1c',
          instanceCreateParameterSchema: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {
              firewallEndIPAddress: {
                default: '255.255.255.255',
                description: 'Firewall end IP address',
                title: 'Firewall end IP address',
                type: 'string',
              },
              firewallStartIPAddress: {
                default: '0.0.0.0',
                description: 'Firewall start IP address',
                title: 'Firewall start IP address',
                type: 'string',
              },
              location: {
                description: 'Location',
                enum: ['westeurope', 'northeurope', 'centralus'],
                title: 'Location',
                type: 'string',
              },
              resourceGroup: {
                description: 'Resource group',
                title: 'Resource group',
                type: 'string',
              },
            },
            required: [
              'location',
              'resourceGroup',
              'firewallStartIPAddress',
              'firewallEndIPAddress',
            ],
            type: 'object',
          },
          displayName: 'MYSQLS100',
          relatedServiceClassName: '997b8372-8dac-40ac-ae65-758b4a5075a5',
          externalName: 'standard100',
          __typename: 'ServicePlan',
        },
      ],
      __typename: 'ServiceClass',
    },
  },
];
