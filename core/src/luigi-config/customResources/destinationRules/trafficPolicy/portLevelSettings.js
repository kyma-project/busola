import { loadBalancer } from './loadBalancer';
import { connectionPool } from './connectionPool';
import { outlierDetection } from './outlierDetection';
import { tls } from './tls';

// export const portLevelSettings = {
//   path: 'portLevelSettings',
//   widget: 'GenericList',
//   children: [
//     { path: 'port' },
//     // loadBalancer,
//     // connectionPool,
//     // outlierDetection,
//     // tls,
//   ],
// };
//
//TODO
export const portLevelSettings = [
  {
    path: 'portLevelSettings',
    widget: 'GenericList',
    children: [{ path: '[].port.number' }],
  },
  // { path: 'portLevelSettings[].port.number' },
];
// path: 'portLevelSettings',
// widget: 'GenericList',
//     children: [
//         { path: 'port' },
//         // loadBalancer,
//         // connectionPool,
//         // outlierDetection,
//         // tls,
//     ],
// ;
