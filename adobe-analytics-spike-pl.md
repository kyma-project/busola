# Integracja Adobe Analytics

## Streszczenie wykonawcze

Niniejszy SPIKE bada, co byłoby potrzebne do zintegrowania Adobe Analytics z Kyma Dashboard (Busola). Rekomendowane podejście:

- **Wybór SDK/tagu:** Adobe Launch/Tags (Experience Platform Tags) z dynamicznym wstrzykiwaniem skryptu kontrolowanym przez feature flag — zgodnie z istniejącym wzorcem integracji Sentry
- **Model zdarzeń:** Anonimowe wyświetlenia stron na poziomie ścieżki routingu oraz zdarzenia użycia funkcji na wysokim poziomie ogólności; bez danych PII, bez zawartości zasobów, bez danych klastra
- **Bramkowanie:** Nowa feature flag `ADOBE_ANALYTICS`, domyślnie `isEnabled: false`, włączana wyłącznie przez ConfigMap `busola-config` we wdrożeniach zarządzanych przez SAP
- **Prywatność:** Anonimizacja IP włączona, śledzenie ECID/demdex pominięte, baner zgody niepotrzebny, jeśli nie są ustawiane ciasteczka (tryb bezplikowy poprzez FPID w `localStorage`)

---

## 1. Tenant Adobe Analytics SAP i proces wdrożenia

### Obecność SAP w Adobe Experience Cloud

SAP utrzymuje korporacyjny tenant Adobe Analytics w ramach **organizacji SAP Adobe Experience Cloud** (alias tenanta `sapwebanalytics`). Nowe produkty są wdrażane poprzez złożenie wniosku o:

1. **Report suite** — kontener danych produktu. Report suites są przypisane do konkretnego produktu/właściwości i kontrolują retencję danych, ustawienia waluty oraz dostępy.
2. **Właściwość Adobe Experience Platform Tags** — kontener zarządzania tagami zawierający rozszerzenie Adobe Analytics i wszystkie reguły zbierania danych. Właściwość generuje **kod osadzenia** (tag `<script>`), który wklejany jest do aplikacji.

> **Luka wewnętrzna:** Dokładna nazwa report suite, ID właściwości Tags oraz kod osadzenia dla Kyma Dashboard jeszcze nie istnieją i muszą zostać nadane. Skontaktuj się z @mrCherry97 (lub zespołem SAP Analytics Hub), aby zainicjować wniosek o wdrożenie. Proces provisioningu trwa zazwyczaj 1–2 tygodnie.

### Model integracji wymagany przez SAP

Standardem SAP dla analityki zarządzanych produktów jest **Adobe Experience Platform Tags** (dawniej Adobe Launch, wcześniej DTM). W tym modelu:

- Analytics Hub SAP zarządza współdzieloną **organizacją** Tags; poszczególne zespoły produktowe posiadają własne **właściwości** w jej ramach.
- Właściwość Tags dostarcza **rozszerzenie Adobe Analytics** (oparte na AppMeasurement) oraz dowolne reguły niestandardowe za pośrednictwem skryptu hostowanego na CDN pod adresem `assets.adobedtm.com`.
- Zespoły produktowe osadzają pojedynczy asynchroniczny tag `<script>` (kod osadzenia właściwości) w swoim HTML; środowisko uruchomieniowe Tags ładuje rozszerzenie analityczne i uruchamia skonfigurowane reguły.

Oznacza to, że zmiana kodu Busoli jest niewielka: osadzić skrypt (warunkowo), dodać hooki do śledzenia zmiany ścieżki oraz skonfigurować reguły w interfejsie Tags.

---

## 2. Techniczne podejścia do integracji

Możliwe są trzy podejścia. Oceniane są względem ograniczeń Busoli: bramkowanie przez feature flag, architektura bez ciasteczek, SPA React 18 + Vite oraz dystrybucja OSS.

### Podejście A — kod osadzenia Adobe Launch/Tags (skrypt zewnętrzny)

