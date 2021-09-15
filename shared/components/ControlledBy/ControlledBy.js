import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from '../../constants/constants';
import { Link } from 'fundamental-react';
import {
  navigateToFixedPathResourceDetails,
  navigateToCustomResourceDefinitionDetails,
} from '../..';

// TODO: add more DEFAULT_VIEWS
// TODO: use ControlledByKind/ControlledBy on the rest of the lists / details

const DEFAULT_VIEWS = [
  'functions',
  'cronjobs',
  'deamonsets',
  'deployments',
  'jobs',
  'pods',
  'replicasets',
  'secrets',
  'servicebindings',
  'statefulsets',
];
const GoToDetailsLink = ({ resource, name, apiVersion }) => {
  if (!resource) return null;
  if (DEFAULT_VIEWS.includes(resource)) {
    return (
      <Link
        className="fd-link"
        onClick={_ => {
          navigateToFixedPathResourceDetails(resource, name);
        }}
      >
        ({name})
      </Link>
    );
  } else if (apiVersion === 'apps/v1' || apiVersion === '/api') {
    // TODO: Check other default k8s apiVersion
    return <>({name})</>;
  } else {
    return (
      <Link
        className="fd-link"
        onClick={_ => {
          navigateToCustomResourceDefinitionDetails(resource, apiVersion, name);
        }}
      >
        ({name})
      </Link>
    );
  }
};
export const ControlledBy = ({ ownerReferences }) => {
  if (!ownerReferences?.length) return EMPTY_TEXT_PLACEHOLDER;
  return (
    <>
      {ownerReferences.map((owner, index) => {
        const className = index > 0 ? 'fd-margin-top--sm' : '';
        const resource = owner.kind.endsWith('s')
          ? `${owner.kind.toLowerCase()}es`
          : `${owner.kind.toLowerCase()}s`;
        return (
          <div key={owner.name} className={className}>
            {owner.kind}
            &nbsp;
            <GoToDetailsLink
              resource={resource}
              apiVersion={owner.apiVersion}
              name={owner.name}
            />
          </div>
        );
      })}
    </>
  );
};

export const ControlledByKind = ({ ownerReferences }) => {
  if (!ownerReferences?.length) return EMPTY_TEXT_PLACEHOLDER;
  return (
    <>
      {ownerReferences.map((owner, index) => {
        const className = index > 0 ? 'fd-margin-top--sm' : '';
        return (
          <div key={owner.name} className={className}>
            {owner.kind}
          </div>
        );
      })}
    </>
  );
};
// export const ResourceOwners = ({ ownerReferences }) => {
//   if (!ownerReferences?.length) return EMPTY_TEXT_PLACEHOLDER;
//   return (
//     <>
//       {ownerReferences.map((owner, index) => {
//         const className = index > 0 ? 'fd-margin-top--sm' : '';
//         return (
//           <div key={owner.name} className={className}>
//             {owner.name} ({owner.kind})
//           </div>
//         );
//       })}
//     </>
//   );
// }

// function VariableOwner({ variable }) {
//   if (!variable.owners?.length) return EMPTY_TEXT_PLACEHOLDER;

//   return (
//     <>
//       {variable.owners.map((owner, index) => {
//         const className = index > 0 ? 'fd-margin-top--sm' : '';
//         return (
//           <div key={owner.name} className={className}>
//             <Link
//               className="fd-link" onClick={_ => { navigateToFixedPathResourceDetails('issuers', owner.name); }}>{owner.name} </Link>({owner.kind})
//           </div>
//         );
//       })}
//     </>
//   );
// }
