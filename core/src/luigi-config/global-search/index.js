import { getAuthData } from '../auth/auth-storage';
import { getClusters } from '../cluster-management/cluster-management';
import { failFastFetch } from '../navigation/queries';
import { search } from './search';

const TYPE_DELAY = 300; // ms
let timeout;

const fetch = path =>
  failFastFetch(config.backendAddress + path, getAuthData());

function getPathContext() {
  const matches = location.pathname.match(
    new RegExp('/cluster/(.*?)/(namespaces/(.*?)/)?'),
  );
  return {
    namespace: matches?.[3],
    cluster: matches?.[1],
  };
}

window.addEventListener('keydown', ({ metaKey, key }) => {
  if (key === 'k' && metaKey) {
    Luigi.globalSearch().openSearchField();
    setTimeout(() => {
      document.querySelector('.luigi-search').focus();
    }, 100);
  }
});

export const globalSearch = {
  searchProvider: {
    onInput: () => {
      const searchString = Luigi.globalSearch().getSearchString();
      clearTimeout(timeout);
      new Promise(resolve => {
        timeout = setTimeout(resolve, TYPE_DELAY);
      })
        .then(async () => {
          const context = {
            fetch,
            ...getPathContext(),
            clusterNames: Object.keys(await getClusters()),
          };

          const result = await search(searchString, context);

          if (!result.searchResults.length) {
            result.searchResults = [{ label: 'nope' }];
          }

          Luigi.globalSearch().closeSearchResult();
          Luigi.globalSearch().showSearchResult({ ...result, length: 1 });
        })
        .catch(e => {
          console.log(e);
        });
    },
    onEscape: () => {
      Luigi.globalSearch().closeSearchResult();
      Luigi.globalSearch().clearSearchField();
    },
    customSearchResultRenderer: (
      { searchResults, suggestion },
      slot,
      { fireItemSelected },
    ) => {
      let div = document.createElement('div');
      div.setAttribute(
        'class',
        'fd-popover__body fd-popover__body--right luigi-search__popover__body',
      );
      const nav = document.createElement('nav');
      nav.setAttribute('class', 'fd-menu');
      const ul = document.createElement('ul');
      ul.setAttribute('class', 'fd-menu__list fd-menu__list--top');
      searchResults.forEach(searchResult => {
        const li = document.createElement('li');
        li.setAttribute('class', 'fd-menu__item');
        const a = document.createElement('a');
        a.addEventListener('click', () => fireItemSelected(searchResult));
        a.setAttribute('class', 'fd-menu__link');
        const span = document.createElement('span');
        span.setAttribute('class', 'fd-menu__title');
        span.innerHTML = searchResult.label;
        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
      });

      const li = document.createElement('li');
      li.setAttribute('class', 'fd-menu__item');
      const a = document.createElement('a');
      a.addEventListener('click', () => fireItemSelected(suggestion));
      a.setAttribute('class', 'fd-menu__link');
      const span = document.createElement('span');
      span.setAttribute('class', 'fd-menu__title');
      span.innerHTML = 'suggestion';
      a.appendChild(span);
      li.appendChild(a);
      nav.appendChild(ul);
      div.appendChild(nav);
      slot.appendChild(div);
      console.log(ul.children);
    },
    onSearchResultItemSelected: searchResultItem => {
      console.log('click', searchResultItem);
      // Luigi.navigation()
      //   .withParams(searchResultItem.pathObject.params)
      //   .navigate(searchResultItem.pathObject.link);
    },
  },
};