Tag `<script>` z kodem osadzenia Launch jest dodawany statycznie do `index.html`, zawsze ładując środowisko uruchomieniowe Tags z `assets.adobedtm.com`.

```html
<!-- index.html — dodane do <head> -->
<script
  src="https://assets.adobedtm.com/XXXX/launch-XXXX.min.js"
  async
></script>
```

Wyświetlenia stron SPA są śledzone w React poprzez wywołanie `_satellite.track('page-view', { pageName: ... })` przy każdej zmianie ścieżki.

|            |                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Zalety** | Najprostsza zmiana kodu; reguły Tags zarządzane poza bazą kodu przez zespół Analytics Hub                                                                                                              |
| **Wady**   | Skrypt ładowany dla **wszystkich** użytkowników, w tym wdrożeń OSS — nie może być bramkowany przez feature flag; CSP musi zawsze zezwalać na `assets.adobedtm.com`, nawet gdy analityka jest wyłączona |

**Niezalecane** — narusza wymóg, że analityka jest domyślnie wyłączona dla użytkowników OSS/self-hosted.

---

### Podejście B — Adobe Web SDK (alloy.js) przez pakiet npm

Instalacja `@adobe/alloy` i inicjalizacja programowa wewnątrz hooka `useAdobeAnalytics`. Pełny schemat zdarzeń XDM/Experience Data Model.

```ts
import { createInstance } from '@adobe/alloy';
const alloy = createInstance({ name: 'alloy' });
alloy('configure', { datastreamId: '...', orgId: '...' });
alloy('sendEvent', {
  xdm: { web: { webPageDetails: { name: '...', URL: '...' } } },
});
```

|            |                                                                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zalety** | W pełni programowe; możliwe bramkowanie przez feature flag; testowalne; brak zewnętrznej zależności CDN w czasie wykonania                                                                                                                |
| **Wady**   | ~200 KB dodatkowego rozmiaru bundla; wymaga **Adobe Experience Platform Datastream** (odrębny provisioning od klasycznej report suite); bardziej złożony schemat XDM; Analytics Hub może jeszcze nie obsługiwać Web SDK dla produktów SAP |

**Możliwe jako ścieżka na przyszłość** po migracji Analytics Hub SAP do Experience Platform. Niezalecane jako pierwsza implementacja — zbyt duże koszty provisioningu i niepewne wsparcie SAP.

---

### Podejście C — dynamiczne osadzenie Launch z bramką feature flag ✅ **Zalecane**

Skrypt osadzenia Launch wstrzykiwany jest do DOM **tylko wtedy, gdy feature flag `ADOBE_ANALYTICS` jest włączona**. Wzorzec ten odzwierciedla sposób działania Sentry w Busoli ([src/hooks/useSentry.js](src/hooks/useSentry.js)).

```ts
// src/hooks/useAdobeAnalytics.ts
export function useAdobeAnalytics() {
  const feature = useFeature(configFeaturesNames.ADOBE_ANALYTICS);

  useEffect(() => {
    if (!feature?.isEnabled || !feature?.config?.embedUrl) return;
    const script = document.createElement('script');
    script.src = feature.config.embedUrl;
    script.async = true;
    document.head.appendChild(script);
  }, [feature]);
}
```

Śledzenie ścieżki SPA to osobny hook `useAdobePageView`, który nasłuchuje na `useLocation` z React Router i wywołuje `_satellite.track()` przy każdej zmianie ścieżki.

|            |                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zalety** | Bramkowane przez feature flag (wdrożenia OSS nie ładują skryptu analitycznego); reguły Tags zarządzane poza bazą kodu; minimalny wpływ na rozmiar bundla; znany wzorzec (odzwierciedla Sentry) |
| **Wady**   | `assets.adobedtm.com` nadal potrzebne w CSP (ale zmiany `connect-src` i `img-src` są warunkowo zależne od włączenia feature flag w czasie wykonania)                                           |

---

### Podsumowanie porównawcze

