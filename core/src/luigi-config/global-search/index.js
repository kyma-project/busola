import { getAuthData } from '../auth/auth-storage';
import { getClusters } from '../cluster-management/cluster-management';
import { config } from '../config';
import { failFastFetch } from '../navigation/queries';
import { search } from './search';

const TYPE_DELAY = 300; // ms
let timeout;

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
    Luigi.globalSearch().setSearchString('');
    Luigi.globalSearch().openSearchField();

    console.log('open, ', document.querySelector('.luigi-search'));
    setTimeout(() => {
      document.querySelector('.luigi-search').focus();
    }, 100);
  }
});

window.addEventListener('click', e => {
  console.log('click', e.target);
  Luigi.globalSearch().closeSearchField();
});

function closeGlobalSearch() {
  Luigi.globalSearch().closeSearchField();
  Luigi.globalSearch().closeSearchResult();
}

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
            fetch: path =>
              failFastFetch(config.backendAddress + path, getAuthData()),
            ...getPathContext(),
            clusterNames: Object.keys(await getClusters()),
          };

          const result = await search(searchString, context);

          if (!result.searchResults?.length) {
            result.searchResults = [
              {
                label: 'No results',
                onClick: closeGlobalSearch,
              },
            ];
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
    customSearchResultRenderer: ({ searchResults, suggestion }, slot) => {
      let div = document.createElement('div');
      div.setAttribute(
        'class',
        'fd-popover__body fd-popover__body--right luigi-search__popover__body',
      );
      const nav = document.createElement('nav');
      nav.setAttribute('class', 'fd-menu');
      const ul = document.createElement('ul');
      ul.setAttribute('class', 'fd-menu__list');
      ul.setAttribute('style', 'max-height: 30vh; overflow-y: scroll');
      searchResults.forEach(searchResult => {
        const li = document.createElement('li');
        li.setAttribute('class', 'fd-menu__item');
        const a = document.createElement('a');
        a.addEventListener('click', () => {
          searchResult.onClick();
          closeGlobalSearch();
        });
        a.setAttribute('class', 'fd-menu__link');
        const span = document.createElement('span');
        span.setAttribute('class', 'fd-menu__title');
        span.innerHTML = searchResult.label;
        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
      });

      if (suggestion) {
        const li = document.createElement('li');
        li.setAttribute('class', 'fd-menu__item');
        const a = document.createElement('a');
        a.addEventListener('click', () =>
          Luigi.globalSearch().setSearchString(suggestion),
        );
        a.setAttribute('class', 'fd-menu__link');
        const span = document.createElement('span');
        span.setAttribute('class', 'fd-menu__title');
        span.innerHTML = `Did you mean "${suggestion}"?`;
        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
      }

      nav.appendChild(ul);
      div.appendChild(nav);
      slot.appendChild(div);
      console.log(ul.children);
    },
  },
};