|                                              | Podejście A | Podejście B | **Podejście C**   |
| -------------------------------------------- | ----------- | ----------- | ----------------- |
| Bramkowane przez feature flag                | ✗           | ✓           | **✓**             |
| Rozmiar bundla                               | ~0 KB       | +200 KB     | **~0 KB**         |
| SDK zarządzane przez Analytics Hub           | ✓           | ✗           | **✓**             |
| Działa z tenantem SAP już dziś               | ✓           | ?           | **✓**             |
| Brak zewnętrznego CDN w CSP (stan wyłączony) | ✗           | ✓           | ✗ (CSP statyczne) |
| Programowa kontrola zdarzeń                  | ✗           | ✓           | **częściowa**     |

---

## 3. Śledzenie zmiany ścieżki SPA

React Router 7 nie wywołuje tradycyjnych ładowań stron przy nawigacji. Adobe Analytics zarejestruje tylko pierwsze ładowanie HTML, chyba że Busola jawnie wywoła zdarzenia śledzenia przy zmianie ścieżki.

### Wzorzec implementacji

```ts
// src/hooks/useAdobePageView.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useFeature } from './useFeature';
import { configFeaturesNames } from 'state/types';

export function useAdobePageView() {
  const location = useLocation();
  const feature = useFeature(configFeaturesNames.ADOBE_ANALYTICS);

  useEffect(() => {
    if (!feature?.isEnabled) return;
    if (typeof window._satellite === 'undefined') return;

    const pageName = buildPageName(location.pathname);
    window._satellite.track('page-view', { pageName });
  }, [location.pathname, feature?.isEnabled]);
}

function buildPageName(pathname: string): string {
  // Zamiana nazw/ID zasobów na znaczniki typów w celu uniknięcia przechwytywania PII/zawartości zasobów
  return pathname
    .replace(/\/namespaces\/[^/]+/g, '/namespaces/{namespace}')
    .replace(
      /\/(pods|deployments|services|configmaps|secrets)\/[^/]+/g,
      '/$1/{name}',
    );
}
```

Hook ten byłby wywoływany w `App.tsx` obok istniejącego wywołania `useSentry()`.

### Co robi sanityzator `buildPageName`

Sanityzator ścieżki usuwa konkretne nazwy przestrzeni nazw i zasobów przed ich wysłaniem do Adobe Analytics. Wynikowe wartości `pageName` wyglądają następująco:

- `/cluster/namespaces/{namespace}/pods` → widok listy zasobów
- `/cluster/namespaces/{namespace}/pods/{name}` → widok szczegółów zasobu
- `/cluster/overview` → przegląd klastra

Zapewnia to, że żadne nazwy zasobów Kubernetes ani przestrzeni nazw nigdy nie są przesyłane.

---

## 4. Model zdarzeń

### Zalecane zdarzenia do śledzenia

Wszystkie zdarzenia muszą być pozbawione PII, niepoufne i reprezentowalne na poziomie typu zasobu.

| Zdarzenie                 | Przesyłane dane                                                  | Wyzwalacz                                          |
| ------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| `page-view`               | Sanityzowana ścieżka (patrz §3), referrer (tylko ten sam origin) | Każda zmiana ścieżki React Router                  |
| `feature-terminal-open`   | Tylko nazwa funkcji                                              | Użytkownik otwiera zintegrowany terminal           |
| `feature-companion-open`  | Tylko nazwa funkcji                                              | Użytkownik otwiera Kyma Companion / czat AI        |
| `feature-companion-query` | Tylko nazwa funkcji                                              | Użytkownik przesyła zapytanie do companion         |
| `resource-create`         | Rodzaj zasobu (np. `Deployment`)                                 | Użytkownik kończy formularz tworzenia zasobu       |
| `resource-delete`         | Rodzaj zasobu                                                    | Użytkownik potwierdza usunięcie                    |
| `resource-yaml-edit`      | Rodzaj zasobu                                                    | Użytkownik otwiera edytor YAML                     |
| `resource-validate`       | Nazwa funkcji                                                    | Użytkownik uruchamia walidację                     |
| `error-page-view`         | Typ błędu (ogólny, bez stosu)                                    | Uruchamia się error boundary na poziomie aplikacji |

### Wyraźnie wykluczone

- Nazwy zasobów, nazwy przestrzeni nazw, etykiety, adnotacje lub jakakolwiek zawartość zasobów
- Tokeny auth, zawartość kubeconfig lub dane uwierzytelniające
- Adresy URL serwera API klastra lub identyfikatory klastra
- Adresy e-mail użytkowników, nazwy użytkowników lub jakiekolwiek dane tożsamości
- Tekst zapytania/promptu wysyłanego do Kyma Companion

---

## 5. Zmiany Content Security Policy

Obecna CSP w [index.html](index.html) nie zezwala na żadne zewnętrzne domeny analityczne. Wszystkie dyrektywy CSP znajdują się w statycznym tagu `<meta http-equiv="Content-Security-Policy">` w `index.html` i muszą być aktualizowane podczas budowania — nie można ich przełączać w czasie wykonania.

**Wymagane uzupełnienia:**

```html
<!-- script-src: dodanie CDN Adobe Launch -->
script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' blob:
https://*.sapdas.cloud.sap https://assets.adobedtm.com;

<!-- connect-src: nowa dyrektywa — obecnie nieobecna w CSP -->
connect-src 'self' https://*.omtrdc.net https://dpm.demdex.net;

<!-- img-src: nowa dyrektywa — obecnie nieobecna w CSP -->
img-src 'self' data: https://*.omtrdc.net;
```

> **Uwaga:** Dyrektywy `connect-src` i `img-src` obecnie nie istnieją w nagłówku CSP. Bez `connect-src` wszystkie żądania XHR/fetch/beacon do serwerów zbierania danych Adobe (`*.omtrdc.net`) będą blokowane niezależnie od feature flag. Podobnie, bez `img-src` pikselowe śledzenie beaconów fallback będzie blokowane. Obie dyrektywy muszą zostać dodane, aby analityka działała.

> **Uwaga o ryzyku:** Dodanie `assets.adobedtm.com` do `script-src` oznacza, że skompromitowane Adobe CDN mogłoby wstrzyknąć dowolny JavaScript do Busoli dla _wszystkich_ użytkowników — w tym tych we wdrożeniach OSS, gdzie analityka jest wyłączona. Środki łagodzące: użycie adresu URL osadzenia właściwości z **SRI hashem** (Adobe Launch obsługuje Subresource Integrity); ograniczenie do właściwości staging dla klastrów nieprodukcyjnych. Istniejące `unsafe-eval` w CSP jest szerszym problemem zaufania; to uzupełnienie mieści się w tej samej kategorii ryzyka, ale dodaje nową zewnętrzną kotwicę zaufania.
>
> Domena `dpm.demdex.net` umożliwia Adobe ECID (identyfikator odwiedzającego) przy użyciu pliku cookie stron trzecich. Patrz §6, jak tego uniknąć przy zachowaniu modelu bez ciasteczek.

---

## 6. Prywatność, zgoda i RODO

### Dane zbierane domyślnie przez Adobe Analytics

- Adres IP (używany do geolokalizacji, opcjonalnie anonimizowany)
- Odcisk palca przeglądarki/systemu/urządzenia
- URL strony i referrer
- Czas na stronie, ścieżki kliknięć
- Plik cookie z identyfikatorem odwiedzającego (`s_vi` lub `s_fid`)

### Konflikty z modelem bez ciasteczek Busoli

Busola celowo nie przechowuje ciasteczek i trzyma tokeny auth wyłącznie w pamięci (patrz wytyczne bezpieczeństwa [AGENTS.md](AGENTS.md)). Domyślna identyfikacja odwiedzających w Adobe Analytics używa `s_vi` (plik cookie pierwszej strony z TTL 2 lata), co po raz pierwszy wprowadziłoby ciasteczko.

**Opcje rozwiązania:**

1. **Tryb bezplikowy (`s_fid` / FPID):** Adobe Analytics wraca do `s_fid`, krótkotrwałego ID opartego na odcisku palca przechowywanego w `localStorage`, gdy `s_vi` jest zablokowane lub wyłączone. Można to wymusić, konfigurując `cookieDomainPeriods=0` w konfiguracji AppMeasurement. Nie jest ustawiany żaden plik cookie. Ciągłość odwiedzającego ma zakres sesji.

2. **Wyłączenie ECID (demdex.net):** Ustawienie `visitor.disableThirdPartyCookies = true` w konfiguracji rozszerzenia Tags uniemożliwia ECID wywoływanie `dpm.demdex.net`. Eliminuje to plik cookie identyfikacji odwiedzającego między domenami, ale ogranicza segmentację odbiorców.

3. **Anonimizacja IP:** Adobe Analytics obsługuje `[IP] anonymize last octet` per report suite. Powinno to być włączone na poziomie report suite podczas provisioningu, aby spełnić wymóg minimalizacji danych RODO.

**Rekomendacja:** Użycie trybu bezplikowego (opcja 1) + wyłączenie ECID (opcja 2) + maskowanie IP. Zachowuje to model bez ciasteczek, spełnia wymóg minimalizacji danych RODO i eliminuje potrzebę banera zgody (brak ciasteczek = brak wyzwalacza prawa o ciasteczkach na mocy Art. 5(3) Dyrektywy ePrivacy dla identyfikatorów analityczno-funkcjonalnych przechowywanych w `localStorage`).

> **Luka prawna:** Zespół DPP (Data Protection and Privacy) SAP powinien potwierdzić, że śledzenie oparte na FPID w `localStorage` bez banera zgody jest akceptowalne zgodnie z polityką prywatności SAP dla produktów hostowanych na BTP. Skontaktuj się z partnerem biznesowym DPP przed włączeniem analityki na produkcji. Szacowany czas przeglądu DPP to 1–2 tygodnie.

### Wdrożenia izolowane / offline

Gdy feature flag `ADOBE_ANALYTICS` ma wartość `isEnabled: false` (domyślnie), żaden skrypt analityczny nie jest ładowany i żadne żądania sieciowe do serwerów Adobe nie są wykonywane. Wdrożenia izolowane nie są dotknięte.

Jeśli feature flag zostanie włączona w środowisku izolowanym, pobranie skryptu Launch zakończy się cichym błędem (bez ponownych prób, bez wyświetlania błędu użytkownikowi). Wszystkie wywołania analityczne będą no-opami, ponieważ `window._satellite` nie będzie zdefiniowane — hook `useAdobePageView` sprawdza warunek `typeof window._satellite === 'undefined'`.

---

## 7. Zakres wdrożenia OSS vs. zarządzanego przez SAP

### Domyślnie: WYŁĄCZONE dla wszystkich wdrożeń

Feature `ADOBE_ANALYTICS` będzie miała `isEnabled: false` w [public/defaultConfig.yaml](public/defaultConfig.yaml). Oznacza to:

- Open-source Busola self-hosted przez dowolnego użytkownika społeczności → brak analityki, zero wysyłanych danych
- Kyma Dashboard zarządzany przez SAP na BTP → analityka włączona tylko wtedy, gdy zespół operacyjny SAP doda ją do ConfigMap `busola-config` w `kube-public`

### Włączanie dla wdrożeń zarządzanych przez SAP

Istniejący mechanizm `busola-config` (ConfigMap w przestrzeni nazw `kube-public`, odczytywana przez [src/state/configuration/configurationAtom.ts](src/state/configuration/configurationAtom.ts)) już obsługuje nadpisywanie feature na poziomie klastra. Zespół operacyjny SAP dodałby:

```yaml
# ConfigMap busola-config, data.config
config:
  features:
    ADOBE_ANALYTICS:
      isEnabled: true
      config:
        embedUrl: https://assets.adobedtm.com/XXXX/launch-XXXX.min.js
```

Nie jest potrzebna żadna zmiana kodu, aby przełączyć analitykę na poziomie klastra.

### Uwaga dotycząca PROTECTED_CONFIG_FEATURES

Feature `ADOBE_ANALYTICS` **nie powinna** być dodawana do `PROTECTED_CONFIG_FEATURES` w [src/state/types.ts](src/state/types.ts). Chronione feature są tylko na poziomie instalacji (nie mogą być nadpisywane przez ConfigMap). Analityka jest operacyjną sprawą na poziomie klastra — każdy klaster zarządzany przez SAP powinien móc niezależnie z niej korzystać.

---

## 8. Wymagane zmiany i ocena ryzyka

| Zmiana                                                            | Lokalizacja                                                      | Nakład     | Ryzyko                                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- | ---------- | ---------------------------------------------------- |
| Dodanie `ADOBE_ANALYTICS` do `configFeaturesNames`                | [src/state/types.ts](src/state/types.ts)                         | 0,5h       | Znikome                                              |
| Dodanie domyślnego wpisu konfiguracji (`isEnabled: false`)        | [public/defaultConfig.yaml](public/defaultConfig.yaml)           | 0,5h       | Znikome                                              |
| Implementacja hooka `useAdobeAnalytics` (wstrzykiwanie skryptu)   | [src/hooks/useAdobeAnalytics.ts](src/hooks/useAdobeAnalytics.ts) | 2h         | Niskie                                               |
| Implementacja hooka `useAdobePageView` (śledzenie ścieżki)        | [src/hooks/useAdobePageView.ts](src/hooks/useAdobePageView.ts)   | 3h         | Niskie                                               |
| Podpięcie hooków w App.tsx                                        | [src/components/App/App.tsx](src/components/App/App.tsx)         | 0,5h       | Znikome                                              |
| Aktualizacja CSP w index.html                                     | [index.html](index.html)                                         | 0,5h       | **Średnie** — dodaje zewnętrzną domenę script-src    |
| Dodanie niestandardowego śledzenia zdarzeń dla kluczowych funkcji | Wiele plików                                                     | 2–3 dni    | Niskie–Średnie (wymaga audytu punktów styku funkcji) |
| Testy jednostkowe/komponentowe dla nowych hooków                  | [src/hooks/](src/hooks/)                                         | 1 dzień    | Niskie                                               |
| Przegląd DPP i decyzja o zgodzie                                  | Poziom organizacji                                               | zewnętrzne | **Wysokie** — bloker dla użytku produkcyjnego        |
| Provisioning tenanta Adobe Analytics                              | Poziom organizacji                                               | zewnętrzne | **Wysokie** — bloker; skontaktuj się z @mrCherry97   |

**Łączny nakład na kod:** ~5–6 dni  
**Zewnętrzne blokery:** 2–3 tygodnie (provisioning tenanta + przegląd DPP)

---

## 9. Odpowiedzi na otwarte pytania

**Czy Adobe Analytics jest odpowiednie dla produktu open-source?**  
Tak, przy podejściu z bramkowaniem przez feature flag. Wersja OSS jest dostarczana z wyłączoną analityką. SDK/tag nigdy nie jest ładowany, chyba że operator wdrożenia jawnie to włączy. Jest to ten sam model używany przez Sentry w Busoli.

**Czy wprowadzenie analityki osłabia zabezpieczenia CSP?**  
Umiarkowanie. Dodanie `assets.adobedtm.com` do `script-src` wprowadza nową zewnętrzną kotwicę zaufania dla skryptów. Istniejące `unsafe-eval` w obecnej CSP jest poważniejszym problemem. Ryzyko jest łagodzone przez użycie adresów URL osadzenia Adobe z obsługą SRI i ograniczenie do konkretnego hasha właściwości tam, gdzie to możliwe.

**UX zgody — czy baner ciasteczek/zgody jest akceptowalny?**  
Nie jest potrzebny, jeśli używany jest tryb bezplikowy (tylko FPID w localStorage, bez ciasteczka `s_vi`, ECID wyłączone). Zespół DPP musi potwierdzić to stanowisko. Jeśli ciasteczka są wymagane, konieczny będzie baner zgody zintegrowany z początkowym ładowaniem Busoli — znacznie większy zakres UX i prawny.

---

## 10. Kolejne kroki

1. **Poziom organizacji (blokujące):** Skontaktuj się z @mrCherry97, aby zainicjować provisioning tenanta/report-suite Adobe Analytics w SAP Analytics Hub.
2. **Poziom organizacji (blokujące):** Zaangażuj partnera biznesowego DPP, aby potwierdzić, że śledzenie FPID w trybie bezplikowym jest dozwolone bez banera zgody.
3. **Implementacja:** Przejdź do kroków z §8 (zmiany kodu są małe i mogą być rozpoczęte równolegle z provisioningiem):
   - Dodaj feature flag
   - Zaimplementuj hooki `useAdobeAnalytics` i `useAdobePageView`
   - Zaktualizuj CSP i defaultConfig.yaml
4. **Testowanie PoC:** Gdy dostępny będzie kod osadzenia Launch (nawet właściwość sandbox/staging), uruchom lokalny test, aby potwierdzić, że `_satellite.track()` wywołuje się poprawnie przy zmianie ścieżki i że zdarzenia pojawiają się w debuggerze Adobe Analytics.
5. **Katalog zdarzeń:** Zdefiniuj pełny katalog zdarzeń z zespołem produktowym przed implementacją — jakie działania warto śledzić, konwencje nazewnictwa i taksonomia klasyfikacji.
6. **Zatwierdzenie DPP:** Uzyskaj pisemne zatwierdzenie DPP przed włączeniem w jakimkolwiek klastrze produkcyjnym.

---

## 11. Referencje

- [Dokumentacja Adobe Experience Platform Tags](https://experienceleague.adobe.com/docs/experience-platform/tags/home.html)
- [Przewodnik po śledzeniu SPA w Adobe Analytics](https://experienceleague.adobe.com/docs/analytics/implementation/vars/page-vars/pagename.html)
- [Adobe Web SDK (alloy.js)](https://experienceleague.adobe.com/docs/experience-platform/web-sdk/home.html)
- [Śledzenie bezplikowe Adobe Analytics (s_fid)](https://experienceleague.adobe.com/docs/core-services/interface/data-collection/cookies/analytics.html)
- [Usługa ECID i demdex.net](https://experienceleague.adobe.com/docs/id-service/using/intro/cookies.html)
- [CSP i skrypty zewnętrzne (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- Powiązany issue: [#4186 — Count Kyma Dashboard users via Cloud Run Logs](https://github.com/kyma-project/busola/issues/4186) — alternatywne podejście telemetryczne przez analitykę logów po stronie serwera (bez zmian CSP, bez wymaganej zgody)

---

## Załącznik: Minimalny PoC — śledzenie wyświetleń stron end-to-end

Ten PoC można uruchomić lokalnie, gdy dostępny będzie staging kod osadzenia Launch. Do struktury kodu nie jest potrzebny tenant produkcyjny.

**Krok 1 — Lokalny test `index.html`** (pominięcie feature flag dla izolowanego PoC):

```html
<!-- Dodaj tymczasowo do index.html tylko na potrzeby PoC -->
<script
  src="https://assets.adobedtm.com/STAGING_PROPERTY_EMBED.min.js"
  async
></script>
```

**Krok 2 — Włącz Adobe Analytics Extension Debugger** w Chrome: zainstaluj rozszerzenie [Adobe Experience Platform Debugger](https://chrome.google.com/webstore/detail/adobe-experience-platform/bfnnokhpnncpkdmbokanobigaccjkpob).

**Krok 3 — Dodaj tymczasowe wywołanie śledzenia** do `App.tsx`:

```ts
// Tymczasowy PoC — usuń przed mergem
useEffect(() => {
  if (typeof window._satellite !== 'undefined') {
    window._satellite.track('page-view', {
      pageName: window.location.pathname,
    });
  }
}, []);
```

**Krok 4 — Zweryfikuj** w Adobe Debugger, że zdarzenie `page-view` pojawia się w zakładce Events z poprawną wartością `pageName`.

To potwierdza działanie potoku integracji przed inwestycją w pełną implementację.
